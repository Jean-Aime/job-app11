-- ============================================================================
-- JOBLINK AFRICA - SEED DATA (SQL VERSION)
-- Run this directly in Neon SQL Editor if Node.js connection fails
-- ============================================================================

-- Password hash for "Test123!" (pre-computed)
-- Use this for all test accounts

-- ============================================================================
-- STEP 1: CREATE ADMIN USER
-- ============================================================================

INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
VALUES (
  gen_random_uuid(),
  'admin@joblink.com',
  'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  'admin',
  true,
  true,
  'verified'
);

-- ============================================================================
-- STEP 2: CREATE EMPLOYERS
-- ============================================================================

DO $$
DECLARE
  emp_user_id UUID;
BEGIN
  -- Employer 1: TechCorp Africa
  emp_user_id := gen_random_uuid();
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (emp_user_id, 'employer1@joblink.com', 'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'employer', true, true, 'verified');
  
  INSERT INTO employers (user_id, company_name, industry, company_size, company_description, verification_status, is_verified, city, country, website)
  VALUES (emp_user_id, 'TechCorp Africa', 'Information Technology', '201-500', 'Leading tech company in West Africa', 'approved', true, 'Lagos', 'Nigeria', 'https://www.techcorpafrica.com');

  -- Employer 2: HealthPlus Nigeria
  emp_user_id := gen_random_uuid();
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (emp_user_id, 'employer2@joblink.com', 'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'employer', true, true, 'verified');
  
  INSERT INTO employers (user_id, company_name, industry, company_size, company_description, verification_status, is_verified, city, country, website)
  VALUES (emp_user_id, 'HealthPlus Nigeria', 'Healthcare', '501-1000', 'Premier healthcare provider', 'approved', true, 'Abuja', 'Nigeria', 'https://www.healthplusnigeria.com');

  -- Employer 3: FinServe Solutions
  emp_user_id := gen_random_uuid();
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (emp_user_id, 'employer3@joblink.com', 'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'employer', true, true, 'verified');
  
  INSERT INTO employers (user_id, company_name, industry, company_size, company_description, verification_status, is_verified, city, country, website)
  VALUES (emp_user_id, 'FinServe Solutions', 'Financial Services', '51-200', 'Innovative fintech solutions', 'approved', true, 'Lagos', 'Nigeria', 'https://www.finservesolutions.com');

  -- Employer 4: EduLearn Africa
  emp_user_id := gen_random_uuid();
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (emp_user_id, 'employer4@joblink.com', 'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'employer', true, true, 'verified');
  
  INSERT INTO employers (user_id, company_name, industry, company_size, company_description, verification_status, is_verified, city, country, website)
  VALUES (emp_user_id, 'EduLearn Africa', 'Education', '51-200', 'EdTech platform for African students', 'approved', true, 'Abuja', 'Nigeria', 'https://www.edulearnafrica.com');

  -- Employer 5: BuildRight Construction
  emp_user_id := gen_random_uuid();
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (emp_user_id, 'employer5@joblink.com', 'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'employer', true, true, 'verified');
  
  INSERT INTO employers (user_id, company_name, industry, company_size, company_description, verification_status, is_verified, city, country, website)
  VALUES (emp_user_id, 'BuildRight Construction', 'Construction', '101-500', 'Major construction company', 'approved', true, 'Port Harcourt', 'Nigeria', 'https://www.buildrightconstruction.com');
END $$;

-- ============================================================================
-- STEP 3: CREATE JOB SEEKERS
-- ============================================================================

DO $$
DECLARE
  seeker_user_id UUID;
  seeker_profile_id UUID;
  js_skill_id UUID;
  react_skill_id UUID;
  nodejs_skill_id UUID;
  sql_skill_id UUID;
BEGIN
  -- Get skill IDs
  SELECT id INTO js_skill_id FROM skills WHERE name = 'JavaScript' LIMIT 1;
  SELECT id INTO react_skill_id FROM skills WHERE name = 'React' LIMIT 1;
  SELECT id INTO nodejs_skill_id FROM skills WHERE name = 'Node.js' LIMIT 1;
  SELECT id INTO sql_skill_id FROM skills WHERE name = 'SQL' LIMIT 1;

  -- Job Seeker 1: Adewale Johnson
  seeker_user_id := gen_random_uuid();
  seeker_profile_id := gen_random_uuid();
  
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (seeker_user_id, 'jobseeker1@joblink.com', 'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'job_seeker', true, true, 'verified');
  
  INSERT INTO job_seekers (id, user_id, full_name, phone_number, city, country, current_occupation, years_of_experience, availability, profile_completion_score)
  VALUES (seeker_profile_id, seeker_user_id, 'Adewale Johnson', '+2348012345678', 'Lagos', 'Nigeria', 'Software Developer', 5, 'immediately', 75);
  
  -- Add skills
  IF js_skill_id IS NOT NULL THEN
    INSERT INTO job_seeker_skills (job_seeker_id, skill_id, proficiency_level) VALUES (seeker_profile_id, js_skill_id, 'expert');
  END IF;
  IF react_skill_id IS NOT NULL THEN
    INSERT INTO job_seeker_skills (job_seeker_id, skill_id, proficiency_level) VALUES (seeker_profile_id, react_skill_id, 'advanced');
  END IF;

  -- Job Seeker 2: Chidinma Okonkwo
  seeker_user_id := gen_random_uuid();
  seeker_profile_id := gen_random_uuid();
  
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (seeker_user_id, 'jobseeker2@joblink.com', 'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'job_seeker', true, true, 'verified');
  
  INSERT INTO job_seekers (id, user_id, full_name, phone_number, city, country, current_occupation, years_of_experience, availability, profile_completion_score)
  VALUES (seeker_profile_id, seeker_user_id, 'Chidinma Okonkwo', '+2348123456789', 'Abuja', 'Nigeria', 'Registered Nurse', 3, 'immediately', 68);

  -- Job Seeker 3: Emeka Nwankwo
  seeker_user_id := gen_random_uuid();
  seeker_profile_id := gen_random_uuid();
  
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (seeker_user_id, 'jobseeker3@joblink.com', 'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'job_seeker', true, true, 'verified');
  
  INSERT INTO job_seekers (id, user_id, full_name, phone_number, city, country, current_occupation, years_of_experience, availability, profile_completion_score)
  VALUES (seeker_profile_id, seeker_user_id, 'Emeka Nwankwo', '+2348234567890', 'Lagos', 'Nigeria', 'Financial Analyst', 4, 'immediately', 72);

END $$;

-- ============================================================================
-- STEP 4: CREATE JOBS
-- ============================================================================

DO $$
DECLARE
  employer1_id UUID;
  employer2_id UUID;
  employer3_id UUID;
  tech_category_id UUID;
  healthcare_category_id UUID;
  finance_category_id UUID;
  job_id UUID;
BEGIN
  -- Get employer IDs
  SELECT user_id INTO employer1_id FROM employers WHERE company_name = 'TechCorp Africa' LIMIT 1;
  SELECT user_id INTO employer2_id FROM employers WHERE company_name = 'HealthPlus Nigeria' LIMIT 1;
  SELECT user_id INTO employer3_id FROM employers WHERE company_name = 'FinServe Solutions' LIMIT 1;
  
  -- Get category IDs
  SELECT id INTO tech_category_id FROM job_categories WHERE name = 'Technology & IT' LIMIT 1;
  SELECT id INTO healthcare_category_id FROM job_categories WHERE name = 'Healthcare' LIMIT 1;
  SELECT id INTO finance_category_id FROM job_categories WHERE name = 'Finance & Accounting' LIMIT 1;

  -- Job 1: Senior Full Stack Developer
  job_id := gen_random_uuid();
  INSERT INTO jobs (
    id, employer_id, category_id, title, description, requirements, benefits,
    employment_type, experience_level, salary_min, salary_max, salary_currency,
    city, location, country, is_remote, status, view_count, latitude, longitude
  ) VALUES (
    job_id, employer1_id, tech_category_id,
    'Senior Full Stack Developer',
    'We are seeking an experienced Full Stack Developer to join our growing team. You will work on cutting-edge web applications using React, Node.js, and PostgreSQL.',
    '5+ years experience in web development, Strong knowledge of JavaScript/TypeScript, Experience with React and Node.js, Understanding of database design',
    'Competitive salary, Health insurance, Remote work option, Professional development budget',
    'full_time', 'senior', 300000, 500000, 'NGN',
    'Lagos', 'Lagos, Nigeria', 'Nigeria', true, 'active', 145, 6.5244, 3.3792
  );

  -- Job 2: Registered Nurse
  job_id := gen_random_uuid();
  INSERT INTO jobs (
    id, employer_id, category_id, title, description, requirements, benefits,
    employment_type, experience_level, salary_min, salary_max, salary_currency,
    city, location, country, is_remote, status, view_count, latitude, longitude
  ) VALUES (
    job_id, employer2_id, healthcare_category_id,
    'Registered Nurse',
    'Join our healthcare team as a Registered Nurse. Provide quality patient care in a modern facility.',
    'Valid nursing license, 2+ years clinical experience, Strong communication skills, Ability to work shifts',
    'Health insurance, Paid time off, Continuing education support, Shift differentials',
    'full_time', 'mid', 150000, 250000, 'NGN',
    'Abuja', 'Abuja, Nigeria', 'Nigeria', false, 'active', 89, 9.0765, 7.3986
  );

  -- Job 3: Financial Analyst
  job_id := gen_random_uuid();
  INSERT INTO jobs (
    id, employer_id, category_id, title, description, requirements, benefits,
    employment_type, experience_level, salary_min, salary_max, salary_currency,
    city, location, country, is_remote, status, view_count, latitude, longitude
  ) VALUES (
    job_id, employer3_id, finance_category_id,
    'Financial Analyst',
    'Analyze financial data, prepare reports, and provide insights to support business decisions.',
    'Bachelor degree in Finance/Accounting, 3+ years experience, Strong Excel skills, Knowledge of financial modeling',
    'Competitive salary, Performance bonuses, Health insurance, Career growth opportunities',
    'full_time', 'mid', 200000, 350000, 'NGN',
    'Lagos', 'Lagos, Nigeria', 'Nigeria', false, 'active', 112, 6.5244, 3.3792
  );

  -- Job 4: Digital Marketing Specialist
  job_id := gen_random_uuid();
  INSERT INTO jobs (
    id, employer_id, category_id, title, description, requirements, benefits,
    employment_type, experience_level, salary_min, salary_max, salary_currency,
    city, location, country, is_remote, status, view_count, latitude, longitude
  ) VALUES (
    job_id, employer1_id, (SELECT id FROM job_categories WHERE name = 'Marketing & Sales' LIMIT 1),
    'Digital Marketing Specialist',
    'Develop and execute digital marketing campaigns across multiple channels.',
    '3+ years digital marketing experience, Google Ads certified, Strong analytics skills, Social media expertise',
    'Remote work, Performance bonuses, Training opportunities, Modern tools',
    'full_time', 'mid', 180000, 300000, 'NGN',
    'Lagos', 'Lagos, Nigeria', 'Nigeria', true, 'active', 78, 6.5244, 3.3792
  );

  -- Job 5: Data Analyst
  job_id := gen_random_uuid();
  INSERT INTO jobs (
    id, employer_id, category_id, title, description, requirements, benefits,
    employment_type, experience_level, salary_min, salary_max, salary_currency,
    city, location, country, is_remote, status, view_count, latitude, longitude
  ) VALUES (
    job_id, employer1_id, tech_category_id,
    'Data Analyst',
    'Analyze business data, create dashboards, and provide actionable insights.',
    '3+ years data analysis experience, Strong SQL skills, Python/R knowledge, Data visualization expertise',
    'Remote work, Competitive salary, Learning budget, Latest tools',
    'full_time', 'mid', 250000, 400000, 'NGN',
    'Lagos', 'Lagos, Nigeria', 'Nigeria', true, 'active', 95, 6.5244, 3.3792
  );

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check what was created
SELECT 'Users created:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Employers created:', COUNT(*) FROM employers
UNION ALL
SELECT 'Job Seekers created:', COUNT(*) FROM job_seekers
UNION ALL
SELECT 'Jobs created:', COUNT(*) FROM jobs WHERE status = 'active';

-- Show all test accounts
SELECT 
  'Test Account' as type,
  email,
  role,
  'Test123!' as password
FROM users
WHERE email LIKE '%@joblink.com'
ORDER BY role, email;

-- ============================================================================
-- DONE!
-- ============================================================================

-- You can now login with:
-- Admin: admin@joblink.com / Test123!
-- Employers: employer1-5@joblink.com / Test123!
-- Job Seekers: jobseeker1-3@joblink.com / Test123!
