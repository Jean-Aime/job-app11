-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('job_seeker', 'employer', 'admin');

-- Employment types enum
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');

-- Application status enum
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'completed', 'withdrawn');

-- Verification status enum
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table (base table for all user types)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status verification_status DEFAULT 'pending',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Seekers table
CREATE TABLE job_seekers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
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

-- Employers table
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
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

-- Skills master table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Seeker Skills (many-to-many)
CREATE TABLE job_seeker_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER DEFAULT 3, -- 1-5 scale
  years_of_experience INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_seeker_id, skill_id)
);

-- Certificates table
CREATE TABLE certificates (
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

-- Work Experience table
CREATE TABLE experiences (
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

-- Verification Documents table
CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'business_registration', 'tax_certificate', 'id_document', etc.
  document_url TEXT NOT NULL,
  verification_status verification_status DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Categories table
CREATE TABLE job_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES job_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
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
  status TEXT DEFAULT 'active', -- 'active', 'closed', 'draft', 'filled'
  positions_available INTEGER DEFAULT 1,
  positions_filled INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Required Skills (many-to-many)
CREATE TABLE job_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  minimum_years INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, skill_id)
);

-- Applications table
CREATE TABLE applications (
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

-- Job Matches table (pre-calculated matches)
CREATE TABLE job_matches (
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

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs table
CREATE TABLE activity_logs (
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

-- Saved Jobs table
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_seeker_id, job_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_job_seekers_user_id ON job_seekers(user_id);
CREATE INDEX idx_employers_user_id ON employers(user_id);
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_category ON jobs(category_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs USING GIST (point(latitude, longitude));
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_job_seeker_id ON applications(job_seeker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_job_matches_job_seeker ON job_matches(job_seeker_id);
CREATE INDEX idx_job_matches_job ON job_matches(job_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_job_seeker_skills_seeker ON job_seeker_skills(job_seeker_id);
CREATE INDEX idx_experiences_seeker ON experiences(job_seeker_id);