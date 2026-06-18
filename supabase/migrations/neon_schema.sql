-- ============================================================
-- JobLink Africa - Neon PostgreSQL Schema
-- Run this in: Neon Console > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('job_seeker', 'employer', 'admin');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'completed', 'withdrawn');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status verification_status DEFAULT 'pending',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Seekers
CREATE TABLE IF NOT EXISTS job_seekers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
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
);

-- Employers
CREATE TABLE IF NOT EXISTS employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
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
  verification_status verification_status DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT FALSE,
  employee_count INTEGER,
  founded_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Seeker Skills
CREATE TABLE IF NOT EXISTS job_seeker_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER DEFAULT 3,
  years_of_experience INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_seeker_id, skill_id)
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuing_organization TEXT,
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  credential_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiences
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  skills_used TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Documents
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  verification_status verification_status DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Categories
CREATE TABLE IF NOT EXISTS job_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES job_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES job_categories(id),
  employment_type employment_type NOT NULL,
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
);

-- Job Skills
CREATE TABLE IF NOT EXISTS job_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  minimum_years INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, skill_id)
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status application_status DEFAULT 'pending',
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
);

-- Job Matches
CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
  match_score DECIMAL(5, 2) NOT NULL,
  skills_match DECIMAL(5, 2),
  location_match DECIMAL(5, 2),
  experience_match DECIMAL(5, 2),
  availability_match DECIMAL(5, 2),
  is_viewed BOOLEAN DEFAULT FALSE,
  is_applied BOOLEAN DEFAULT FALSE,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, job_seeker_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_seeker_id, job_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_job_seekers_user_id ON job_seekers(user_id);
CREATE INDEX IF NOT EXISTS idx_employers_user_id ON employers(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_seeker_id ON applications(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_seeker_skills_seeker ON job_seeker_skills(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_experiences_seeker ON experiences(job_seeker_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_seekers_updated_at BEFORE UPDATE ON job_seekers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Seed Data ────────────────────────────────────────────────────────────────

INSERT INTO job_categories (name, description, icon) VALUES
('Technology & IT', 'Software development, IT support, cybersecurity, data science', 'Laptop'),
('Healthcare', 'Medical professionals, nursing, pharmacy', 'Heart'),
('Finance & Accounting', 'Banking, accounting, financial analysis', 'DollarSign'),
('Education', 'Teaching, tutoring, educational administration', 'GraduationCap'),
('Engineering', 'Civil, mechanical, electrical engineering', 'Cog'),
('Marketing & Sales', 'Digital marketing, sales, brand management', 'TrendingUp'),
('Hospitality & Tourism', 'Hotels, restaurants, travel, event management', 'UtensilsCrossed'),
('Construction', 'Building, architecture, surveying, trades', 'Building'),
('Agriculture', 'Farming, agribusiness, veterinary, forestry', 'Leaf'),
('Transport & Logistics', 'Driving, warehousing, supply chain', 'Truck'),
('Manufacturing', 'Production, quality control, factory operations', 'Factory'),
('Legal', 'Lawyers, paralegals, compliance', 'Scale'),
('Creative & Design', 'Graphic design, writing, photography', 'Palette'),
('Human Resources', 'Recruitment, training, HR management', 'Users')
ON CONFLICT (name) DO NOTHING;

INSERT INTO skills (name, category) VALUES
('JavaScript', 'Technology & IT'), ('Python', 'Technology & IT'), ('React', 'Technology & IT'),
('Node.js', 'Technology & IT'), ('TypeScript', 'Technology & IT'), ('SQL', 'Technology & IT'),
('Data Analysis', 'Technology & IT'), ('Machine Learning', 'Technology & IT'),
('Patient Care', 'Healthcare'), ('Nursing', 'Healthcare'), ('Medical Diagnosis', 'Healthcare'),
('Financial Analysis', 'Finance & Accounting'), ('Accounting', 'Finance & Accounting'),
('Communication', 'Soft Skills'), ('Problem Solving', 'Soft Skills'), ('Team Leadership', 'Soft Skills'),
('Project Management', 'Soft Skills'), ('Customer Service', 'Soft Skills'),
('Digital Marketing', 'Marketing & Sales'), ('Social Media Marketing', 'Marketing & Sales'),
('English', 'Languages'), ('French', 'Languages'), ('Kinyarwanda', 'Languages'), ('Swahili', 'Languages'),
('Carpentry', 'Construction'), ('Masonry', 'Construction'), ('Plumbing', 'Construction'),
('Crop Management', 'Agriculture'), ('Farm Management', 'Agriculture')
ON CONFLICT (name) DO NOTHING;
