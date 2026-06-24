-- ================================================
-- UPDATE ALL EXISTING JOBS WITH COMPLETE DETAILS
-- ================================================

DO $$
DECLARE
  v_job RECORD;
  v_skill_js UUID;
  v_skill_react UUID;
  v_skill_nodejs UUID;
  v_skill_python UUID;
  v_skill_communication UUID;
BEGIN

  -- Get common skill IDs
  SELECT id INTO v_skill_js FROM skills WHERE name = 'JavaScript';
  SELECT id INTO v_skill_react FROM skills WHERE name = 'React';
  SELECT id INTO v_skill_nodejs FROM skills WHERE name = 'Node.js';
  SELECT id INTO v_skill_python FROM skills WHERE name = 'Python';
  SELECT id INTO v_skill_communication FROM skills WHERE name = 'Communication';

  -- Update all jobs with missing or incomplete data
  FOR v_job IN 
    SELECT j.id, j.title, j.employer_id, j.employment_type, e.city, e.country, e.latitude, e.longitude, e.address
    FROM jobs j
    JOIN employers e ON j.employer_id = e.id
    WHERE j.description IS NULL 
       OR j.description = '' 
       OR LENGTH(j.description) < 100
       OR j.salary_min IS NULL
       OR j.deadline IS NULL
  LOOP
    
    -- Update with comprehensive description
    UPDATE jobs SET
      description = E'We are seeking a talented professional to join our growing team.\n\n' ||
                    'Key Responsibilities:\n' ||
                    '• Collaborate with cross-functional teams to deliver high-quality results\n' ||
                    '• Contribute to project planning and execution\n' ||
                    '• Maintain professional standards and best practices\n' ||
                    '• Participate in continuous learning and skill development\n' ||
                    '• Support team members and foster a positive work environment\n' ||
                    '• Meet project deadlines and quality standards\n' ||
                    '• Communicate effectively with stakeholders\n\n' ||
                    'Required Qualifications:\n' ||
                    '• Relevant degree or equivalent experience\n' ||
                    '• Proven track record in similar roles\n' ||
                    '• Strong problem-solving and analytical skills\n' ||
                    '• Excellent communication abilities\n' ||
                    '• Self-motivated and able to work independently\n' ||
                    '• Team player with collaborative mindset\n\n' ||
                    'What We Offer:\n' ||
                    '• Competitive salary package\n' ||
                    '• Health insurance coverage\n' ||
                    '• Professional development opportunities\n' ||
                    '• Supportive work environment\n' ||
                    '• Career growth potential\n' ||
                    '• Modern workplace facilities\n\n' ||
                    'Work Schedule: Monday to Friday, 8:00 AM - 5:00 PM\n\n' ||
                    'How to Apply:\n' ||
                    'Submit your application through our platform. We review applications on a rolling basis.',
      
      salary_min = COALESCE(salary_min, 2500000),
      salary_max = COALESCE(salary_max, 4500000),
      salary_currency = COALESCE(salary_currency, 'RWF'),
      
      city = COALESCE(city, v_job.city, 'Kigali'),
      country = COALESCE(country, v_job.country, 'Rwanda'),
      latitude = COALESCE(latitude, v_job.latitude),
      longitude = COALESCE(longitude, v_job.longitude),
      address = COALESCE(address, v_job.address, v_job.city || ', ' || v_job.country),
      location = COALESCE(location, v_job.city || ', ' || v_job.country),
      
      deadline = COALESCE(deadline, (CURRENT_DATE + INTERVAL '30 days')::DATE),
      
      positions_available = COALESCE(positions_available, 1),
      positions_filled = COALESCE(positions_filled, 0),
      
      required_experience_years = COALESCE(required_experience_years, 2),
      
      view_count = COALESCE(view_count, 0)
      
    WHERE id = v_job.id;
    
    -- Add at least 2 skills to each job if they don't have any
    IF NOT EXISTS (SELECT 1 FROM job_skills WHERE job_id = v_job.id) THEN
      -- Add JavaScript/React for tech jobs
      IF v_skill_js IS NOT NULL AND v_skill_communication IS NOT NULL THEN
        INSERT INTO job_skills (job_id, skill_id, is_required, minimum_years) 
        VALUES 
          (v_job.id, v_skill_js, true, 2),
          (v_job.id, v_skill_communication, true, 0)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
    
  END LOOP;

  -- Ensure all employers have descriptions
  UPDATE employers 
  SET 
    company_description = COALESCE(
      company_description,
      company_name || ' is a leading company in ' || COALESCE(industry, 'our industry') || 
      '. We are committed to excellence and innovation, providing quality services to our clients and creating opportunities for talented professionals.'
    ),
    employee_count = COALESCE(employee_count, 50),
    founded_year = COALESCE(founded_year, 2020)
  WHERE company_description IS NULL OR company_description = '';

  RAISE NOTICE 'All jobs updated with complete details!';

END $$;
