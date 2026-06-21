const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function seedComprehensiveData() {
  try {
    console.log('🌱 Seeding comprehensive data for JobLink Africa...\n');

    // Get existing data
    const users = await sql`SELECT id, email, role FROM users WHERE role IN ('job_seeker', 'employer')`;
    const jobs = await sql`SELECT id, employer_id, title FROM jobs LIMIT 19`;
    const jobSeekers = await sql`SELECT id, user_id FROM job_seekers`;
    const employers = await sql`SELECT id, user_id FROM employers`;
    const skills = await sql`SELECT id, name FROM skills LIMIT 20`;

    console.log(`📊 Found ${users.length} users, ${jobs.length} jobs, ${jobSeekers.length} job seekers`);

    // Get job seeker IDs
    const jobSeekerIds = jobSeekers.map(js => js.id);
    const jobIds = jobs.map(j => j.id);

    // =================== EXPERIENCES ===================
    console.log('\n💼 Adding work experiences...');
    const experiences = [
      { js: 0, title: 'Senior Software Engineer', company: 'Tech Solutions Ltd', years: 3, current: true },
      { js: 0, title: 'Software Developer', company: 'Digital Innovation Hub', years: 2, current: false },
      { js: 1, title: 'Marketing Manager', company: 'Brand Masters Agency', years: 4, current: true },
      { js: 1, title: 'Marketing Coordinator', company: 'Growth Marketing Co', years: 2, current: false },
      { js: 2, title: 'Data Analyst', company: 'Analytics Pro', years: 2, current: true },
      { js: 3, title: 'Graphic Designer', company: 'Creative Studio', years: 3, current: true },
      { js: 4, title: 'Sales Manager', company: 'Sales Force Inc', years: 5, current: true },
      { js: 5, title: 'Accountant', company: 'Finance Partners', years: 3, current: true },
      { js: 6, title: 'HR Coordinator', company: 'People Management Ltd', years: 2, current: true },
    ];

    for (const exp of experiences) {
      if (exp.js < jobSeekerIds.length) {
        await sql`
          INSERT INTO experiences (
            job_seeker_id, job_title, company_name, start_date, end_date, 
            is_current, description
          )
          VALUES (
            ${jobSeekerIds[exp.js]},
            ${exp.title},
            ${exp.company},
            ${new Date(Date.now() - exp.years * 365 * 24 * 60 * 60 * 1000).toISOString()},
            ${exp.current ? null : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()},
            ${exp.current},
            ${`Responsible for ${exp.title.toLowerCase()} duties at ${exp.company}`}
          )
        `;
      }
    }
    console.log(`✅ Added ${experiences.length} work experiences`);

    // =================== CERTIFICATES ===================
    console.log('\n🎓 Adding certificates...');
    const certificates = [
      { js: 0, name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', year: 2023 },
      { js: 0, name: 'React Native Developer', issuer: 'Meta', year: 2024 },
      { js: 1, name: 'Digital Marketing Certificate', issuer: 'Google', year: 2023 },
      { js: 2, name: 'Data Science Professional', issuer: 'IBM', year: 2024 },
      { js: 3, name: 'Adobe Certified Expert', issuer: 'Adobe', year: 2023 },
      { js: 4, name: 'Sales Leadership Program', issuer: 'Harvard Business School', year: 2022 },
      { js: 5, name: 'CPA Certification', issuer: 'ICPAR Rwanda', year: 2021 },
    ];

    for (const cert of certificates) {
      if (cert.js < jobSeekerIds.length) {
        await sql`
          INSERT INTO certificates (
            job_seeker_id, title, issuing_organization, 
            issue_date, expiry_date, credential_id
          )
          VALUES (
            ${jobSeekerIds[cert.js]},
            ${cert.name},
            ${cert.issuer},
            ${new Date(cert.year, 0, 1).toISOString()},
            ${null},
            ${`CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`}
          )
        `;
      }
    }
    console.log(`✅ Added ${certificates.length} certificates`);

    // =================== JOB SEEKER SKILLS ===================
    console.log('\n🛠️  Adding job seeker skills...');
    let skillCount = 0;
    for (let i = 0; i < Math.min(7, jobSeekerIds.length); i++) {
      const numSkills = 3 + Math.floor(Math.random() * 4); // 3-6 skills per person
      for (let j = 0; j < numSkills && j < skills.length; j++) {
        await sql`
          INSERT INTO job_seeker_skills (
            job_seeker_id, skill_id, proficiency_level, years_of_experience
          )
          VALUES (
            ${jobSeekerIds[i]},
            ${skills[j + (i * 2) % skills.length].id},
            ${1 + Math.floor(Math.random() * 4)},
            ${1 + Math.floor(Math.random() * 5)}
          )
          ON CONFLICT (job_seeker_id, skill_id) DO NOTHING
        `;
        skillCount++;
      }
    }
    console.log(`✅ Added ${skillCount} job seeker skills`);

    // =================== APPLICATIONS ===================
    console.log('\n📝 Adding job applications...');
    const statuses = ['pending', 'reviewed', 'shortlisted', 'interview', 'accepted', 'rejected'];
    let appCount = 0;
    
    for (let i = 0; i < Math.min(7, jobSeekerIds.length); i++) {
      const numApps = 2 + Math.floor(Math.random() * 4); // 2-5 applications per seeker
      for (let j = 0; j < numApps && j < jobIds.length; j++) {
        const jobIndex = (i * 3 + j) % jobIds.length;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const daysAgo = 1 + Math.floor(Math.random() * 30);
        
        await sql`
          INSERT INTO applications (
            job_id, job_seeker_id, status, cover_letter, applied_at
          )
          VALUES (
            ${jobIds[jobIndex]},
            ${jobSeekerIds[i]},
            ${status},
            ${`I am writing to express my strong interest in this position. With my background and experience, I believe I would be a great fit for your team.`},
            ${new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()}
          )
          ON CONFLICT DO NOTHING
        `;
        appCount++;
      }
    }
    console.log(`✅ Added ${appCount} job applications`);

    // =================== SAVED JOBS ===================
    console.log('\n⭐ Adding saved jobs...');
    let savedCount = 0;
    
    for (let i = 0; i < Math.min(7, jobSeekerIds.length); i++) {
      const numSaved = 2 + Math.floor(Math.random() * 4); // 2-5 saved jobs per seeker
      for (let j = 0; j < numSaved && j < jobIds.length; j++) {
        const jobIndex = (i * 2 + j + 5) % jobIds.length;
        
        await sql`
          INSERT INTO saved_jobs (job_id, job_seeker_id)
          VALUES (${jobIds[jobIndex]}, ${jobSeekerIds[i]})
          ON CONFLICT DO NOTHING
        `;
        savedCount++;
      }
    }
    console.log(`✅ Added ${savedCount} saved jobs`);

    // =================== JOB MATCHES ===================
    console.log('\n🎯 Calculating job matches...');
    let matchCount = 0;
    
    for (let i = 0; i < Math.min(7, jobSeekerIds.length); i++) {
      for (let j = 0; j < Math.min(10, jobIds.length); j++) {
        const skillScore = 60 + Math.floor(Math.random() * 35);
        const experienceScore = 50 + Math.floor(Math.random() * 45);
        const locationScore = 70 + Math.floor(Math.random() * 30);
        const overallScore = Math.floor((skillScore + experienceScore + locationScore) / 3);
        
        await sql`
          INSERT INTO job_matches (
            job_id, job_seeker_id, overall_score,
            skill_match_score, experience_match_score, location_match_score
          )
          VALUES (
            ${jobIds[j]},
            ${jobSeekerIds[i]},
            ${overallScore},
            ${skillScore},
            ${experienceScore},
            ${locationScore}
          )
          ON CONFLICT (job_id, job_seeker_id) DO UPDATE SET
            overall_score = ${overallScore},
            skill_match_score = ${skillScore},
            experience_match_score = ${experienceScore},
            location_match_score = ${locationScore},
            updated_at = CURRENT_TIMESTAMP
        `;
        matchCount++;
      }
    }
    console.log(`✅ Added ${matchCount} job matches`);

    // =================== NOTIFICATIONS ===================
    console.log('\n🔔 Adding notifications...');
    const notifications = [
      { user: 0, type: 'application_status', title: 'Application Update', message: 'Your application for Software Engineer has been reviewed' },
      { user: 0, type: 'new_match', title: 'New Job Match', message: 'We found 3 new jobs that match your profile!' },
      { user: 1, type: 'application_status', title: 'Interview Scheduled', message: 'You have been shortlisted for Marketing Manager position' },
      { user: 2, type: 'new_job', title: 'New Job Alert', message: 'New Data Analyst position posted in Kigali' },
    ];

    for (let i = 0; i < notifications.length && i < users.length; i++) {
      const notif = notifications[i];
      const jobSeekerUser = users.find(u => u.role === 'job_seeker');
      if (jobSeekerUser) {
        await sql`
          INSERT INTO notifications (
            user_id, type, title, message, is_read
          )
          VALUES (
            ${jobSeekerUser.id},
            ${notif.type},
            ${notif.title},
            ${notif.message},
            ${Math.random() > 0.5}
          )
        `;
      }
    }
    console.log(`✅ Added ${notifications.length} notifications`);

    // =================== FINAL COUNT ===================
    console.log('\n' + '='.repeat(60));
    console.log('📊 Final Database Summary:');
    console.log('='.repeat(60));
    
    const finalCounts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM jobs) as jobs,
        (SELECT COUNT(*) FROM applications) as applications,
        (SELECT COUNT(*) FROM saved_jobs) as saved_jobs,
        (SELECT COUNT(*) FROM job_matches) as matches,
        (SELECT COUNT(*) FROM experiences) as experiences,
        (SELECT COUNT(*) FROM certificates) as certificates,
        (SELECT COUNT(*) FROM job_seeker_skills) as skills,
        (SELECT COUNT(*) FROM notifications) as notifications
    `;
    
    const counts = finalCounts[0];
    console.log(`👥 Users: ${counts.users}`);
    console.log(`💼 Jobs: ${counts.jobs}`);
    console.log(`📝 Applications: ${counts.applications}`);
    console.log(`⭐ Saved Jobs: ${counts.saved_jobs}`);
    console.log(`🎯 Job Matches: ${counts.matches}`);
    console.log(`💼 Experiences: ${counts.experiences}`);
    console.log(`🎓 Certificates: ${counts.certificates}`);
    console.log(`🛠️  Job Seeker Skills: ${counts.skills}`);
    console.log(`🔔 Notifications: ${counts.notifications}`);
    console.log('='.repeat(60));
    
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n🎯 Now you can login and see:');
    console.log('   - Recommended jobs with match scores');
    console.log('   - Your applications with different statuses');
    console.log('   - Saved jobs');
    console.log('   - Complete profile with experience & certificates');
    console.log('   - Notifications');
    console.log('\n🔑 Login with: jobseeker1@joblink.com / Test123!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedComprehensiveData();
