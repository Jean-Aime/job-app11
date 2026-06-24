require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function addMissingSkills() {
  try {
    console.log('🔧 Adding missing skills to Python Developer job...\n');
    
    // Get the Python Developer job
    const pythonJob = await sql`
      SELECT j.id, j.title 
      FROM jobs j 
      JOIN employers e ON j.employer_id = e.id
      WHERE j.title LIKE '%Python%'
      LIMIT 1
    `;
    
    if (pythonJob.length === 0) {
      console.log('No Python Developer job found.');
      return;
    }
    
    const jobId = pythonJob[0].id;
    console.log(`Found: ${pythonJob[0].title}`);
    
    // Get skill IDs
    const skills = await sql`
      SELECT id, name FROM skills 
      WHERE name IN ('Python', 'SQL', 'Communication', 'Problem Solving')
    `;
    
    // Add skills to the job
    for (const skill of skills) {
      const minYears = skill.name === 'Python' ? 3 : skill.name === 'SQL' ? 1 : 0;
      const isRequired = skill.name === 'Python' || skill.name === 'Communication';
      
      await sql`
        INSERT INTO job_skills (job_id, skill_id, is_required, minimum_years)
        VALUES (${jobId}, ${skill.id}, ${isRequired}, ${minYears})
        ON CONFLICT (job_id, skill_id) DO NOTHING
      `;
      
      console.log(`✓ Added: ${skill.name} (${minYears}+ years, ${isRequired ? 'required' : 'optional'})`);
    }
    
    // Verify
    const jobSkills = await sql`
      SELECT s.name, js.minimum_years, js.is_required
      FROM job_skills js
      JOIN skills s ON js.skill_id = s.id
      WHERE js.job_id = ${jobId}
    `;
    
    console.log(`\n✅ Total skills for this job: ${jobSkills.length}`);
    console.log('\n🎉 Skills updated successfully!\n');
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

addMissingSkills();
