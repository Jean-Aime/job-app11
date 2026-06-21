-- ============================================================================
-- JOBLINK AFRICA - COMPLETE SEED DATA
-- Run this in Neon SQL Editor
-- ============================================================================

-- First, let's check and add categories if they don't exist
INSERT INTO job_categories (name, description, icon) VALUES
('Technology & IT', 'Software development, IT support, cybersecurity, data science', 'Laptop'),
('Healthcare', 'Medical professionals, nursing, pharmacy, healthcare administration', 'Heart'),
('Finance & Accounting', 'Banking, accounting, financial analysis, insurance', 'DollarSign'),
('Education', 'Teaching, tutoring, educational administration', 'GraduationCap'),
('Engineering', 'Civil, mechanical, electrical, chemical engineering', 'Cog'),
('Marketing & Sales', 'Digital marketing, sales, brand management', 'TrendingUp'),
('Hospitality & Tourism', 'Hotels, restaurants, travel, event management', 'UtensilsCrossed'),
('Construction', 'Building, architecture, surveying, trades', 'Building'),
('Agriculture', 'Farming, agribusiness, veterinary, forestry', 'Leaf'),
('Transport & Logistics', 'Driving, warehousing, supply chain, shipping', 'Truck')
ON CONFLICT (name) DO NOTHING;

-- Add skills if they don't exist
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Technology & IT'),
('Python', 'Technology & IT'),
('React', 'Technology & IT'),
('Node.js', 'Technology & IT'),
('TypeScript', 'Technology & IT'),
('SQL', 'Technology & IT'),
('Data Analysis', 'Technology & IT'),
('Patient Care', 'Healthcare'),
('Nursing', 'Healthcare'),
('Financial Analysis', 'Finance & Accounting'),
('Accounting', 'Finance & Accounting'),
('Digital Marketing', 'Marketing & Sales'),
('SEO', 'Marketing & Sales'),
('Communication', 'Soft Skills'),
('Team Leadership', 'Soft Skills')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- CREATE TEST USERS AND PROFILES
-- ============================================================================

