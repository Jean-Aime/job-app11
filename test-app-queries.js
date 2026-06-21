const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function testAppQueries() {
  try {
    console.log('🧪 Testing app queries...\n');

    // Get jobseeker1 ID
    const [jobSeeker] = await sql`
      SELECT js.id, js.full_name, u.email 
      FROM job_seekers js
      JOIN users u ON u.id = js.user_id
      WHERE u.email = 'jobseeker1@joblink.com'
    `;

    if (!jobSeeker) {
      console.log('❌ Job seeker not found!');
      return;
    }

    console.log(`✅ Job Seeker: ${jobSeeker.full_name} (${jobSeeker.email})`);
    console.log(`   ID: ${jobSeeker.id}\n`);

    // Test 1: Categories
    console.log('📁 Fetching categories...');
    const categories = await sql`SELECT * FROM job_categories LIMIT 8`;
    console.log(`   Found ${categories.length} categories\n`);

    // Test 2: Recent jobs with employer info
    console.log('💼 Fetching recent jobs with employer info...');
    const jobs = await sql`
      SELECT 
        j.*,
        e.company_name as employer_company_name,
        e.company_logo_url as employer_company_logo_url,
        c.name as category_name
      FROM jobs j
      LEFT JOIN employers e ON e.id = j.employer_id
      LEFT JOIN job_categories c ON c.id = j.category_id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
      LIMIT 10
    `;
    console.log(`   Found ${jobs.length} jobs`);
    if (jobs.length > 0) {
      console.log(`   Example: ${jobs[0].title} at ${jobs[0].employer_company_name || 'Unknown'}`);
    }
    console.log('');

    // Test 3: Job matches for this job seeker
    console.log('🎯 Fetching job matches...');
    const matches = await sql`
      SELECT 
        jm.match_score,
        j.*,
        e.company_name as employer_company_name,
        e.company_logo_url as employer_company_logo_url,
        c.name as category_name
      FROM job_matches jm
      JOIN jobs j ON j.id = jm.job_id
      LEFT JOIN employers e ON e.id = j.employer_id
      LEFT JOIN job_categories c ON c.id = j.category_id
      WHERE jm.job_seeker_id = ${jobSeeker.id}
      ORDER BY jm.match_score DESC
      LIMIT 5
    `;
    console.log(`   Found ${matches.length} matches`);
    if (matches.length > 0) {
      matches.forEach(m => {
        console.log(`   - ${m.title} (${Math.round(m.match_score)}% match)`);
      });
    }
    console.log('');

    // Test 4: Applications count
    console.log('📝 Counting applications...');
    const apps = await sql`
      SELECT COUNT(*) as count 
      FROM applications 
      WHERE job_seeker_id = ${jobSeeker.id}
    `;
    console.log(`   Applications: ${apps[0].count}\n`);

    // Test 5: Job matches count
    console.log('🎯 Counting job matches...');
    const matchCount = await sql`
      SELECT COUNT(*) as count 
      FROM job_matches 
      WHERE job_seeker_id = ${jobSeeker.id}
    `;
    console.log(`   Matches: ${matchCount[0].count}\n`);

    // Test 6: Saved jobs count
    console.log('⭐ Counting saved jobs...');
    const saved = await sql`
      SELECT COUNT(*) as count 
      FROM saved_jobs 
      WHERE job_seeker_id = ${jobSeeker.id}
    `;
    console.log(`   Saved: ${saved[0].count}\n`);

    console.log('='.repeat(60));
    console.log('✅ All queries successful!');
    console.log('\n📱 The app should display:');
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${jobs.length} recent jobs`);
    console.log(`   - ${matches.length} recommended jobs with match scores`);
    console.log(`   - Stats: ${apps[0].count} applications, ${matchCount[0].count} matches, ${saved[0].count} saved`);

  } catch (error) {
    console.error('\n❌ Query Error:', error.message);
    console.error(error);
  }
}

testAppQueries();
