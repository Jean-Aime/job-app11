require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL);

async function runMigration() {
  try {
    console.log('🚀 Running comprehensive jobs seed data migration...\n');
    
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260612080000_005_comprehensive_jobs_seed.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await sql(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Created comprehensive job postings with:');
    console.log('   - 3 employers (Tech, Healthcare, Finance)');
    console.log('   - 4 detailed job postings');
    console.log('   - All job fields populated (salary, location, skills, etc.)');
    console.log('   - Realistic job descriptions and requirements');
    console.log('\n🔍 View jobs at: http://localhost:8081/jobs\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
