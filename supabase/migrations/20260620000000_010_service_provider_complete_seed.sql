-- ================================================
-- SERVICE PROVIDER COMPLETE SEED DATA
-- ================================================
-- Creates sample service requests and provider data for testing

-- ================================================
-- 1. Ensure Service Provider Profile Exists
-- ================================================
-- Update existing service provider profile with complete data
UPDATE service_providers 
SET 
  full_name = 'John Mukamazimpaka',
  phone_number = '+250788123456',
  address = 'KN 5 Ave, Kacyiru',
  city = 'Kigali',
  country = 'Rwanda',
  bio = 'Experienced professional service provider with over 5 years of experience in multiple trades. Specialized in plumbing, electrical work, and carpentry. Known for quality work and excellent customer service.',
  hourly_rate = 5000,
  verification_level = 2,
  is_verified = true,
  is_available = true,
  average_rating = 4.6,
  total_reviews = 23,
  total_jobs_completed = 47,
  response_rate = 92.5,
  profile_photo_url = NULL,
  updated_at = NOW()
WHERE user_id = 'c17f3782-84c2-4459-b235-eb69853bcce1';

-- Insert if not exists
INSERT INTO service_providers (
  user_id, full_name, phone_number, address, city, country, 
  bio, hourly_rate, verification_level, is_verified, is_available,
  average_rating, total_reviews, total_jobs_completed, response_rate
)
SELECT 
  'c17f3782-84c2-4459-b235-eb69853bcce1',
  'John Mukamazimpaka',
  '+250788123456',
  'KN 5 Ave, Kacyiru',
  'Kigali',
  'Rwanda',
  'Experienced professional service provider with over 5 years of experience in multiple trades. Specialized in plumbing, electrical work, and carpentry. Known for quality work and excellent customer service.',
  5000,
  2,
  true,
  true,
  4.6,
  23,
  47,
  92.5
WHERE NOT EXISTS (
  SELECT 1 FROM service_providers 
  WHERE user_id = 'c17f3782-84c2-4459-b235-eb69853bcce1'
);

-- ================================================
-- 2. Add Service Provider Skills
-- ================================================
INSERT INTO service_provider_skills (service_provider_id, service_category_id, experience_years, is_primary)
SELECT 
  sp.id,
  sc.id,
  CASE sc.name
    WHEN 'Plumbing' THEN 5
    WHEN 'Electrical Work' THEN 4
    WHEN 'Carpentry' THEN 3
    WHEN 'Painting' THEN 2
  END,
  CASE sc.name
    WHEN 'Plumbing' THEN true
    ELSE false
  END
FROM service_providers sp
CROSS JOIN service_categories sc
WHERE sp.user_id = 'c17f3782-84c2-4459-b235-eb69853bcce1'
AND sc.name IN ('Plumbing', 'Electrical Work', 'Carpentry', 'Painting')
ON CONFLICT (service_provider_id, service_category_id) DO UPDATE
SET 
  experience_years = EXCLUDED.experience_years,
  is_primary = EXCLUDED.is_primary;

