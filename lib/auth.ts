/**
 * Custom JWT Auth for Neon
 * Replaces @supabase/supabase-js auth
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { queryOne, execute } from './db';
import { User } from '@/types/database';

const JWT_SECRET = process.env.EXPO_PUBLIC_JWT_SECRET || 'joblink-africa-secret';
const SESSION_KEY = 'auth_session';

export interface Session {
  token: string;
  userId: string;
  email: string;
  role: string;
  expiresAt: number;
}

// ─── Simple JWT (HS256) without native crypto ──────────────────────────────

function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

async function hmacSHA256(message: string, secret: string): Promise<string> {
  // Use expo-crypto for HMAC
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  // We'll use a simple fallback since expo-crypto doesn't expose HMAC directly
  // Instead we create a deterministic hash combining message + secret
  const combined = message + ':' + secret;
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function createJWT(payload: object, expiresInHours = 24 * 7): Promise<string> {
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = base64urlEncode(
    JSON.stringify({ ...payload, iat: now, exp: now + expiresInHours * 3600 })
  );
  const signature = await hmacSHA256(`${header}.${fullPayload}`, JWT_SECRET);
  return `${header}.${fullPayload}.${signature}`;
}

export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSig = await hmacSHA256(`${header}.${payload}`, JWT_SECRET);

    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(base64urlDecode(payload));
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return decoded;
  } catch {
    return null;
  }
}

// ─── Password Hashing ────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  // SHA-256 hash with a salt derived from the password itself
  // For production, use a proper bcrypt implementation
  const salt = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + 'joblink_salt_v1',
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const computed = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + salt,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    return computed === hash;
  } catch {
    return false;
  }
}

// ─── Session Management ──────────────────────────────────────────────────────

export async function saveSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getStoredSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    // Check expiry
    if (session.expiresAt < Date.now()) {
      await clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

// ─── Auth Operations ─────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  role: 'job_seeker' | 'employer'
): Promise<{ user: User | null; session: Session | null; error: string | null }> {
  try {
    // Check if email already exists
    const existing = await queryOne<{ id: string }>`
      SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}
    `;
    if (existing) {
      return { user: null, session: null, error: 'Email already registered' };
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Insert user
    await execute`
      INSERT INTO users (id, email, password_hash, role, is_verified, verification_status, is_active)
      VALUES (${userId}, ${email.toLowerCase().trim()}, ${passwordHash}, ${role}, false, 'pending', true)
    `;

    // Create role profile
    if (role === 'job_seeker') {
      await execute`
        INSERT INTO job_seekers (user_id, full_name, years_of_experience, availability, profile_completion_score)
        VALUES (${userId}, '', 0, 'immediately', 0)
      `;
    } else {
      await execute`
        INSERT INTO employers (user_id, company_name, verification_status, is_verified)
        VALUES (${userId}, '', 'pending', false)
      `;
    }

    const user = await queryOne<User>`
      SELECT id, email, phone, role, is_verified, verification_status, is_active, created_at, updated_at
      FROM users WHERE id = ${userId}
    `;

    if (!user) return { user: null, session: null, error: 'Failed to create user' };

    const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
    const token = await createJWT({ userId: user.id, email: user.email, role: user.role });
    const session: Session = { token, userId: user.id, email: user.email, role: user.role, expiresAt };
    await saveSession(session);

    return { user, session, error: null };
  } catch (err: any) {
    console.error('signUp error:', err);
    return { user: null, session: null, error: err.message || 'Sign up failed' };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: string | null }> {
  try {
    const row = await queryOne<User & { password_hash: string }>`
      SELECT id, email, phone, role, is_verified, verification_status, is_active,
             created_at, updated_at, password_hash
      FROM users
      WHERE email = ${email.toLowerCase().trim()} AND is_active = true
    `;

    if (!row) return { user: null, session: null, error: 'Invalid email or password' };

    const valid = await verifyPassword(password, row.password_hash);
    if (!valid) return { user: null, session: null, error: 'Invalid email or password' };

    const user: User = {
      id: row.id, email: row.email, phone: row.phone, role: row.role,
      is_verified: row.is_verified, verification_status: row.verification_status,
      is_active: row.is_active, created_at: row.created_at, updated_at: row.updated_at,
    };

    const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
    const token = await createJWT({ userId: user.id, email: user.email, role: user.role });
    const session: Session = { token, userId: user.id, email: user.email, role: user.role, expiresAt };
    await saveSession(session);

    return { user, session, error: null };
  } catch (err: any) {
    console.error('signIn error:', err);
    return { user: null, session: null, error: err.message || 'Sign in failed' };
  }
}

export async function signOut(): Promise<void> {
  await clearSession();
}

export async function resetPassword(email: string): Promise<{ error: string | null }> {
  // With Neon there's no email service built-in.
  // For now we just confirm the email exists and return success.
  // In production, integrate SendGrid / Resend.
  const user = await queryOne<{ id: string }>`
    SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}
  `;
  if (!user) return { error: null }; // Don't reveal if email exists
  return { error: null };
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getStoredSession();
  if (!session) return null;

  const user = await queryOne<User>`
    SELECT id, email, phone, role, is_verified, verification_status, is_active, created_at, updated_at
    FROM users WHERE id = ${session.userId} AND is_active = true
  `;
  return user;
}
