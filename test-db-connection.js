/**
 * Database Connection Test Script
 * Run: node test-db-connection.js
 */

// Load environment variables
require('dotenv').config();

const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  console.log('🔍 Testing Neon Database Connection...\n');

  const dbUrl = process.env.EXPO_PUBLIC_NEON_DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ EXPO_PUBLIC_NEON_DATABASE_URL not found in .env file');
    process.exit(1);
  }

  console.log('📋 Connection String (masked):');
  console.log(dbUrl.replace(/:[^:@]+@/, ':****@') + '\n');

  try {
    const sql = neon(dbUrl);

    // Test 1: Basic connection
    console.log('Test 1: Basic Connection');
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Connected successfully!');
    console.log('   PostgreSQL Version:', result[0].pg_version.split(' ')[0] + ' ' + result[0].pg_version.split(' ')[1]);
    console.log('   Server Time:', result[0].current_time);
    console.log();

    // Test 2: Check if tables exist
    console.log('Test 2: Table Schema Check');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. You need to run migrations.');
      console.log('   Run: psql $DATABASE_URL -f supabase/migrations/...');
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    }
    console.log();

    // Test 3: Count records in key tables
    const keyTables = ['users', 'job_categories', 'jobs', 'applications'];
    console.log('Test 3: Record Counts');
    
    for (const table of keyTables) {
      try {
        const count = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
        console.log(`✅ ${table}: ${count[0].count} records`);
      } catch (err) {
        console.log(`❌ ${table}: Table not found or query failed`);
      }
    }
    console.log();

    console.log('🎉 Database connection test completed successfully!');
    console.log('✨ Your app should be able to fetch data from the database.');

  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your database URL in .env file');
    console.error('2. Ensure your Neon database is active (not in sleep mode)');
    console.error('3. Verify network connectivity');
    console.error('4. Check if SSL mode is correctly set');
    process.exit(1);
  }
}

testConnection();
