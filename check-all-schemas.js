const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function checkSchemas() {
  const tables = ['applications', 'saved_jobs', 'job_matches', 'experiences'];
  
  for (const table of tables) {
    console.log(`\n${table}:`);
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name=${table}
      ORDER BY ordinal_position
    `;
    columns.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));
  }
}

checkSchemas();