-- Admin User
INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
VALUES (
  gen_random_uuid(),
  'admin@joblink.com',
  'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  'admin',
  true,
  true,
  'approved'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- EMPLOYERS
-- ============================================================================

DO $$
DECLARE
  emp1_user_id UUID;
  emp1_id UUID;
  emp2_user_id UUID;
  emp2_id UUID;
  emp3_user_id UUID;
  emp3_id UUID;
BEGIN
  -- Employer 1: TechCorp Africa
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (
    gen_random_uuid(),
    'employer1@joblink.com',
    'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'employer',
    true,
    true,
    'approved'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO emp1_user_id;
  
  IF emp1_user_id IS NOT NULL THEN
    INSERT INTO employers (id, user_id, company_name, industry, company_description, verification_status, is_verified, city, country, website)
    VALUES (
      gen_random_uuid(),
      emp1_user_id,
      'TechCorp Africa',
      'Information Technology',
      'Leading tech company in West Africa specializing in software development and IT solutions.',
      'approved',
      true,
      'Lagos',
      'Nigeria',
      'https://www.techcorpafrica.com'
    );
  END IF;

  -- Employer 2: HealthPlus Nigeria
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (
    gen_random_uuid(),
    'employer2@joblink.com',
    'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'employer',
    true,
    true,
    'approved'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO emp2_user_id;
  
  IF emp2_user_id IS NOT NULL THEN
    INSERT INTO employers (id, user_id, company_name, industry, company_description, verification_status, is_verified, city, country, website)
    VALUES (
      gen_random_uuid(),
      emp2_user_id,
      'HealthPlus Nigeria',
      'Healthcare',
      'Premier healthcare provider offering quality medical services across Nigeria.',
      'approved',
      true,
      'Abuja',
      'Nigeria',
      'https://www.healthplusnigeria.com'
    );
  END IF;

  -- Employer 3: FinServe Solutions
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (
    gen_random_uuid(),
    'employer3@joblink.com',
    'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'employer',
    true,
    true,
    'approved'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO emp3_user_id;
  
  IF emp3_user_id IS NOT NULL THEN
    INSERT INTO employers (id, user_id, company_name, industry, company_description, verification_status, is_verified, city, country, website)
    VALUES (
      gen_random_uuid(),
      emp3_user_id,
      'FinServe Solutions',
      'Financial Services',
      'Innovative fintech solutions for businesses and individuals.',
      'approved',
      true,
      'Lagos',
      'Nigeria',
      'https://www.finservesolutions.com'
    );
  END IF;
END $$;

-- ============================================================================
-- JOB SEEKERS
-- ============================================================================

DO $$
DECLARE
  seeker1_user_id UUID;
  seeker1_id UUID;
  seeker2_user_id UUID;
  seeker2_id UUID;
  seeker3_user_id UUID;
  seeker3_id UUID;
BEGIN
  -- Job Seeker 1: Adewale Johnson
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (
    gen_random_uuid(),
    'jobseeker1@joblink.com',
    'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'job_seeker',
    true,
    true,
    'approved'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO seeker1_user_id;
  
  IF seeker1_user_id IS NOT NULL THEN
    INSERT INTO job_seekers (id, user_id, full_name, phone_number, city, country, current_occupation, years_of_experience, availability, profile_completion_score)
    VALUES (
      gen_random_uuid(),
      seeker1_user_id,
      'Adewale Johnson',
      '+2348012345678',
      'Lagos',
      'Nigeria',
      'Software Developer',
      5,
      'immediately',
      75
    )
    RETURNING id INTO seeker1_id;
    
    -- Add skills for Adewale
    IF seeker1_id IS NOT NULL THEN
      INSERT INTO job_seeker_skills (job_seeker_id, skill_id, proficiency_level, years_of_experience)
      SELECT seeker1_id, id, 4, 5 FROM skills WHERE name = 'JavaScript'
      ON CONFLICT DO NOTHING;
      
      INSERT INTO job_seeker_skills (job_seeker_id, skill_id, proficiency_level, years_of_experience)
      SELECT seeker1_id, id, 4, 3 FROM skills WHERE name = 'React'
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Job Seeker 2: Chidinma Okonkwo
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (
    gen_random_uuid(),
    'jobseeker2@joblink.com',
    'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'job_seeker',
    true,
    true,
    'approved'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO seeker2_user_id;
  
  IF seeker2_user_id IS NOT NULL THEN
    INSERT INTO job_seekers (id, user_id, full_name, phone_number, city, country, current_occupation, years_of_experience, availability, profile_completion_score)
    VALUES (
      gen_random_uuid(),
      seeker2_user_id,
      'Chidinma Okonkwo',
      '+2348123456789',
      'Abuja',
      'Nigeria',
      'Registered Nurse',
      3,
      'immediately',
      68
    );
  END IF;

  -- Job Seeker 3: Emeka Nwankwo
  INSERT INTO users (id, email, password_hash, role, is_verified, is_active, verification_status)
  VALUES (
    gen_random_uuid(),
    'jobseeker3@joblink.com',
    'f7c3bc1d808e04732adf679965ccc34ca7ae3441:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'job_seeker',
    true,
    true,
    'approved'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO seeker3_user_id;
  
  IF seeker3_user_id IS NOT NULL THEN
    INSERT INTO job_seekers (id, user_id, full_name, phone_number, city, country, current_occupation, years_of_experience, availability, profile_completion_score)
    VALUES (
      gen_random_uuid(),
      seeker3_user_id,
      'Emeka Nwankwo',
      '+2348234567890',
      'Lagos',
      'Nigeria',
      'Financial Analyst',
      4,
      'immediately',
      72
    );
  END IF;
END $$;

-- ============================================================================
-- JOBS
-- ============================================================================

DO $$
DECLARE
  emp1_id UUID;
  emp2_id UUID;
  emp3_id UUID;
  tech_cat_id UUID;
  healthcare_cat_id UUID;
  finance_cat_id UUID;
  marketing_cat_id UUID;
  job_id UUID;
BEGIN
  -- Get employer IDs
  SELECT id INTO emp1_id FROM employers WHERE company_name = 'TechCorp Africa' LIMIT 1;
  SELECT id INTO emp2_id FROM employers WHERE company_name = 'HealthPlus Nigeria' LIMIT 1;
  SELECT id INTO emp3_id FROM employers WHERE company_name = 'FinServe Solutions' LIMIT 1;
  
  -- Get category IDs
  SELECT id INTO tech_cat_id FROM job_categories WHERE name = 'Technology & IT' LIMIT 1;
  SELECT id INTO healthcare_cat_id FROM job_categories WHERE name = 'Healthcare' LIMIT 1;
  SELECT id INTO finance_cat_id FROM job_categories WHERE name = 'Finance & Accounting' LIMIT 1;
  SELECT id INTO marketing_cat_id FROM job_categories WHERE name = 'Marketing & Sales' LIMIT 1;

  IF emp1_id IS NOT NULL AND tech_cat_id IS NOT NULL THEN
    -- Job 1: Senior Full Stack Developer
    job_id := gen_random_uuid();
    INSERT INTO jobs (
      id, employer_id, category_id, title, description,
      employment_type, required_experience_years,
      salary_min, salary_max, salary_currency,
      city, location, country, is_remote, status, view_count,
      latitude, longitude
    ) VALUES (
      job_id, emp1_id, tech_cat_id,
      'Senior Full Stack Developer',
      'We are seeking an experienced Full Stack Developer to join our growing team. You will work on cutting-edge web applications using React, Node.js, and PostgreSQL. This role offers the opportunity to work on challenging projects and mentor junior developers.',
      'full_time', 5,
      300000, 500000, 'NGN',
      'Lagos', 'Victoria Island, Lagos', 'Nigeria', true, 'active', 145,
      6.5244, 3.3792
    );

    -- Add skills to job
    INSERT INTO job_skills (job_id, skill_id, is_required, minimum_years)
    SELECT job_id, id, true, 3 FROM skills WHERE name = 'JavaScript'
    ON CONFLICT DO NOTHING;
    
    INSERT INTO job_skills (job_id, skill_id, is_required, minimum_years)
    SELECT job_id, id, true, 2 FROM skills WHERE name = 'React'
    ON CONFLICT DO NOTHING;
  END IF;

  IF emp2_id IS NOT NULL AND healthcare_cat_id IS NOT NULL THEN
    -- Job 2: Registered Nurse
    INSERT INTO jobs (
      id, employer_id, category_id, title, description,
      employment_type, required_experience_years,
      salary_min, salary_max, salary_currency,
      city, location, country, is_remote, status, view_count,
      latitude, longitude
    ) VALUES (
      gen_random_uuid(), emp2_id, healthcare_cat_id,
      'Registered Nurse',
      'Join our healthcare team as a Registered Nurse. Provide quality patient care in a modern facility with state-of-the-art equipment. We offer excellent working conditions and opportunities for professional development.',
      'full_time', 2,
      150000, 250000, 'NGN',
      'Abuja', 'Central Area, Abuja', 'Nigeria', false, 'active', 89,
      9.0765, 7.3986
    );
  END IF;

  IF emp3_id IS NOT NULL AND finance_cat_id IS NOT NULL THEN
    -- Job 3: Financial Analyst
    INSERT INTO jobs (
      id, employer_id, category_id, title, description,
      employment_type, required_experience_years,
      salary_min, salary_max, salary_currency,
      city, location, country, is_remote, status, view_count,
      latitude, longitude
    ) VALUES (
      gen_random_uuid(), emp3_id, finance_cat_id,
      'Financial Analyst',
      'Analyze financial data, prepare reports, and provide insights to support business decisions. Work with cross-functional teams to drive financial performance and strategic initiatives.',
      'full_time', 3,
      200000, 350000, 'NGN',
      'Lagos', 'Ikeja, Lagos', 'Nigeria', false, 'active', 112,
      6.5952, 3.3375
    );
  END IF;

  IF emp1_id IS NOT NULL AND marketing_cat_id IS NOT NULL THEN
    -- Job 4: Digital Marketing Specialist
    INSERT INTO jobs (
      id, employer_id, category_id, title, description,
      employment_type, required_experience_years,
      salary_min, salary_max, salary_currency,
      city, location, country, is_remote, status, view_count,
      latitude, longitude
    ) VALUES (
      gen_random_uuid(), emp1_id, marketing_cat_id,
      'Digital Marketing Specialist',
      'Develop and execute digital marketing campaigns across multiple channels. Analyze campaign performance and optimize for better results. Remote work opportunity available.',
      'full_time', 3,
      180000, 300000, 'NGN',
      'Lagos', 'Remote', 'Nigeria', true, 'active', 78,
      6.5244, 3.3792
    );
  END IF;

  IF emp1_id IS NOT NULL AND tech_cat_id IS NOT NULL THEN
    -- Job 5: Data Analyst
    INSERT INTO jobs (
      id, employer_id, category_id, title, description,
      employment_type, required_experience_years,
      salary_min, salary_max, salary_currency,
      city, location, country, is_remote, status, view_count,
      latitude, longitude
    ) VALUES (
      gen_random_uuid(), emp1_id, tech_cat_id,
      'Data Analyst',
      'Analyze business data, create dashboards, and provide actionable insights. Work with SQL, Python, and modern BI tools to help drive data-informed decisions.',
      'full_time', 3,
      250000, 400000, 'NGN',
      'Lagos', 'Remote', 'Nigeria', true, 'active', 95,
      6.5244, 3.3792
    );
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Show results
SELECT 
  'Summary' as section,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM employers) as total_employers,
  (SELECT COUNT(*) FROM job_seekers) as total_job_seekers,
  (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs,
  (SELECT COUNT(*) FROM job_categories) as categories,
  (SELECT COUNT(*) FROM skills) as skills;

-- Show test accounts
SELECT 
  'Test Accounts' as info,
  email,
  role,
  'Test123!' as password
FROM users
WHERE email LIKE '%@joblink.com'
ORDER BY role DESC, email;

-- ============================================================================
-- SUCCESS!
-- Password for all accounts: Test123!
-- ============================================================================
