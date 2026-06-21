const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function checkAllData() {
  try {
    console.log('📊 Checking all database tables...\n');

    // Users
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`👥 Users: ${users[0].count}`);

    // Job Categories
    const categories = await sql`SELECT COUNT(*) as count FROM job_categories`;
    console.log(`📁 Categories: ${categories[0].count}`);

    // Skills
    const skills = await sql`SELECT COUNT(*) as count FROM skills`;
    console.log(`🛠️  Skills: ${skills[0].count}`);

    // Employers
    const employers = await sql`SELECT COUNT(*) as count FROM employers`;
    console.log(`🏢 Employers: ${employers[0].count}`);

    // Job Seekers
    const jobSeekers = await sql`SELECT COUNT(*) as count FROM job_seekers`;
    console.log(`👤 Job Seekers: ${jobSeekers[0].count}`);

    // Jobs
    const jobs = await sql`SELECT COUNT(*) as count FROM jobs`;
    console.log(`💼 Jobs: ${jobs[0].count}`);

    // Applications
    const applications = await sql`SELECT COUNT(*) as count FROM applications`;
    console.log(`📝 Applications: ${applications[0].count}`);

    // Saved Jobs
    const savedJobs = await sql`SELECT COUNT(*) as count FROM saved_jobs`;
    console.log(`⭐ Saved Jobs: ${savedJobs[0].count}`);

    // Job Matches
    const matches = await sql`SELECT COUNT(*) as count FROM job_matches`;
    console.log(`🎯 Job Matches: ${matches[0].count}`);

    // Experiences
    const experiences = await sql`SELECT COUNT(*) as count FROM experiences`;
    console.log(`💼 Experiences: ${experiences[0].count}`);

    // Certificates
    const certificates = await sql`SELECT COUNT(*) as count FROM certificates`;
    console.log(`🎓 Certificates: ${certificates[0].count}`);

    console.log('\n' + '='.repeat(50));

    if (jobs[0].count === '0') {
      console.log('\n❌ NO JOBS FOUND!');
      console.log('📝 You need to seed the database with comprehensive data.');
      console.log('\n🚀 Run: node seed-comprehensive.js');
    } else {
      console.log(`\n✅ Database has ${jobs[0].count} jobs`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAllData();
