require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function updateAllJobs() {
  try {
    console.log('🔄 Updating ALL existing jobs with complete details...\n');
    
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260612090000_006_update_all_jobs.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await sql(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify updates
    const jobs = await sql`
      SELECT 
        j.id, 
        j.title, 
        j.salary_min, 
        j.salary_max,
        j.deadline,
        j.positions_available,
        LENGTH(j.description) as desc_length,
        e.company_name,
        (SELECT COUNT(*) FROM job_skills WHERE job_id = j.id) as skill_count
      FROM jobs j
      JOIN employers e ON j.employer_id = e.id
      ORDER BY j.created_at DESC
      LIMIT 10
    `;
    
    console.log('📊 Updated Jobs Summary:\n');
    jobs.forEach((j, i) => {
      const salary = `RWF ${(j.salary_min/1000000).toFixed(1)}M - ${(j.salary_max/1000000).toFixed(1)}M`;
      console.log(`${i + 1}. ${j.title}`);
      console.log(`   ${j.company_name}`);
      console.log(`   💰 ${salary} | 📝 ${j.desc_length} chars | 🎯 ${j.skill_count} skills`);
      console.log(`   📅 Deadline: ${j.deadline} | 👥 ${j.positions_available} positions\n`);
    });
    
    const totals = await sql`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN salary_min IS NOT NULL THEN 1 END) as jobs_with_salary,
        COUNT(CASE WHEN deadline IS NOT NULL THEN 1 END) as jobs_with_deadline,
        COUNT(CASE WHEN LENGTH(description) > 100 THEN 1 END) as jobs_with_full_desc
      FROM jobs
    `;
    
    console.log('🎯 Database Status:');
    console.log(`   Total Jobs: ${totals[0].total_jobs}`);
    console.log(`   Jobs with Salary: ${totals[0].jobs_with_salary}`);
    console.log(`   Jobs with Deadline: ${totals[0].jobs_with_deadline}`);
    console.log(`   Jobs with Full Description: ${totals[0].jobs_with_full_desc}`);
    
    console.log('\n✨ All jobs now have complete details!');
    console.log('🔍 Refresh your app to see the updates.\n');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

updateAllJobs();
