-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_seekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_seeker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (auth.uid()::text = id::text OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (auth.uid()::text = id::text) WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "users_insert" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "users_delete_own" ON users FOR DELETE TO authenticated USING (auth.uid()::text = id::text);

-- Job Seekers policies
CREATE POLICY "job_seekers_select_all" ON job_seekers FOR SELECT TO authenticated USING (true);
CREATE POLICY "job_seekers_insert_own" ON job_seekers FOR INSERT TO authenticated WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "job_seekers_update_own" ON job_seekers FOR UPDATE TO authenticated USING (user_id::text = auth.uid()::text) WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "job_seekers_delete_own" ON job_seekers FOR DELETE TO authenticated USING (user_id::text = auth.uid()::text);

-- Employers policies
CREATE POLICY "employers_select_all" ON employers FOR SELECT TO authenticated USING (true);
CREATE POLICY "employers_insert_own" ON employers FOR INSERT TO authenticated WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "employers_update_own" ON employers FOR UPDATE TO authenticated USING (user_id::text = auth.uid()::text) WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "employers_delete_own" ON employers FOR DELETE TO authenticated USING (user_id::text = auth.uid()::text);

-- Skills policies (read only for authenticated)
CREATE POLICY "skills_select_all" ON skills FOR SELECT TO authenticated USING (true);

-- Job Seeker Skills policies
CREATE POLICY "job_seeker_skills_select_all" ON job_seeker_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "job_seeker_skills_insert_own" ON job_seeker_skills FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = job_seeker_skills.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));
CREATE POLICY "job_seeker_skills_update_own" ON job_seeker_skills FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = job_seeker_skills.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));
CREATE POLICY "job_seeker_skills_delete_own" ON job_seeker_skills FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = job_seeker_skills.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));

-- Certificates policies
CREATE POLICY "certificates_select_all" ON certificates FOR SELECT TO authenticated USING (true);
CREATE POLICY "certificates_insert_own" ON certificates FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = certificates.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));
CREATE POLICY "certificates_update_own" ON certificates FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = certificates.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));
CREATE POLICY "certificates_delete_own" ON certificates FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = certificates.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));

-- Experiences policies
CREATE POLICY "experiences_select_all" ON experiences FOR SELECT TO authenticated USING (true);
CREATE POLICY "experiences_insert_own" ON experiences FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = experiences.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));
CREATE POLICY "experiences_update_own" ON experiences FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = experiences.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));
CREATE POLICY "experiences_delete_own" ON experiences FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = experiences.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));

-- Verification Documents policies
CREATE POLICY "verification_documents_select_own" ON verification_documents FOR SELECT TO authenticated USING (user_id::text = auth.uid()::text);
CREATE POLICY "verification_documents_insert_own" ON verification_documents FOR INSERT TO authenticated WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "verification_documents_update_own" ON verification_documents FOR UPDATE TO authenticated USING (user_id::text = auth.uid()::text);

-- Job Categories policies (read only)
CREATE POLICY "job_categories_select_all" ON job_categories FOR SELECT TO authenticated USING (true);

-- Jobs policies
CREATE POLICY "jobs_select_all" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "jobs_insert_own" ON jobs FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM employers WHERE employers.id = jobs.employer_id AND employers.user_id::text = auth.uid()::text));
CREATE POLICY "jobs_update_own" ON jobs FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM employers WHERE employers.id = jobs.employer_id AND employers.user_id::text = auth.uid()::text));
CREATE POLICY "jobs_delete_own" ON jobs FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM employers WHERE employers.id = jobs.employer_id AND employers.user_id::text = auth.uid()::text));

-- Job Skills policies
CREATE POLICY "job_skills_select_all" ON job_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "job_skills_insert_own" ON job_skills FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM jobs JOIN employers ON jobs.employer_id = employers.id WHERE jobs.id = job_skills.job_id AND employers.user_id::text = auth.uid()::text));
CREATE POLICY "job_skills_delete_own" ON job_skills FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM jobs JOIN employers ON jobs.employer_id = employers.id WHERE jobs.id = job_skills.job_id AND employers.user_id::text = auth.uid()::text));

-- Applications policies
CREATE POLICY "applications_select_own" ON applications FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = applications.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text) OR
  EXISTS (SELECT 1 FROM jobs JOIN employers ON jobs.employer_id = employers.id WHERE jobs.id = applications.job_id AND employers.user_id::text = auth.uid()::text)
);
CREATE POLICY "applications_insert_own" ON applications FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = applications.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));
CREATE POLICY "applications_update_employer" ON applications FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM jobs JOIN employers ON jobs.employer_id = employers.id WHERE jobs.id = applications.job_id AND employers.user_id::text = auth.uid()::text));

-- Job Matches policies
CREATE POLICY "job_matches_select_own" ON job_matches FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = job_matches.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text) OR
  EXISTS (SELECT 1 FROM jobs JOIN employers ON jobs.employer_id = employers.id WHERE jobs.id = job_matches.job_id AND employers.user_id::text = auth.uid()::text)
);

-- Notifications policies
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT TO authenticated USING (user_id::text = auth.uid()::text);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE TO authenticated USING (user_id::text = auth.uid()::text);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE TO authenticated USING (user_id::text = auth.uid()::text);
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT TO authenticated WITH CHECK (user_id::text = auth.uid()::text);

-- Saved Jobs policies
CREATE POLICY "saved_jobs_select_own" ON saved_jobs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = saved_jobs.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));
CREATE POLICY "saved_jobs_insert_own" ON saved_jobs FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = saved_jobs.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));
CREATE POLICY "saved_jobs_delete_own" ON saved_jobs FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM job_seekers WHERE job_seekers.id = saved_jobs.job_seeker_id AND job_seekers.user_id::text = auth.uid()::text));

-- Activity Logs policies (insert only for authenticated)
CREATE POLICY "activity_logs_insert" ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);