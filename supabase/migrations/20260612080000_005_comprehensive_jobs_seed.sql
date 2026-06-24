-- ================================================
-- REALISTIC JOB POSTINGS SEED DATA
-- ================================================
-- This file creates complete job postings with all fields populated
-- to properly demonstrate the job details screen functionality

-- First, ensure we have test employers
DO $$
DECLARE
  v_user_id_1 UUID;
  v_user_id_2 UUID;
  v_user_id_3 UUID;
  v_employer_id_1 UUID;
  v_employer_id_2 UUID;
  v_employer_id_3 UUID;
  v_category_tech UUID;
  v_category_health UUID;
  v_category_finance UUID;
  v_skill_js UUID;
  v_skill_react UUID;
  v_skill_nodejs UUID;
  v_skill_python UUID;
  v_skill_sql UUID;
  v_skill_communication UUID;
  v_skill_leadership UUID;
  v_skill_patient_care UUID;
  v_skill_accounting UUID;
  v_job_id_1 UUID;
  v_job_id_2 UUID;
  v_job_id_3 UUID;
BEGIN

  -- Get category IDs
  SELECT id INTO v_category_tech FROM job_categories WHERE name = 'Technology & IT';
  SELECT id INTO v_category_health FROM job_categories WHERE name = 'Healthcare';
  SELECT id INTO v_category_finance FROM job_categories WHERE name = 'Finance & Accounting';

  -- Get skill IDs
  SELECT id INTO v_skill_js FROM skills WHERE name = 'JavaScript';
  SELECT id INTO v_skill_react FROM skills WHERE name = 'React';
  SELECT id INTO v_skill_nodejs FROM skills WHERE name = 'Node.js';
  SELECT id INTO v_skill_python FROM skills WHERE name = 'Python';
  SELECT id INTO v_skill_sql FROM skills WHERE name = 'SQL';
  SELECT id INTO v_skill_communication FROM skills WHERE name = 'Communication';
  SELECT id INTO v_skill_leadership FROM skills WHERE name = 'Team Leadership';
  SELECT id INTO v_skill_patient_care FROM skills WHERE name = 'Patient Care';
  SELECT id INTO v_skill_accounting FROM skills WHERE name = 'Accounting';

  -- Create Test Employer 1: Tech Startup
  INSERT INTO users (email, phone, role, is_verified, verification_status, is_active, password_hash)
  VALUES ('techstartup@example.com', '+250788111222', 'employer', true, 'approved', true, 'dummy_hash')
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO v_user_id_1;

  INSERT INTO employers (
    user_id, company_name, registration_number, tax_number, industry, website,
    company_description, address, city, country, latitude, longitude,
    contact_person_name, contact_person_phone, contact_person_email,
    verification_status, is_verified, employee_count, founded_year
  ) VALUES (
    v_user_id_1,
    'AfriTech Solutions Ltd',
    'RW-2024-001234',
    'TAX-123456789',
    'Software Development',
    'https://www.afritechsolutions.rw',
    'AfriTech Solutions is a leading software development company in Rwanda, specializing in mobile and web applications for enterprises across Africa. We build innovative solutions that drive digital transformation.',
    '23 KG 15 Ave, Kigali Heights',
    'Kigali',
    'Rwanda',
    -1.9441,
    30.0619,
    'Jean Paul Nkusi',
    '+250788111222',
    'jp.nkusi@afritechsolutions.rw',
    'approved',
    true,
    45,
    2020
  )
  ON CONFLICT (user_id) DO UPDATE SET company_name = EXCLUDED.company_name
  RETURNING id INTO v_employer_id_1;

  -- Create Test Employer 2: Hospital
  INSERT INTO users (email, phone, role, is_verified, verification_status, is_active, password_hash)
  VALUES ('kigalihospital@example.com', '+250788333444', 'employer', true, 'approved', true, 'dummy_hash')
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO v_user_id_2;

  INSERT INTO employers (
    user_id, company_name, registration_number, industry, website,
    company_description, address, city, country, latitude, longitude,
    contact_person_name, contact_person_phone, contact_person_email,
    verification_status, is_verified, employee_count, founded_year
  ) VALUES (
    v_user_id_2,
    'Kigali Medical Center',
    'RW-2024-005678',
    'Healthcare',
    'https://www.kigalimedical.rw',
    'Kigali Medical Center is a premier healthcare facility offering comprehensive medical services. We are committed to providing world-class healthcare to our community with state-of-the-art equipment and highly trained medical professionals.',
    'KN 5 Ave, Nyarugenge',
    'Kigali',
    'Rwanda',
    -1.9536,
    30.0606,
    'Dr. Grace Mukamana',
    '+250788333444',
    'hr@kigalimedical.rw',
    'approved',
    true,
    120,
    2015
  )
  ON CONFLICT (user_id) DO UPDATE SET company_name = EXCLUDED.company_name
  RETURNING id INTO v_employer_id_2;

  -- Create Test Employer 3: Financial Services
  INSERT INTO users (email, phone, role, is_verified, verification_status, is_active, password_hash)
  VALUES ('financegroup@example.com', '+250788555666', 'employer', true, 'approved', true, 'dummy_hash')
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO v_user_id_3;

  INSERT INTO employers (
    user_id, company_name, registration_number, industry, website,
    company_description, address, city, country, latitude, longitude,
    contact_person_name, contact_person_phone, contact_person_email,
    verification_status, is_verified, employee_count, founded_year
  ) VALUES (
    v_user_id_3,
    'East Africa Finance Group',
    'RW-2024-009876',
    'Financial Services',
    'https://www.eafg.rw',
    'East Africa Finance Group provides comprehensive financial services including corporate banking, investment advisory, and wealth management across East Africa. We are committed to financial inclusion and economic development.',
    'KG 11 Ave, Kacyiru',
    'Kigali',
    'Rwanda',
    -1.9450,
    30.0940,
    'Samuel Habimana',
    '+250788555666',
    'careers@eafg.rw',
    'approved',
    true,
    85,
    2018
  )
  ON CONFLICT (user_id) DO UPDATE SET company_name = EXCLUDED.company_name
  RETURNING id INTO v_employer_id_3;

  -- ================================================
  -- JOB 1: Senior Full-Stack Developer
  -- ================================================
  INSERT INTO jobs (
    employer_id,
    title,
    description,
    category_id,
    employment_type,
    required_experience_years,
    salary_min,
    salary_max,
    salary_currency,
    location,
    city,
    country,
    latitude,
    longitude,
    address,
    is_remote,
    deadline,
    status,
    positions_available,
    positions_filled,
    view_count
  ) VALUES (
    v_employer_id_1,
    'Senior Full-Stack Developer',
    E'We are seeking a talented Senior Full-Stack Developer to join our growing engineering team at AfriTech Solutions.\n\nKey Responsibilities:\n• Design, develop, and maintain scalable web and mobile applications using React, React Native, and Node.js\n• Collaborate with product managers and designers to implement new features\n• Write clean, maintainable, and well-documented code\n• Mentor junior developers and conduct code reviews\n• Participate in architecture decisions and technical planning\n• Optimize application performance and troubleshoot issues\n• Implement automated testing and CI/CD pipelines\n\nWhat We Offer:\n• Competitive salary with performance bonuses\n• Health insurance coverage\n• Professional development budget\n• Flexible working hours and remote work options\n• Modern office space in Kigali Heights\n• Collaborative and innovative work environment\n• Opportunity to work on impactful projects across Africa\n\nWork Schedule: Monday to Friday, 8:00 AM - 5:00 PM (Flexible)\n\nHow to Apply:\nSubmit your application through our platform. Shortlisted candidates will be contacted within 2 weeks.',
    v_category_tech,
    'full_time',
    4,
    3500000,
    5000000,
    'RWF',
    '23 KG 15 Ave, Kigali Heights',
    'Kigali',
    'Rwanda',
    -1.9441,
    30.0619,
    '23 KG 15 Ave, Kigali Heights, Kigali',
    false,
    (CURRENT_DATE + INTERVAL '30 days')::DATE,
    'active',
    2,
    0,
    142
  ) RETURNING id INTO v_job_id_1;

  -- Add required skills for Job 1
  INSERT INTO job_skills (job_id, skill_id, is_required, minimum_years) VALUES
  (v_job_id_1, v_skill_js, true, 4),
  (v_job_id_1, v_skill_react, true, 3),
  (v_job_id_1, v_skill_nodejs, true, 3),
  (v_job_id_1, v_skill_sql, true, 2),
  (v_job_id_1, v_skill_communication, true, 0),
  (v_job_id_1, v_skill_leadership, false, 1);

  -- ================================================
  -- JOB 2: Registered Nurse
  -- ================================================
  INSERT INTO jobs (
    employer_id,
    title,
    description,
    category_id,
    employment_type,
    required_experience_years,
    salary_min,
    salary_max,
    salary_currency,
    location,
    city,
    country,
    latitude,
    longitude,
    address,
    is_remote,
    deadline,
    status,
    positions_available,
    positions_filled,
    view_count
  ) VALUES (
    v_employer_id_2,
    'Registered Nurse - ICU Department',
    E'Kigali Medical Center is seeking experienced Registered Nurses to join our Intensive Care Unit (ICU).\n\nKey Responsibilities:\n• Provide high-quality nursing care to critically ill patients\n• Monitor patient vital signs and administer medications\n• Operate and maintain life-support equipment\n• Collaborate with doctors and healthcare team members\n• Maintain accurate patient records and documentation\n• Respond to medical emergencies effectively\n• Educate patients and families on care procedures\n• Ensure compliance with hospital policies and safety standards\n\nRequired Qualifications:\n• Bachelor of Science in Nursing (BSN) or equivalent\n• Valid nursing license from Rwanda Medical Council\n• Minimum 3 years of ICU experience\n• BLS and ACLS certification required\n• Strong clinical assessment skills\n• Excellent communication and interpersonal skills\n• Ability to work under pressure in critical situations\n\nWhat We Offer:\n• Competitive salary with night shift allowances\n• Comprehensive health insurance\n• Continuing education and training opportunities\n• Supportive work environment\n• Modern medical facilities and equipment\n• Career advancement opportunities\n\nShift: Rotating 12-hour shifts including nights and weekends',
    v_category_health,
    'full_time',
    3,
    2800000,
    3800000,
    'RWF',
    'KN 5 Ave, Nyarugenge',
    'Kigali',
    'Rwanda',
    -1.9536,
    30.0606,
    'KN 5 Ave, Nyarugenge, Kigali',
    false,
    (CURRENT_DATE + INTERVAL '21 days')::DATE,
    'active',
    3,
    0,
    87
  ) RETURNING id INTO v_job_id_2;

  -- Add required skills for Job 2
  INSERT INTO job_skills (job_id, skill_id, is_required, minimum_years) VALUES
  (v_job_id_2, v_skill_patient_care, true, 3),
  (v_job_id_2, v_skill_communication, true, 2);

  -- ================================================
  -- JOB 3: Financial Analyst
  -- ================================================
  INSERT INTO jobs (
    employer_id,
    title,
    description,
    category_id,
    employment_type,
    required_experience_years,
    salary_min,
    salary_max,
    salary_currency,
    location,
    city,
    country,
    latitude,
    longitude,
    address,
    is_remote,
    deadline,
    status,
    positions_available,
    positions_filled,
    view_count
  ) VALUES (
    v_employer_id_3,
    'Financial Analyst - Corporate Finance',
    E'East Africa Finance Group is hiring a Financial Analyst to support our corporate finance division.\n\nKey Responsibilities:\n• Conduct financial analysis and modeling for investment decisions\n• Prepare financial reports, forecasts, and presentations\n• Analyze market trends and competitor performance\n• Support due diligence for mergers and acquisitions\n• Monitor financial performance against budgets and KPIs\n• Collaborate with senior management on strategic planning\n• Ensure compliance with financial regulations\n• Develop and maintain financial databases and systems\n\nRequired Qualifications:\n• Bachelor''s degree in Finance, Accounting, or Economics\n• CPA or CFA Level 1 preferred\n• 2+ years of experience in financial analysis or corporate finance\n• Advanced Excel skills and financial modeling expertise\n• Knowledge of financial software (SAP, QuickBooks, etc.)\n• Strong analytical and problem-solving abilities\n• Excellent written and verbal communication\n• Attention to detail and ability to work with large datasets\n\nWhat We Offer:\n• Competitive salary package\n• Performance-based bonuses\n• Health and life insurance\n• Professional certification support (CFA/CPA)\n• Modern office environment\n• Opportunities for regional travel\n• Clear career progression path\n\nWork Schedule: Monday to Friday, 8:30 AM - 5:30 PM',
    v_category_finance,
    'full_time',
    2,
    3000000,
    4200000,
    'RWF',
    'KG 11 Ave, Kacyiru',
    'Kigali',
    'Rwanda',
    -1.9450,
    30.0940,
    'KG 11 Ave, Kacyiru, Kigali',
    false,
    (CURRENT_DATE + INTERVAL '25 days')::DATE,
    'active',
    1,
    0,
    63
  ) RETURNING id INTO v_job_id_3;

  -- Add required skills for Job 3
  INSERT INTO job_skills (job_id, skill_id, is_required, minimum_years) VALUES
  (v_job_id_3, v_skill_accounting, true, 2),
  (v_job_id_3, v_skill_sql, false, 1),
  (v_job_id_3, v_skill_communication, true, 0);

  -- ================================================
  -- JOB 4: Remote Python Developer
  -- ================================================
  INSERT INTO jobs (
    employer_id,
    title,
    description,
    category_id,
    employment_type,
    required_experience_years,
    salary_min,
    salary_max,
    salary_currency,
    location,
    city,
    country,
    latitude,
    longitude,
    address,
    is_remote,
    deadline,
    status,
    positions_available,
    positions_filled,
    view_count
  ) VALUES (
    v_employer_id_1,
    'Python Developer (Remote)',
    E'Join our remote engineering team as a Python Developer working on data-driven applications.\n\nKey Responsibilities:\n• Develop and maintain Python-based backend services and APIs\n• Build data processing pipelines and analytics tools\n• Integrate with third-party APIs and cloud services\n• Write comprehensive unit and integration tests\n• Document code and technical specifications\n• Participate in agile development processes\n• Optimize application performance and scalability\n\nRequired Qualifications:\n• 3+ years of Python development experience\n• Strong knowledge of Django or Flask frameworks\n• Experience with REST API development\n• Proficiency in SQL and database design\n• Familiarity with Git version control\n• Experience with AWS, Azure, or GCP\n• Self-motivated and able to work independently\n• Excellent problem-solving skills\n\nNice to Have:\n• Experience with data science libraries (Pandas, NumPy)\n• Knowledge of Docker and Kubernetes\n• Experience with microservices architecture\n• Understanding of machine learning concepts\n\nWhat We Offer:\n• 100% remote work from anywhere in Africa\n• Competitive USD-based salary\n• Flexible working hours\n• Home office setup allowance\n• Learning and development budget\n• Annual team meetups\n• International exposure and collaboration',
    v_category_tech,
    'full_time',
    3,
    4000000,
    5500000,
    'RWF',
    'Remote - Africa',
    'Remote',
    'Rwanda',
    NULL,
    NULL,
    NULL,
    true,
    (CURRENT_DATE + INTERVAL '45 days')::DATE,
    'active',
    2,
    0,
    201
  );

  RAISE NOTICE 'Comprehensive job seed data created successfully!';

END $$;
