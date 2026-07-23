/**
 * JobLink Africa - Database Migration Runner
 * Run: node run-migrations.js
 */
const { neon } = require('@neondatabase/serverless');

const DB_URL = 'postgresql://neondb_owner:npg_Vu0KSrmexk8c@ep-late-boat-atvpoeu8-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DB_URL);

async function run() {
  console.log('🚀 Running JobLink Africa migrations...\n');

  try {
    // ── 1. Extensions & Enums ──────────────────────────────────────────────
    console.log('Step 1: Extensions & Enums...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create enums only if they don't exist
    await sql`DO $$ BEGIN
      CREATE TYPE jl_user_role AS ENUM ('job_seeker', 'employer', 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`;

    await sql`DO $$ BEGIN
      CREATE TYPE jl_employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`;

    await sql`DO $$ BEGIN
      CREATE TYPE jl_application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'completed', 'withdrawn');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`;

    await sql`DO $$ BEGIN
      CREATE TYPE jl_verification_status AS ENUM ('pending', 'approved', 'rejected');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`;

    console.log('  ✅ Enums ready\n');

    // ── 2. Core Tables ─────────────────────────────────────────────────────
    console.log('Step 2: Core tables...');

    await sql`CREATE TABLE IF NOT EXISTS jl_users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role jl_user_role NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      verification_status jl_verification_status DEFAULT 'pending',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_job_seekers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES jl_users(id) ON DELETE CASCADE UNIQUE NOT NULL,
      full_name TEXT NOT NULL DEFAULT '',
      gender TEXT,
      date_of_birth DATE,
      nationality TEXT,
      phone_number TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      current_occupation TEXT,
      years_of_experience INTEGER DEFAULT 0,
      availability TEXT DEFAULT 'immediately',
      profile_photo_url TEXT,
      resume_url TEXT,
      profile_completion_score INTEGER DEFAULT 0,
      bio TEXT,
      languages TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_employers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES jl_users(id) ON DELETE CASCADE UNIQUE NOT NULL,
      company_name TEXT NOT NULL DEFAULT '',
      registration_number TEXT,
      tax_number TEXT,
      industry TEXT,
      website TEXT,
      company_description TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      contact_person_name TEXT,
      contact_person_phone TEXT,
      contact_person_email TEXT,
      company_logo_url TEXT,
      verification_status jl_verification_status DEFAULT 'pending',
      is_verified BOOLEAN DEFAULT FALSE,
      employee_count INTEGER,
      founded_year INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_skills (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT UNIQUE NOT NULL,
      category TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_job_seeker_skills (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_seeker_id UUID REFERENCES jl_job_seekers(id) ON DELETE CASCADE,
      skill_id UUID REFERENCES jl_skills(id) ON DELETE CASCADE,
      proficiency_level INTEGER DEFAULT 3,
      years_of_experience INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(job_seeker_id, skill_id)
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_certificates (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_seeker_id UUID REFERENCES jl_job_seekers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      issuing_organization TEXT,
      issue_date DATE,
      expiry_date DATE,
      certificate_url TEXT,
      credential_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_experiences (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_seeker_id UUID REFERENCES jl_job_seekers(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      location TEXT,
      start_date DATE NOT NULL,
      end_date DATE,
      is_current BOOLEAN DEFAULT FALSE,
      description TEXT,
      skills_used TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_verification_documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES jl_users(id) ON DELETE CASCADE,
      document_type TEXT NOT NULL,
      document_url TEXT NOT NULL,
      verification_status jl_verification_status DEFAULT 'pending',
      reviewed_at TIMESTAMPTZ,
      reviewed_by UUID REFERENCES jl_users(id),
      rejection_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_job_categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      parent_id UUID REFERENCES jl_job_categories(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_jobs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      employer_id UUID REFERENCES jl_employers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id UUID REFERENCES jl_job_categories(id),
      employment_type jl_employment_type NOT NULL,
      required_experience_years INTEGER DEFAULT 0,
      salary_min DECIMAL(12, 2),
      salary_max DECIMAL(12, 2),
      salary_currency TEXT DEFAULT 'RWF',
      location TEXT,
      city TEXT,
      country TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      address TEXT,
      is_remote BOOLEAN DEFAULT FALSE,
      deadline TIMESTAMPTZ,
      status TEXT DEFAULT 'active',
      positions_available INTEGER DEFAULT 1,
      positions_filled INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_job_skills (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID REFERENCES jl_jobs(id) ON DELETE CASCADE,
      skill_id UUID REFERENCES jl_skills(id) ON DELETE CASCADE,
      is_required BOOLEAN DEFAULT TRUE,
      minimum_years INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(job_id, skill_id)
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_applications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID REFERENCES jl_jobs(id) ON DELETE CASCADE,
      job_seeker_id UUID REFERENCES jl_job_seekers(id) ON DELETE CASCADE,
      cover_letter TEXT,
      status jl_application_status DEFAULT 'pending',
      match_score DECIMAL(5, 2),
      skills_match DECIMAL(5, 2),
      location_match DECIMAL(5, 2),
      experience_match DECIMAL(5, 2),
      availability_match DECIMAL(5, 2),
      employer_notes TEXT,
      reviewed_at TIMESTAMPTZ,
      status_updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(job_id, job_seeker_id)
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_job_matches (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID REFERENCES jl_jobs(id) ON DELETE CASCADE,
      job_seeker_id UUID REFERENCES jl_job_seekers(id) ON DELETE CASCADE,
      match_score DECIMAL(5, 2) NOT NULL,
      skills_match DECIMAL(5, 2),
      location_match DECIMAL(5, 2),
      experience_match DECIMAL(5, 2),
      availability_match DECIMAL(5, 2),
      is_viewed BOOLEAN DEFAULT FALSE,
      is_applied BOOLEAN DEFAULT FALSE,
      calculated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(job_id, job_seeker_id)
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES jl_users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      data JSONB,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_activity_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES jl_users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id UUID,
      details JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS jl_saved_jobs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_seeker_id UUID REFERENCES jl_job_seekers(id) ON DELETE CASCADE,
      job_id UUID REFERENCES jl_jobs(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(job_seeker_id, job_id)
    )`;

    console.log('  ✅ All tables created\n');

    // ── 3. Indexes ─────────────────────────────────────────────────────────
    console.log('Step 3: Indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_jl_users_email ON jl_users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jl_users_role ON jl_users(role)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jl_job_seekers_user_id ON jl_job_seekers(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jl_employers_user_id ON jl_employers(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jl_jobs_employer_id ON jl_jobs(employer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jl_jobs_status ON jl_jobs(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jl_applications_job_id ON jl_applications(job_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jl_applications_job_seeker_id ON jl_applications(job_seeker_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jl_notifications_user_id ON jl_notifications(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jl_saved_jobs_seeker ON jl_saved_jobs(job_seeker_id)`;
    console.log('  ✅ Indexes created\n');

    // ── 4. Seed Data ───────────────────────────────────────────────────────
    console.log('Step 4: Seed data (categories & skills)...');

    const categories = [
      ['Technology & IT', 'Software development, IT support, cybersecurity, data science', 'Laptop'],
      ['Healthcare', 'Medical professionals, nursing, pharmacy, healthcare administration', 'Heart'],
      ['Finance & Accounting', 'Banking, accounting, financial analysis, insurance', 'DollarSign'],
      ['Education', 'Teaching, tutoring, educational administration', 'GraduationCap'],
      ['Engineering', 'Civil, mechanical, electrical, chemical engineering', 'Cog'],
      ['Marketing & Sales', 'Digital marketing, sales, brand management', 'TrendingUp'],
      ['Hospitality & Tourism', 'Hotels, restaurants, travel, event management', 'UtensilsCrossed'],
      ['Construction', 'Building, architecture, surveying, trades', 'Building'],
      ['Agriculture', 'Farming, agribusiness, veterinary, forestry', 'Leaf'],
      ['Transport & Logistics', 'Driving, warehousing, supply chain, shipping', 'Truck'],
      ['Manufacturing', 'Production, quality control, factory operations', 'Factory'],
      ['Legal', 'Lawyers, paralegals, compliance, legal support', 'Scale'],
      ['Creative & Design', 'Graphic design, writing, photography, arts', 'Palette'],
      ['Human Resources', 'Recruitment, training, HR management', 'Users'],
    ];

    for (const [name, description, icon] of categories) {
      await sql`INSERT INTO jl_job_categories (name, description, icon) VALUES (${name}, ${description}, ${icon}) ON CONFLICT (name) DO NOTHING`;
    }

    const skills = [
      ['JavaScript','Technology & IT'],['Python','Technology & IT'],['React','Technology & IT'],
      ['Node.js','Technology & IT'],['TypeScript','Technology & IT'],['SQL','Technology & IT'],
      ['Java','Technology & IT'],['Data Analysis','Technology & IT'],['Machine Learning','Technology & IT'],
      ['Cybersecurity','Technology & IT'],['Cloud Computing','Technology & IT'],['Mobile Development','Technology & IT'],
      ['DevOps','Technology & IT'],['Patient Care','Healthcare'],['Nursing','Healthcare'],
      ['Medical Diagnosis','Healthcare'],['Pharmacy','Healthcare'],['Laboratory Testing','Healthcare'],
      ['First Aid','Healthcare'],['Emergency Medicine','Healthcare'],['Financial Analysis','Finance & Accounting'],
      ['Accounting','Finance & Accounting'],['Tax Preparation','Finance & Accounting'],['Auditing','Finance & Accounting'],
      ['Budgeting','Finance & Accounting'],['Investment Analysis','Finance & Accounting'],['Banking Operations','Finance & Accounting'],
      ['Communication','Soft Skills'],['Problem Solving','Soft Skills'],['Team Leadership','Soft Skills'],
      ['Project Management','Soft Skills'],['Time Management','Soft Skills'],['Customer Service','Soft Skills'],
      ['Negotiation','Soft Skills'],['Critical Thinking','Soft Skills'],['AutoCAD','Engineering'],
      ['Civil Engineering','Engineering'],['Electrical Engineering','Engineering'],['Mechanical Engineering','Engineering'],
      ['Project Planning','Engineering'],['Quality Control','Engineering'],['Digital Marketing','Marketing & Sales'],
      ['Social Media Marketing','Marketing & Sales'],['SEO','Marketing & Sales'],['Content Marketing','Marketing & Sales'],
      ['Sales','Marketing & Sales'],['Market Research','Marketing & Sales'],['Brand Management','Marketing & Sales'],
      ['English','Languages'],['French','Languages'],['Kinyarwanda','Languages'],['Swahili','Languages'],
      ['Crop Management','Agriculture'],['Livestock Management','Agriculture'],['Farm Management','Agriculture'],
      ['Carpentry','Construction'],['Masonry','Construction'],['Plumbing','Construction'],
      ['Electrical Installation','Construction'],['Welding','Construction'],['Site Management','Construction'],
      ['Food Preparation','Hospitality & Tourism'],['Hotel Management','Hospitality & Tourism'],
      ['Event Planning','Hospitality & Tourism'],['Tour Guiding','Hospitality & Tourism'],
    ];

    for (const [name, category] of skills) {
      await sql`INSERT INTO jl_skills (name, category) VALUES (${name}, ${category}) ON CONFLICT (name) DO NOTHING`;
    }

    console.log('  ✅ Seed data inserted\n');

    // ── 5. updated_at trigger ──────────────────────────────────────────────
    console.log('Step 5: Triggers...');
    await sql`
      CREATE OR REPLACE FUNCTION jl_update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ language 'plpgsql'
    `;
    const triggerTables = ['jl_users','jl_job_seekers','jl_employers','jl_jobs'];
    for (const tbl of triggerTables) {
      await sql([`DROP TRIGGER IF EXISTS trg_${tbl}_updated_at ON ${tbl}`]);
      await sql([`CREATE TRIGGER trg_${tbl}_updated_at BEFORE UPDATE ON ${tbl} FOR EACH ROW EXECUTE FUNCTION jl_update_updated_at()`]);
    }
    console.log('  ✅ Triggers created\n');

    // ── 6. Verify ──────────────────────────────────────────────────────────
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'jl_%' ORDER BY table_name`;
    console.log('✅ Migration complete! JobLink tables:');
    tables.forEach(t => console.log('  -', t.table_name));

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

run();