-- ================================================
-- 3. Create Sample Job Seekers (Customers)
-- ================================================
-- Insert sample customers if they don't exist
INSERT INTO users (id, email, password_hash, role, created_at)
VALUES
  ('d1234567-89ab-cdef-0123-456789abcde1', 'customer1@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234', 'job_seeker', NOW()),
  ('d1234567-89ab-cdef-0123-456789abcde2', 'customer2@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234', 'job_seeker', NOW()),
  ('d1234567-89ab-cdef-0123-456789abcde3', 'customer3@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234', 'job_seeker', NOW()),
  ('d1234567-89ab-cdef-0123-456789abcde4', 'customer4@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234', 'job_seeker', NOW()),
  ('d1234567-89ab-cdef-0123-456789abcde5', 'customer5@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234', 'job_seeker', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert job seeker profiles
INSERT INTO job_seekers (user_id, full_name, phone_number, city, profile_photo_url)
VALUES
  ('d1234567-89ab-cdef-0123-456789abcde1', 'Alice Uwase', '+250788234567', 'Kigali', NULL),
  ('d1234567-89ab-cdef-0123-456789abcde2', 'David Nkusi', '+250788345678', 'Kigali', NULL),
  ('d1234567-89ab-cdef-0123-456789abcde3', 'Grace Mutesi', '+250788456789', 'Kigali', NULL),
  ('d1234567-89ab-cdef-0123-456789abcde4', 'Patrick Habimana', '+250788567890', 'Kigali', NULL),
  ('d1234567-89ab-cdef-0123-456789abcde5', 'Sarah Kamanzi', '+250788678901', 'Kigali', NULL)
ON CONFLICT (user_id) DO UPDATE
SET 
  full_name = EXCLUDED.full_name,
  phone_number = EXCLUDED.phone_number,
  city = EXCLUDED.city;

-- ================================================
-- 4. Create Service Requests
-- ================================================
-- Get the service provider ID
DO $$
DECLARE
  provider_id UUID;
  customer_ids UUID[];
  plumbing_cat_id UUID;
  electrical_cat_id UUID;
  carpentry_cat_id UUID;
  painting_cat_id UUID;
BEGIN
  -- Get provider ID
  SELECT id INTO provider_id FROM service_providers WHERE user_id = 'c17f3782-84c2-4459-b235-eb69853bcce1';
  
  -- Get customer IDs
  SELECT ARRAY_AGG(user_id) INTO customer_ids FROM job_seekers WHERE user_id LIKE 'd1234567%';
  
  -- Get category IDs
  SELECT id INTO plumbing_cat_id FROM service_categories WHERE name = 'Plumbing';
  SELECT id INTO electrical_cat_id FROM service_categories WHERE name = 'Electrical Work';
  SELECT id INTO carpentry_cat_id FROM service_categories WHERE name = 'Carpentry';
  SELECT id INTO painting_cat_id FROM service_categories WHERE name = 'Painting';
  
  -- Insert service requests with various statuses
  
  -- Pending requests (new opportunities for provider)
  INSERT INTO service_requests (customer_id, service_category_id, title, description, address, city, latitude, longitude, budget_min, budget_max, preferred_date, status, created_at)
  VALUES
    (customer_ids[1], plumbing_cat_id, 'Fix Leaking Kitchen Sink', 'Kitchen sink has been leaking for 2 days. Water dripping from underneath the sink. Need urgent repair.', 'KG 7 Ave, Kimihurura', 'Kigali', -1.9441, 30.0636, 15000, 25000, NOW() + INTERVAL '2 days', 'pending', NOW() - INTERVAL '3 hours'),
    (customer_ids[2], electrical_cat_id, 'Install New Ceiling Lights', 'Need to install 5 LED ceiling lights in living room and bedrooms. Have all materials ready.', 'KG 11 Ave, Nyarutarama', 'Kigali', -1.9381, 30.1264, 30000, 50000, NOW() + INTERVAL '5 days', 'pending', NOW() - INTERVAL '1 day'),
    (customer_ids[3], carpentry_cat_id, 'Custom Kitchen Cabinet', 'Looking for someone to build custom kitchen cabinets. Measurements and design ready.', 'KG 15 Ave, Kacyiru', 'Kigali', -1.9578, 30.0969, 80000, 120000, NOW() + INTERVAL '1 week', 'pending', NOW() - INTERVAL '6 hours');
  
  -- Accepted/In Progress requests (active work)
  INSERT INTO service_requests (customer_id, service_category_id, title, description, address, city, latitude, longitude, budget_min, budget_max, preferred_date, status, assigned_provider_id, created_at, updated_at)
  VALUES
    (customer_ids[4], plumbing_cat_id, 'Replace Bathroom Pipes', 'Old pipes need replacement. Some are rusty. Need complete bathroom piping work.', 'KN 3 Ave, Remera', 'Kigali', -1.9536, 30.0948, 60000, 90000, NOW() + INTERVAL '3 days', 'in_progress', provider_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
    (customer_ids[5], electrical_cat_id, 'Fix Power Outlets', 'Several power outlets not working. Need troubleshooting and repair.', 'KG 9 Ave, Kicukiro', 'Kigali', -1.9889, 30.1106, 20000, 35000, NOW() + INTERVAL '1 day', 'accepted', provider_id, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '2 hours');
  
  -- Completed requests (past work)
  INSERT INTO service_requests (customer_id, service_category_id, title, description, address, city, latitude, longitude, budget_min, budget_max, preferred_date, status, assigned_provider_id, completion_date, created_at, updated_at)
  VALUES
    (customer_ids[1], painting_cat_id, 'Paint Living Room', 'Need interior painting for living room. Approximately 40 square meters.', 'KN 8 Ave, Gisozi', 'Kigali', -1.9167, 30.0833, 40000, 60000, NOW() - INTERVAL '10 days', 'completed', provider_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days'),
    (customer_ids[2], plumbing_cat_id, 'Install New Toilet', 'New toilet installation in guest bathroom. Toilet already purchased.', 'KG 5 Ave, Gikondo', 'Kigali', -2.0072, 30.0522, 25000, 40000, NOW() - INTERVAL '7 days', 'completed', provider_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days'),
    (customer_ids[3], carpentry_cat_id, 'Fix Wooden Door', 'Main entrance door not closing properly. Needs adjustment and repair.', 'KN 12 Ave, Nyarugenge', 'Kigali', -1.9536, 30.0586, 15000, 25000, NOW() - INTERVAL '5 days', 'completed', provider_id, NOW() - INTERVAL '7 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days');
  
  RAISE NOTICE '✅ Service requests created successfully';
END $$;

-- ================================================
-- 5. Add Provider Interests for Pending Requests
-- ================================================
INSERT INTO service_provider_interests (service_request_id, service_provider_id, message, status)
SELECT 
  sr.id,
  sp.id,
  'I am interested in this job. I have ' || sps.experience_years || ' years of experience in ' || sc.name || '. I can start immediately.',
  'interested'
FROM service_requests sr
JOIN service_providers sp ON sp.user_id = 'c17f3782-84c2-4459-b235-eb69853bcce1'
JOIN service_categories sc ON sr.service_category_id = sc.id
JOIN service_provider_skills sps ON sps.service_provider_id = sp.id AND sps.service_category_id = sc.id
WHERE sr.status = 'pending'
AND sr.assigned_provider_id IS NULL
ON CONFLICT DO NOTHING;

-- ================================================
-- 6. Add Reviews for Completed Jobs
-- ================================================
INSERT INTO service_reviews (service_request_id, customer_id, service_provider_id, rating, comment, created_at)
SELECT 
  sr.id,
  sr.customer_id,
  sr.assigned_provider_id,
  CASE 
    WHEN RANDOM() < 0.7 THEN 5  -- 70% chance of 5 stars
    WHEN RANDOM() < 0.9 THEN 4  -- 20% chance of 4 stars
    ELSE 3                       -- 10% chance of 3 stars
  END,
  CASE (RANDOM() * 5)::INT
    WHEN 0 THEN 'Excellent work! Very professional and completed on time.'
    WHEN 1 THEN 'Great service. Would definitely hire again.'
    WHEN 2 THEN 'Good quality work. Arrived on time and cleaned up after.'
    WHEN 3 THEN 'Very satisfied with the results. Highly recommended!'
    WHEN 4 THEN 'Professional and skilled. Fair pricing too.'
    ELSE 'Outstanding service! Exceeded expectations.'
  END,
  sr.completion_date + INTERVAL '1 day'
FROM service_requests sr
WHERE sr.status = 'completed'
AND sr.assigned_provider_id IS NOT NULL
ON CONFLICT (service_request_id, customer_id, service_provider_id) DO NOTHING;

-- ================================================
-- 7. Create Notifications for Provider
-- ================================================
INSERT INTO notifications (user_id, type, title, message, related_id, is_read, created_at)
SELECT 
  'c17f3782-84c2-4459-b235-eb69853bcce1',
  'new_service_request',
  'New Job Request: ' || sr.title,
  js.full_name || ' posted a new job request in ' || sr.city || '. Budget: RWF ' || sr.budget_min || ' - ' || sr.budget_max,
  sr.id::TEXT,
  false,
  sr.created_at + INTERVAL '1 minute'
FROM service_requests sr
JOIN job_seekers js ON sr.customer_id = js.user_id
WHERE sr.status = 'pending'
AND sr.service_category_id IN (
  SELECT service_category_id 
  FROM service_provider_skills sps
  JOIN service_providers sp ON sps.service_provider_id = sp.id
  WHERE sp.user_id = 'c17f3782-84c2-4459-b235-eb69853bcce1'
)
ON CONFLICT DO NOTHING;

-- ================================================
-- SUMMARY
-- ================================================
DO $$
DECLARE
  total_requests INTEGER;
  pending_count INTEGER;
  active_count INTEGER;
  completed_count INTEGER;
  provider_skills INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_requests FROM service_requests;
  SELECT COUNT(*) INTO pending_count FROM service_requests WHERE status = 'pending';
  SELECT COUNT(*) INTO active_count FROM service_requests WHERE status IN ('accepted', 'in_progress');
  SELECT COUNT(*) INTO completed_count FROM service_requests WHERE status = 'completed';
  SELECT COUNT(*) INTO provider_skills FROM service_provider_skills 
  WHERE service_provider_id IN (SELECT id FROM service_providers WHERE user_id = 'c17f3782-84c2-4459-b235-eb69853bcce1');
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║       SERVICE PROVIDER WORKSPACE - SEED COMPLETE           ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '👤 Service Provider Profile: John Mukamazimpaka';
  RAISE NOTICE '   ├─ Email: provider@test.com';
  RAISE NOTICE '   ├─ Rating: 4.6/5.0 (23 reviews)';
  RAISE NOTICE '   ├─ Completed Jobs: 47';
  RAISE NOTICE '   ├─ Response Rate: 92.5%%';
  RAISE NOTICE '   └─ Skills: % categories', provider_skills;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Service Requests Created: %', total_requests;
  RAISE NOTICE '   ├─ ⏳ Pending (New Opportunities): %', pending_count;
  RAISE NOTICE '   ├─ ⚡ Active (In Progress): %', active_count;
  RAISE NOTICE '   └─ ✅ Completed (Past Work): %', completed_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔔 Notifications Created: % unread alerts', pending_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Provider Dashboard Ready!';
  RAISE NOTICE '   • View active jobs and track progress';
  RAISE NOTICE '   • Respond to new job requests';
  RAISE NOTICE '   • View completed work history';
  RAISE NOTICE '   • Manage profile and skills';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Login with: provider@test.com / password123';
  RAISE NOTICE '';
END $$;
