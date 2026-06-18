/**
 * Neon PostgreSQL client
 * Uses @neondatabase/serverless with HTTP transport (fetch-based, works in React Native)
 */
import { neon, neonConfig } from '@neondatabase/serverless';

// Use fetch for HTTP transport — works on both native and web
neonConfig.fetchFunction = fetch;

const databaseUrl = process.env.EXPO_PUBLIC_NEON_DATABASE_URL || '';

if (!databaseUrl || databaseUrl.includes('YOURPASSWORD')) {
  console.warn('⚠️  EXPO_PUBLIC_NEON_DATABASE_URL not configured. Update your .env file.');
}

export const sql = neon(databaseUrl);

/** Run a tagged template query, returns array of rows */
export async function query<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  try {
    const rows = await sql(strings, ...values);
    return rows as T[];
  } catch (err: any) {
    console.error('[DB] Query error:', err.message);
    throw err;
  }
}

/** Run a tagged template query, returns first row or null */
export async function queryOne<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T | null> {
  const rows = await query<T>(strings, ...values);
  return rows[0] ?? null;
}

/** Run INSERT / UPDATE / DELETE without returning rows */
export async function execute(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<void> {
  try {
    await sql(strings, ...values);
  } catch (err: any) {
    console.error('[DB] Execute error:', err.message);
    throw err;
  }
}

export default sql;
