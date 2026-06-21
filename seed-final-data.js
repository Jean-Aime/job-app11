const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function seedComprehensive() {
  try {
    console.log('🌱 Seeding comprehensive data...\n');

    // Get existing data
    const users = await sql`SELECT id, email, role FROM users WHERE role IN ('job_seeker', 'employer')`;
    const jobs = await sql`SELECT id, employer_id, title FROM jobs LIMIT 19`;
    const jobSeekers = await sql`SELECT id, user_id FROM job_seekers`;
    const skills = await sql`SELECT id, name FROM skills LIMIT 20`;

    const jobSeekerIds = jobSeekers.map(js => js.id);
    const jobIds = jobs.map(j => j.id);

    console.log(`📊 Found ${jobSeekerIds.length} job seekers, ${jobIds.length} jobs\n`);

    // =================== EXPERIENCES (already added, skip) ===================
    console.log('💼 Experiences already added\n');

    // =================== CERTIFICATES (already added, skip) ===================
    console.log('🎓 Certificates already added\n');

    // =================== JOB SEEKER SKILLS (already added, skip) ===================
    console.log('🛠️  Skills already added\n');

    // =================== APPLICATIONS ===================
    console.log('📝 Adding job applications...');
    const statuses = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'];
    let appCount = 0;
    
    for (let i = 0; i < Math.min(7, jobSeekerIds.length); i++) {
      const numApps = 2 + Math.floor(Math.random() * 4); // 2-5 applications per seeker
      for (let j = 0; j < numApps && j < jobIds.length; j++) {
        const jobIndex = (i * 3 + j) % jobIds.length;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const matchScore = 60 + Math.floor(Math.random() * 35);
        
        await sql`
          INSERT INTO applications (
            job_id, job_seeker_id, status, cover_letter, match_score,
            skills_match, location_match, experience_match, availability_match
          )
          VALUES (
            ${jobIds[jobIndex]},
            ${jobSeekerIds[i]},
            ${status}::application_status,
            'I am very interested in this position and believe my skills align well with your requirements.',
            ${matchScore},
            ${60 + Math.floor(Math.random() * 35)},
            ${70 + Math.floor(Math.random() * 30)},
            ${50 + Math.floor(Math.random() * 45)},
            ${80 + Math.floor(Math.random() * 20)}
          )
          ON CONFLICT DO NOTHING
        `;
        appCount++;
      }
    }
    console.log(`✅ Added ${appCount} applications\n`);

    // =================== SAVED JOBS ===================
    console.log('⭐ Adding saved jobs...');
    let savedCount = 0;
    
    for (let i = 0; i < Math.min(7, jobSeekerIds.length); i++) {
      const numSaved = 2 + Math.floor(Math.random() * 4);
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
    console.log(`✅ Added ${savedCount} saved jobs\n`);

    // =================== JOB MATCHES ===================
    console.log('🎯 Calculating job matches...');
    let matchCount = 0;
    
    for (let i = 0; i < Math.min(7, jobSeekerIds.length); i++) {
      for (let j = 0; j < Math.min(10, jobIds.length); j++) {
        const skillsMatch = 60 + Math.floor(Math.random() * 35);
        const experienceMatch = 50 + Math.floor(Math.random() * 45);
        const locationMatch = 70 + Math.floor(Math.random() * 30);
        const availabilityMatch = 80 + Math.floor(Math.random() * 20);
        const matchScore = Math.floor((skillsMatch + experienceMatch + locationMatch + availabilityMatch) / 4);
        
        await sql`
          INSERT INTO job_matches (
            job_id, job_seeker_id, match_score,
            skills_match, experience_match, location_match, availability_match,
            is_viewed, is_applied
          )
          VALUES (
            ${jobIds[j]},
            ${jobSeekerIds[i]},
            ${matchScore},
            ${skillsMatch},
            ${experienceMatch},
            ${locationMatch},
            ${availabilityMatch},
            ${Math.random() > 0.5},
            ${Math.random() > 0.7}
          )
          ON CONFLICT (job_id, job_seeker_id) DO UPDATE SET
            match_score = ${matchScore},
            skills_match = ${skillsMatch},
            experience_match = ${experienceMatch},
            location_match = ${locationMatch},
            availability_match = ${availabilityMatch},
            calculated_at = CURRENT_TIMESTAMP
        `;
        matchCount++;
      }
    }
    console.log(`✅ Added ${matchCount} job matches\n`);

    // =================== NOTIFICATIONS ===================
    console.log('🔔 Adding notifications...');
    const jobSeekerUsers = users.filter(u => u.role === 'job_seeker').slice(0, 5);
    
    const notifications = [
      { type: 'application_status', title: 'Application Update', message: 'Your application has been reviewed' },
      { type: 'new_match', title: 'New Job Match', message: 'We found 3 new jobs matching your profile!' },
      { type: 'application_status', title: 'Interview Scheduled', message: 'You have been shortlisted' },
      { type: 'new_job', title: 'New Job Alert', message: 'New position posted in Kigali' },
      { type: 'profile_incomplete', title: 'Complete Your Profile', message: 'Add your experience to improve matches' },
    ];

    for (let i = 0; i < Math.min(notifications.length, jobSeekerUsers.length); i++) {
      await sql`
        INSERT INTO notifications (
          user_id, type, title, message, is_read
        )
        VALUES (
          ${jobSeekerUsers[i].id},
          ${notifications[i].type},
          ${notifications[i].title},
          ${notifications[i].message},
          ${Math.random() > 0.6}
        )
      `;
    }
    console.log(`✅ Added ${notifications.length} notifications\n`);

    // =================== FINAL COUNT ===================
    console.log('='.repeat(60));
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
    
    console.log('\n✨ Seeding completed!');
    console.log('\n🎯 Login with: jobseeker1@joblink.com / Test123!');
    console.log('\n📱 You should now see:');
    console.log('   ✅ Recommended jobs with match scores');
    console.log('   ✅ Your applications with status');
    console.log('   ✅ Saved jobs');
    console.log('   ✅ Complete profile with experience & certificates');
    console.log('   ✅ Notifications');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

seedComprehensive();
