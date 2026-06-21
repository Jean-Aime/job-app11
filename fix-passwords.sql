-- Fix Password Hashes for Test Accounts
-- All accounts will have password: Test123!
-- Correct hash: 044e654ad561c1705aa6870132a3cde018ba4043b9c571926d91d47a1be1b74e:1990354f97a221d252d5bd1d7d8a137a8e6f9569c70c1484560d0df9d6cce18a

UPDATE users 
SET password_hash = '044e654ad561c1705aa6870132a3cde018ba4043b9c571926d91d47a1be1b74e:1990354f97a221d252d5bd1d7d8a137a8e6f9569c70c1484560d0df9d6cce18a'
WHERE email IN (
  'admin@joblink.com',
  'employer1@joblink.com',
  'employer2@joblink.com', 
  'employer3@joblink.com',
  'employer4@joblink.com',
  'employer5@joblink.com',
  'employer6@joblink.com',
  'employer7@joblink.com',
  'employer8@joblink.com',
  'employer9@joblink.com',
  'employer10@joblink.com',
  'jobseeker1@joblink.com',
  'jobseeker2@joblink.com',
  'jobseeker3@joblink.com',
  'jobseeker4@joblink.com',
  'jobseeker5@joblink.com',
  'jobseeker6@joblink.com',
  'jobseeker7@joblink.com',
  'jobseeker8@joblink.com',
  'jobseeker9@joblink.com',
  'jobseeker10@joblink.com'
);

-- Verify the update
SELECT email, role, 
  CASE 
    WHEN password_hash = '044e654ad561c1705aa6870132a3cde018ba4043b9c571926d91d47a1be1b74e:1990354f97a221d252d5bd1d7d8a137a8e6f9569c70c1484560d0df9d6cce18a' 
    THEN '✅ Correct'
    ELSE '❌ Wrong'
  END as password_status
FROM users
WHERE email LIKE '%joblink.com'
ORDER BY role, email;
