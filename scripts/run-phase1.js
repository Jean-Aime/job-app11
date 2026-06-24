require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Extract connection details from Neon URL
const connectionString = process.env.EXPO_PUBLIC_NEON_DATABASE_URL;
const pool = new Pool({ connectionString });

async function runPhase1() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 PHASE 1: DATABASE FOUNDATION\n');
    console.log('Creating service provider platform schema...\n');
    
    // Run main schema migration
    console.log('📄 Running: 007_phase1_service_provider_foundation.sql');
    const schemaPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260613000000_007_phase1_service_provider_foundation.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSQL);
    console.log('✅ Schema created successfully\n');
    
    // Run service categories seed
    console.log('📄 Running: 008_phase1_service_categories_seed.sql');
    const seedPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260613010000_008_phase1_service_categories_seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSQL);
    console.log('✅ Service categories seeded\n');
    
    // Verify tables
    console.log('🔍 Verifying database...\n');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'service_categories',
          'service_providers',
          'service_provider_skills',
          'service_requests',
          'service_provider_interests',
          'ratings_reviews',
          'provider_badges',
          'verification_documents'
        )
      ORDER BY table_name
    `);
    
    console.log('📊 Tables Created:');
    tablesResult.rows.forEach(t => console.log(`   ✓ ${t.table_name}`));
    
    // Count service categories
    const categoriesResult = await client.query('SELECT COUNT(*) as count FROM service_categories');
    console.log(`\n📋 Service Categories: ${categoriesResult.rows[0].count}`);
    
    // Show sample categories
    const sampleResult = await client.query(`
      SELECT name, hourly_rate_min, hourly_rate_max 
      FROM service_categories 
      ORDER BY name 
      LIMIT 10
    `);
    
    console.log('\n📌 Sample Categories:');
    sampleResult.rows.forEach(c => {
      const rate = `RWF ${(c.hourly_rate_min/1000).toFixed(1)}K - ${(c.hourly_rate_max/1000).toFixed(1)}K/hr`;
      console.log(`   • ${c.name} (${rate})`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ PHASE 1 COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   ✓ 8 new tables created`);
    console.log(`   ✓ ${categoriesResult.rows[0].count} service categories seeded`);
    console.log(`   ✓ Indexes and triggers configured`);
    console.log(`   ✓ Rating calculation functions ready`);
    console.log(`   ✓ Badge auto-assignment ready`);
    
    console.log('\n🎯 Next Steps:');
    console.log('   → Phase 2: Service Provider Registration UI');
    console.log('   → Phase 3: Verification System');
    console.log('   → Phase 4: Service Request Flow');
    console.log('   → Phase 5: Map Integration');
    console.log('   → Phase 6: Ratings & Reviews\n');
    
  } catch (error) {
    console.error('\n❌ Phase 1 failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runPhase1();
