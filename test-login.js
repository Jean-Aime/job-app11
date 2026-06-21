const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function testLogin() {
  try {
    console.log('🔍 Testing login functionality...\n');

    // 1. Check if users exist
    const users = await sql`SELECT email, role FROM users LIMIT 5`;
    console.log('✅ Users in database:', users.length);
    if (users.length > 0) {
      console.log('   Sample users:', users.map(u => `${u.email} (${u.role})`).join(', '));
    } else {
      console.log('❌ NO USERS FOUND! You need to seed the database.');
      console.log('\n📝 Run this command:');
      console.log('   npm run db:seed');
      return;
    }

    // 2. Check specific test account
    console.log('\n🔍 Checking jobseeker1@joblink.com account...');
    const testUser = await sql`
      SELECT id, email, role, password_hash, is_active 
      FROM users 
      WHERE email = 'jobseeker1@joblink.com'
    `;
    
    if (testUser.length === 0) {
      console.log('❌ Test account not found!');
      console.log('\n📝 To seed the database with test accounts:');
      console.log('   1. Open https://console.neon.tech');
      console.log('   2. Go to SQL Editor');
      console.log('   3. Copy the contents of seed-final.sql');
      console.log('   4. Paste and run it');
      return;
    }

    const user = testUser[0];
    console.log('✅ Test account found!');
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Active:', user.is_active);
    console.log('   Password Hash:', user.password_hash.substring(0, 50) + '...');

    // 3. Test password verification
    console.log('\n🔐 Testing password verification...');
    const testPassword = 'Test123!';
    
    // Recreate the password hash that should be in database
    const crypto = require('crypto');
    const salt = crypto.createHash('sha256').update(testPassword + 'joblink_salt_v1').digest('hex');
    const hash = crypto.createHash('sha256').update(testPassword + salt).digest('hex');
    const expectedHash = `${salt}:${hash}`;
    
    console.log('   Expected Hash:', expectedHash.substring(0, 50) + '...');
    console.log('   Database Hash:', user.password_hash.substring(0, 50) + '...');
    console.log('   Match:', expectedHash === user.password_hash ? '✅' : '❌');

    if (expectedHash !== user.password_hash) {
      console.log('\n⚠️  Password hash mismatch!');
      console.log('\n📝 The password in the database doesn\'t match the hashing algorithm.');
      console.log('   This means the seed data needs to be recreated with the correct hash.');
      console.log('\n✨ Creating updated seed SQL...');
      
      // Generate correct hashes for all test accounts
      const accounts = [
        { email: 'admin@joblink.com', role: 'admin' },
        ...Array.from({ length: 10 }, (_, i) => ({ 
          email: `employer${i + 1}@joblink.com`, 
          role: 'employer' 
        })),
        ...Array.from({ length: 10 }, (_, i) => ({ 
          email: `jobseeker${i + 1}@joblink.com`, 
          role: 'job_seeker' 
        })),
      ];

      console.log('\n🔑 Correct password hash for Test123!:');
      console.log(`   ${expectedHash}`);
      console.log('\n💡 Use this hash in your seed data!');
    } else {
      console.log('\n✅ Password hash is correct! Login should work.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
