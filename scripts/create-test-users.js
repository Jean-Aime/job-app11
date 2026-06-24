const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.EXPO_PUBLIC_NEON_DATABASE_URL 
});

const testUsers = [
  {
    email: 'jobseeker@test.com',
    password: 'Test123!',
    full_name: 'John Seeker',
    role: 'job_seeker',
    phone: '+250788000001'
  },
  {
    email: 'employer@test.com',
    password: 'Test123!',
    company_name: 'Tech Company Ltd',
    role: 'employer',
    phone: '+250788000002'
  },
  {
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '+250788000003'
  },
  {
    email: 'provider@test.com',
    password: 'Test123!',
    full_name: 'Mike Provider',
    role: 'service_provider',
    phone: '+250788000004'
  }
];

(async () => {
  try {
    console.log('Creating test users...\n');
    
    for (const user of testUsers) {
      const crypto = require('crypto');
      const hashedPassword = crypto.createHash('sha256').update(user.password).digest('hex');
      
      const result = await pool.query(`
        INSERT INTO users (email, password_hash, role, phone)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE 
        SET password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            phone = EXCLUDED.phone
        RETURNING id, email, role
      `, [user.email, hashedPassword, user.role, user.phone]);
      
      console.log(`✓ ${user.role}: ${user.email} / ${user.password}`);
      
      // Create job seeker profile
      if (user.role === 'job_seeker') {
        await pool.query(`
          INSERT INTO job_seekers (user_id, full_name, city, phone_number)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id) DO UPDATE
          SET full_name = EXCLUDED.full_name
        `, [result.rows[0].id, user.full_name, 'Kigali', user.phone]);
        console.log(`  → Job seeker profile created`);
      }
      
      // Create employer profile
      if (user.role === 'employer') {
        await pool.query(`
          INSERT INTO employers (user_id, company_name, city, contact_person_phone)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id) DO UPDATE
          SET company_name = EXCLUDED.company_name
        `, [result.rows[0].id, user.company_name, 'Kigali', user.phone]);
        console.log(`  → Employer profile created`);
      }
      
      // Create service provider profile
      if (user.role === 'service_provider') {
        await pool.query(`
          INSERT INTO service_providers (
            user_id, full_name, bio, hourly_rate, city, address, 
            phone_number, is_available, verification_level
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (user_id) DO UPDATE
          SET bio = EXCLUDED.bio,
              hourly_rate = EXCLUDED.hourly_rate
        `, [
          result.rows[0].id,
          user.full_name,
          'Experienced professional service provider',
          5000,
          'Kigali',
          'KG 123 St',
          user.phone,
          true,
          1
        ]);
        console.log(`  → Service provider profile created`);
      }
    }
    
    console.log('\n✅ All test users created successfully!');
    console.log('\nLogin credentials:');
    testUsers.forEach(u => {
      console.log(`${u.role.padEnd(20)} → ${u.email} / ${u.password}`);
    });
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
