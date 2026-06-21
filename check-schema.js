const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function checkSchema() {
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='job_seeker_skills' 
    ORDER BY ordinal_position
  `;
  console.log('job_seeker_skills table columns:');
  columns.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));
}

checkSchema();
