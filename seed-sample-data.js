/**
 * Quick Sample Data Seeder
 * Run: node seed-sample-data.js
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function seedSampleData() {
  console.log('🌱 Seeding sample data...\n');

  const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

  try {
    // Check if data already exists
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    if (existingUsers[0].count > 0) {
      console.log('⚠️  Database already has data. Skipping seed.');
      console.log(`   Found ${existingUsers[0].count} users`);
      return;
    }

    console.log('Step 1: Creating test users...');
    
    // Create test job seeker (password: Test123!)
    const seekerId = crypto.randomUUID();
    await sql`
      INSERT INTO users (id, email, password_hash, role, is_verified, is_active)
      VALUES (
        ${seekerId}, 
        'seeker@test.com',
        'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        'job_seeker',
        true,
        true
      )
    `;

    await sql`
      INSERT INTO job_seekers (user_id, full_name, phone, years_of_experience, current_occupation, availability, profile_completion_score)
      VALUES (
        ${seekerId},
        'John Doe',
        '+234123456789',
        5,
        'Software Developer',
        'immediately',
        75
      )
    `;

    // Create test employer (password: Test123!)
    const employerId = crypto.randomUUID();
    await sql`
      INSERT INTO users (id, email, password_hash, role, is_verified, is_active)
      VALUES (
        ${employerId},
        'employer@test.com',
        'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        'employer',
        true,
        true
      )
    `;

    await sql`
      INSERT INTO employers (user_id, company_name, industry, company_size, verification_status, is_verified)
      VALUES (
        ${employerId},
        'TechCorp Africa',
        'Information Technology',
        '51-200',
        'approved',
        true
      )
    `;

    console.log('✅ Test users created');
    console.log('   Job Seeker: seeker@test.com / Test123!');
    console.log('   Employer: employer@test.com / Test123!');

    // Create sample jobs
    console.log('\nStep 2: Creating sample jobs...');
    
    const jobCategories = await sql`SELECT id FROM job_categories LIMIT 3`;
    
    for (let i = 0; i < 5; i++) {
      const jobId = crypto.randomUUID();
      const category = jobCategories[i % jobCategories.length];
      
      await sql`
        INSERT INTO jobs (
          id, employer_id, category_id, title, description,
          employment_type, experience_level, salary_min, salary_max,
          salary_currency, city, location, country, is_remote,
          status, view_count
        ) VALUES (
          ${jobId},
          ${employerId},
          ${category.id},
          ${'Sample Job Title ' + (i + 1)},
          'This is a sample job description for testing purposes. Apply now!',
          ${['full_time', 'part_time', 'contract'][i % 3]},
          ${['entry', 'mid', 'senior'][i % 3]},
          ${50000 + i * 10000},
          ${100000 + i * 20000},
          'NGN',
          'Lagos',
          'Victoria Island, Lagos',
          'Nigeria',
          ${i % 2 === 0},
          'active',
          ${Math.floor(Math.random() * 100)}
        )
      `;
    }

    console.log('✅ Created 5 sample jobs');

    // Create sample application
    console.log('\nStep 3: Creating sample application...');
    const jobs = await sql`SELECT id FROM jobs LIMIT 1`;
    const appId = crypto.randomUUID();
    
    await sql`
      INSERT INTO applications (id, job_id, job_seeker_id, status)
      VALUES (${appId}, ${jobs[0].id}, ${seekerId}, 'pending')
    `;

    console.log('✅ Created 1 sample application');

    console.log('\n🎉 Sample data seeded successfully!');
    console.log('\n📱 You can now login with:');
    console.log('   Email: seeker@test.com or employer@test.com');
    console.log('   Password: Test123!');

  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
    console.error('\nMake sure migrations are applied first!');
    process.exit(1);
  }
}

seedSampleData();
