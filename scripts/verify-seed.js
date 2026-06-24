require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function verifyData() {
  try {
    console.log('🔍 Verifying seed data...\n');
    
    // Check employers
    const employers = await sql`SELECT company_name, industry, city FROM employers ORDER BY created_at DESC LIMIT 3`;
    console.log('✅ Employers created:');
    employers.forEach(e => console.log(`   - ${e.company_name} (${e.industry}) - ${e.city}`));
    
    // Check jobs
    const jobs = await sql`
      SELECT j.title, j.employment_type, j.salary_min, j.salary_max, 
             j.positions_available, j.is_remote, e.company_name
      FROM jobs j
      JOIN employers e ON j.employer_id = e.id
      ORDER BY j.created_at DESC LIMIT 4
    `;
    
    console.log('\n✅ Jobs created:');
    jobs.forEach(j => {
      const salary = `RWF ${(j.salary_min/1000000).toFixed(1)}M - ${(j.salary_max/1000000).toFixed(1)}M`;
      const location = j.is_remote ? 'Remote' : 'On-site';
      console.log(`   - ${j.title}`);
      console.log(`     ${j.company_name} | ${j.employment_type} | ${salary} | ${location}`);
    });
    
    // Check job skills
    const skillCount = await sql`
      SELECT COUNT(*) as count FROM job_skills
    `;
    console.log(`\n✅ Job skills linked: ${skillCount[0].count} skill requirements added`);
    
    console.log('\n🎉 All data verified successfully!');
    console.log('\n📱 Open your app and navigate to any job to see full details.\n');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyData();
