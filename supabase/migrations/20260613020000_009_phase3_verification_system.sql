-- ================================================
-- PHASE 3: VERIFICATION SYSTEM
-- ================================================
-- Enhanced verification workflow for service providers
-- Levels: 1=Basic, 2=Skill Verified, 3=Background Check, 4=Top Professional

-- ================================================
-- 1. VERIFICATION REQUESTS TABLE
-- ================================================
-- Track verification level upgrade requests
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- Request Info
  requested_level INTEGER NOT NULL CHECK (requested_level BETWEEN 1 AND 4),
  current_level INTEGER NOT NULL,
  
  -- Documents Submitted
  document_ids JSONB, -- Array of verification_documents.id
  additional_notes TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'additional_info_needed')),
  
  -- Admin Review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE verification_requests IS 'Provider requests to upgrade verification level';

CREATE INDEX idx_verification_requests_provider ON verification_requests(service_provider_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_level ON verification_requests(requested_level);

-- ================================================
-- 2. NOTIFICATIONS TABLE ENHANCEMENT
-- ================================================
-- Ensure notifications table supports service provider notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ================================================
-- 3. PROVIDER STATS VIEW
-- ================================================
-- Materialized view for quick stats access
CREATE MATERIALIZED VIEW IF NOT EXISTS provider_stats AS
SELECT 
  sp.id as provider_id,
  sp.user_id,
  sp.full_name,
  sp.verification_level,
  sp.is_verified,
  sp.total_jobs_completed,
  sp.average_rating,
  sp.total_reviews,
  
  -- Pending requests count
  (SELECT COUNT(*) FROM service_requests sr 
   WHERE sr.assigned_provider_id = sp.id AND sr.status = 'accepted') as pending_jobs,
  
  -- Active requests count
  (SELECT COUNT(*) FROM service_requests sr 
   WHERE sr.assigned_provider_id = sp.id AND sr.status = 'in_progress') as active_jobs,
  
  -- This month earnings (placeholder - will need payment integration)
  0 as monthly_earnings,
  
  -- Badges count
  (SELECT COUNT(*) FROM provider_badges pb 
   WHERE pb.service_provider_id = sp.id) as badges_count,
  
  -- Skills count
  (SELECT COUNT(*) FROM service_provider_skills sps 
   WHERE sps.service_provider_id = sp.id) as skills_count,
  
  -- Pending verification
  (SELECT COUNT(*) FROM verification_requests vr 
   WHERE vr.service_provider_id = sp.id AND vr.status = 'pending') as pending_verifications,
  
  NOW() as computed_at
FROM service_providers sp
WHERE sp.is_active = true;

CREATE UNIQUE INDEX idx_provider_stats_provider ON provider_stats(provider_id);

COMMENT ON MATERIALIZED VIEW provider_stats IS 'Aggregated provider statistics for dashboard';

-- ================================================
-- 4. FUNCTION TO REFRESH PROVIDER STATS
-- ================================================
CREATE OR REPLACE FUNCTION refresh_provider_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY provider_stats;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 5. FUNCTION TO AUTO-ASSIGN VERIFICATION BADGES
-- ================================================
CREATE OR REPLACE FUNCTION assign_verification_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Level 1: Basic Verified (phone + email + ID)
  IF NEW.verification_level >= 1 AND NEW.is_verified = true THEN
    INSERT INTO provider_badges (service_provider_id, badge_type, badge_level)
    VALUES (NEW.id, 'basic_verified', 1)
    ON CONFLICT (service_provider_id, badge_type) DO NOTHING;
  END IF;
  
  -- Level 2: Skill Verified
  IF NEW.verification_level >= 2 THEN
    INSERT INTO provider_badges (service_provider_id, badge_type, badge_level)
    VALUES (NEW.id, 'skill_verified', 1)
    ON CONFLICT (service_provider_id, badge_type) DO NOTHING;
  END IF;
  
  -- Level 3: Background Check
  IF NEW.verification_level >= 3 THEN
    INSERT INTO provider_badges (service_provider_id, badge_type, badge_level)
    VALUES (NEW.id, 'background_verified', 1)
    ON CONFLICT (service_provider_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_verification_badges ON service_providers;
CREATE TRIGGER trigger_assign_verification_badges
AFTER UPDATE ON service_providers
FOR EACH ROW
WHEN (OLD.verification_level IS DISTINCT FROM NEW.verification_level OR OLD.is_verified IS DISTINCT FROM NEW.is_verified)
EXECUTE FUNCTION assign_verification_badges();

-- ================================================
-- 6. FUNCTION TO CREATE NOTIFICATION
-- ================================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT NULL,
  p_priority VARCHAR DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data, priority, action_url)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_priority, p_action_url)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 7. TRIGGER TO NOTIFY ON VERIFICATION STATUS CHANGE
