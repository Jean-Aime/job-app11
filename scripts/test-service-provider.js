require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.EXPO_PUBLIC_NEON_DATABASE_URL;
const pool = new Pool({ connectionString });

async function testServiceProvider() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing Service Provider Setup...\n');
    
    // Check if service_provider role exists
    const roleCheck = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'user_role'
    `);
    
    console.log('✅ Available user roles:', roleCheck.rows.map(r => r.enumlabel).join(', '));
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('service_providers', 'service_categories')
      ORDER BY table_name
    `);
    
    console.log('\n✅ Tables exist:', tables.rows.map(t => t.table_name).join(', '));
    
    // Count service categories
    const categories = await client.query('SELECT COUNT(*) FROM service_categories');
    console.log(`\n✅ Service categories: ${categories.rows[0].count}`);
    
    // Sample categories
    const sample = await client.query(`
      SELECT name, hourly_rate_min, hourly_rate_max 
      FROM service_categories 
      ORDER BY name 
      LIMIT 5
    `);
    
    console.log('\n📋 Sample Categories:');
    sample.rows.forEach(c => {
      console.log(`   • ${c.name} (RWF ${c.hourly_rate_min} - ${c.hourly_rate_max}/hr)`);
    });
    
    console.log('\n🎉 All systems ready!');
    console.log('\n📱 Try registering as a service provider in the app:');
    console.log('   1. Open app');
    console.log('   2. Choose "Service Provider" role');
    console.log('   3. Register with any email/password');
    console.log('   4. Complete your profile\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testServiceProvider();
