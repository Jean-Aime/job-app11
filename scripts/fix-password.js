const crypto = require('crypto');
const { neon } = require('@neondatabase/serverless');
require('dotenv/config');

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function hashPassword(password) {
  const salt = crypto.createHash('sha256').update(password + 'joblink_salt_v1').digest('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

async function fixPassword() {
  const password = 'Test123!';
  const passwordHash = await hashPassword(password);
  
  console.log('\nUpdating password for provider@test.com...');
  
  await sql`
    UPDATE users 
    SET password_hash = ${passwordHash}
    WHERE email = 'provider@test.com'
  `;
  
  console.log('✅ Password updated successfully!');
  console.log('\nYou can now login with:');
  console.log('Email: provider@test.com');
  console.log('Password: Test123!');
}

fixPassword().catch(console.error);