-- ================================================
CREATE OR REPLACE FUNCTION notify_verification_status()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Get user_id from service_provider
  SELECT user_id INTO v_user_id 
  FROM service_providers 
  WHERE id = NEW.service_provider_id;
  
  IF NEW.status = 'approved' THEN
    v_title := 'Verification Approved! 🎉';
    v_message := 'Your Level ' || NEW.requested_level || ' verification has been approved!';
    
    -- Update provider verification level
    UPDATE service_providers 
    SET verification_level = NEW.requested_level,
        is_verified = true,
        verification_date = NOW()
    WHERE id = NEW.service_provider_id;
    
  ELSIF NEW.status = 'rejected' THEN
    v_title := 'Verification Rejected';
    v_message := 'Your verification request was not approved. Reason: ' || COALESCE(NEW.rejection_reason, 'Please review requirements');
    
  ELSIF NEW.status = 'additional_info_needed' THEN
    v_title := 'Additional Information Required';
    v_message := 'Please provide additional documents for verification.';
  END IF;
  
  -- Create notification
  IF v_title IS NOT NULL THEN
    PERFORM create_notification(
      v_user_id,
      'verification_update',
      v_title,
      v_message,
      jsonb_build_object('verification_request_id', NEW.id, 'level', NEW.requested_level),
      'high',
      '/profile/verification'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_verification_status ON verification_requests;
CREATE TRIGGER trigger_notify_verification_status
AFTER UPDATE ON verification_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION notify_verification_status();

-- ================================================
-- 8. ADMIN VERIFICATION DASHBOARD VIEW
-- ================================================
CREATE OR REPLACE VIEW admin_verification_dashboard AS
SELECT 
  vr.id as request_id,
  vr.requested_level,
  vr.current_level,
  vr.status,
  vr.created_at as requested_at,
  
  -- Provider Info
  sp.id as provider_id,
  sp.full_name as provider_name,
  sp.phone_number as provider_phone,
  sp.city,
  sp.years_of_experience,
  sp.total_jobs_completed,
  sp.average_rating,
  
  -- User Info
  u.email as provider_email,
  
  -- Documents Count
  jsonb_array_length(COALESCE(vr.document_ids, '[]'::jsonb)) as documents_count,
  
  -- Review Info
  vr.reviewed_at,
  admin_user.email as reviewed_by_email,
  
  vr.rejection_reason,
  vr.admin_notes
  
FROM verification_requests vr
JOIN service_providers sp ON vr.service_provider_id = sp.id
JOIN users u ON sp.user_id = u.id
LEFT JOIN users admin_user ON vr.reviewed_by = admin_user.id
ORDER BY 
  CASE vr.status 
    WHEN 'pending' THEN 1
    WHEN 'under_review' THEN 2
    WHEN 'additional_info_needed' THEN 3
    ELSE 4
  END,
  vr.created_at DESC;

COMMENT ON VIEW admin_verification_dashboard IS 'Admin view for managing verification requests';

-- ================================================
-- 9. TRIGGER FOR UPDATED_AT
-- ================================================
DROP TRIGGER IF EXISTS update_verification_requests_updated_at ON verification_requests;
CREATE TRIGGER update_verification_requests_updated_at 
BEFORE UPDATE ON verification_requests 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- SEED INITIAL VERIFICATION BADGE FOR TEST USER
-- ================================================
DO $$
DECLARE
  v_provider_id UUID;
BEGIN
  -- Get test provider
  SELECT id INTO v_provider_id
  FROM service_providers
  WHERE phone_number = '+250788000004'
  LIMIT 1;
  
  IF v_provider_id IS NOT NULL THEN
    -- Give basic_verified badge
    INSERT INTO provider_badges (service_provider_id, badge_type, badge_level)
    VALUES (v_provider_id, 'basic_verified', 1)
    ON CONFLICT (service_provider_id, badge_type) DO NOTHING;
    
    RAISE NOTICE '✅ Test provider verification badge assigned';
  END IF;
END $$;

-- ================================================
-- PHASE 3 COMPLETE
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '✅ PHASE 3 VERIFICATION SYSTEM COMPLETE';
  RAISE NOTICE '📋 Created verification_requests table';
  RAISE NOTICE '🔔 Enhanced notifications system';
  RAISE NOTICE '📊 Created provider_stats materialized view';
  RAISE NOTICE '🏆 Auto-badge assignment triggers active';
  RAISE NOTICE '👨‍💼 Admin verification dashboard view ready';
  RAISE NOTICE '🎯 Ready for Phase 4: Mobile UI for Verification';
END $$;
