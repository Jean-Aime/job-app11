-- Insert Job Categories
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
('Transport & Logistics', 'Driving, warehousing, supply chain, shipping', 'Truck'),
('Manufacturing', 'Production, quality control, factory operations', 'Factory'),
('Legal', 'Lawyers, paralegals, compliance, legal support', 'Scale'),
('Creative & Design', 'Graphic design, writing, photography, arts', 'Palette'),
('Human Resources', 'Recruitment, training, HR management', 'Users')
ON CONFLICT (name) DO NOTHING;

-- Insert Skills (with ON CONFLICT to handle duplicates)
INSERT INTO skills (name, category) VALUES
-- Technology Skills
('JavaScript', 'Technology & IT'),
('Python', 'Technology & IT'),
('React', 'Technology & IT'),
('Node.js', 'Technology & IT'),
('TypeScript', 'Technology & IT'),
('SQL', 'Technology & IT'),
('Java', 'Technology & IT'),
('Data Analysis', 'Technology & IT'),
('Machine Learning', 'Technology & IT'),
('Cybersecurity', 'Technology & IT'),
('Cloud Computing', 'Technology & IT'),
('Mobile Development', 'Technology & IT'),
('DevOps', 'Technology & IT'),

-- Healthcare Skills
('Patient Care', 'Healthcare'),
('Nursing', 'Healthcare'),
('Medical Diagnosis', 'Healthcare'),
('Pharmacy', 'Healthcare'),
('Laboratory Testing', 'Healthcare'),
('First Aid', 'Healthcare'),
('Emergency Medicine', 'Healthcare'),

-- Finance Skills
('Financial Analysis', 'Finance & Accounting'),
('Accounting', 'Finance & Accounting'),
('Tax Preparation', 'Finance & Accounting'),
('Auditing', 'Finance & Accounting'),
('Budgeting', 'Finance & Accounting'),
('Investment Analysis', 'Finance & Accounting'),
('Banking Operations', 'Finance & Accounting'),

-- Soft Skills
('Communication', 'Soft Skills'),
('Problem Solving', 'Soft Skills'),
('Team Leadership', 'Soft Skills'),
('Project Management', 'Soft Skills'),
('Time Management', 'Soft Skills'),
('Customer Service', 'Soft Skills'),
('Negotiation', 'Soft Skills'),
('Critical Thinking', 'Soft Skills'),

-- Engineering Skills
('AutoCAD', 'Engineering'),
('Civil Engineering', 'Engineering'),
('Electrical Engineering', 'Engineering'),
('Mechanical Engineering', 'Engineering'),
('Project Planning', 'Engineering'),
('Quality Control', 'Engineering'),

-- Marketing Skills
('Digital Marketing', 'Marketing & Sales'),
('Social Media Marketing', 'Marketing & Sales'),
('SEO', 'Marketing & Sales'),
('Content Marketing', 'Marketing & Sales'),
('Sales', 'Marketing & Sales'),
('Market Research', 'Marketing & Sales'),
('Brand Management', 'Marketing & Sales'),

-- Languages
('English', 'Languages'),
('French', 'Languages'),
('Kinyarwanda', 'Languages'),
('Swahili', 'Languages'),

-- Agriculture Skills
('Crop Management', 'Agriculture'),
('Livestock Management', 'Agriculture'),
('Agricultural Engineering', 'Agriculture'),
('Farm Management', 'Agriculture'),

-- Construction Skills
('Carpentry', 'Construction'),
('Masonry', 'Construction'),
('Plumbing', 'Construction'),
('Electrical Installation', 'Construction'),
('Welding', 'Construction'),
('Site Management', 'Construction'),

-- Hospitality Skills
('Food Preparation', 'Hospitality & Tourism'),
('Hotel Management', 'Hospitality & Tourism'),
('Event Planning', 'Hospitality & Tourism'),
('Tour Guiding', 'Hospitality & Tourism')
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_seekers_updated_at BEFORE UPDATE ON job_seekers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate profile completion score
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_job_seeker_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Check each field and add points
  UPDATE job_seekers SET profile_completion_score = 
    COALESCE(
      (CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 15 ELSE 0 END) +
      (CASE WHEN phone_number IS NOT NULL AND phone_number != '' THEN 10 ELSE 0 END) +
      (CASE WHEN address IS NOT NULL AND address != '' THEN 5 ELSE 0 END) +
      (CASE WHEN city IS NOT NULL AND city != '' THEN 5 ELSE 0 END) +
      (CASE WHEN country IS NOT NULL AND country != '' THEN 5 ELSE 0 END) +
      (CASE WHEN profile_photo_url IS NOT NULL AND profile_photo_url != '' THEN 10 ELSE 0 END) +
      (CASE WHEN resume_url IS NOT NULL AND resume_url != '' THEN 15 ELSE 0 END) +
      (CASE WHEN bio IS NOT NULL AND bio != '' THEN 5 ELSE 0 END) +
      (CASE WHEN current_occupation IS NOT NULL AND current_occupation != '' THEN 10 ELSE 0 END) +
      (CASE WHEN years_of_experience > 0 THEN 10 ELSE 0 END) +
      (SELECT COUNT(*) * 5 FROM job_seeker_skills WHERE job_seeker_id = p_job_seeker_id LIMIT 3) +
      (SELECT COUNT(*) * 3 FROM experiences WHERE job_seeker_id = p_job_seeker_id LIMIT 3) +
      (SELECT COUNT(*) * 2 FROM certificates WHERE job_seeker_id = p_job_seeker_id LIMIT 3),
    0)
  WHERE id = p_job_seeker_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;