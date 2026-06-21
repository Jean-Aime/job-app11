const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function fixPasswords() {
  try {
    console.log('🔧 Fixing password hashes for all test accounts...\n');

    const correctHash = '044e654ad561c1705aa6870132a3cde018ba4043b9c571926d91d47a1be1b74e:1990354f97a221d252d5bd1d7d8a137a8e6f9569c70c1484560d0df9d6cce18a';

    // Update all test account passwords
    const result = await sql`
      UPDATE users 
      SET password_hash = ${correctHash}
      WHERE email IN (
        'admin@joblink.com',
        'employer1@joblink.com', 'employer2@joblink.com', 'employer3@joblink.com',
        'employer4@joblink.com', 'employer5@joblink.com', 'employer6@joblink.com',
        'employer7@joblink.com', 'employer8@joblink.com', 'employer9@joblink.com',
        'employer10@joblink.com',
        'jobseeker1@joblink.com', 'jobseeker2@joblink.com', 'jobseeker3@joblink.com',
        'jobseeker4@joblink.com', 'jobseeker5@joblink.com', 'jobseeker6@joblink.com',
        'jobseeker7@joblink.com', 'jobseeker8@joblink.com', 'jobseeker9@joblink.com',
        'jobseeker10@joblink.com'
      )
    `;

    console.log(`✅ Updated ${result.length || 0} user accounts\n`);

    // Verify
    const users = await sql`
      SELECT email, role,
        CASE 
          WHEN password_hash = ${correctHash} THEN '✅'
          ELSE '❌'
        END as status
      FROM users
      WHERE email LIKE '%joblink.com'
      ORDER BY role, email
    `;

    console.log('📊 Verification Results:\n');
    users.forEach(u => {
      console.log(`   ${u.status} ${u.email.padEnd(30)} (${u.role})`);
    });

    console.log('\n✨ All test accounts now use password: Test123!');
    console.log('\n🎯 Try logging in again with:');
    console.log('   Email: jobseeker1@joblink.com');
    console.log('   Password: Test123!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixPasswords();
