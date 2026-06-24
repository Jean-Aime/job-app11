-- ================================================
-- PHASE 1: SERVICE PROVIDER PLATFORM - DATABASE FOUNDATION
-- ================================================
-- This migration adds all tables needed for the on-demand services marketplace
-- alongside the existing employment marketplace

-- ================================================
-- 1. UPDATE USERS TABLE - Add service_provider role
-- ================================================
DO $$
BEGIN
  -- Check if service_provider role doesn't exist in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'service_provider'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'service_provider';
  END IF;
END$$;

-- ================================================
-- 2. SERVICE CATEGORIES TABLE
-- ================================================
-- Different from job_categories - these are on-demand services
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- Lucide icon name
  hourly_rate_min INTEGER, -- Suggested minimum rate in RWF
  hourly_rate_max INTEGER, -- Suggested maximum rate in RWF
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE service_categories IS 'On-demand service categories (plumbing, electrical, etc.)';

-- ================================================
-- 3. SERVICE PROVIDERS TABLE
-- ================================================
-- Workers who provide on-demand services
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Personal Info
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(20),
  date_of_birth DATE,
  phone_number VARCHAR(20) NOT NULL,
  national_id VARCHAR(50),
  
  -- Location (for map discovery)
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Rwanda',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Service Info
  bio TEXT,
  years_of_experience INTEGER DEFAULT 0,
  hourly_rate INTEGER, -- RWF per hour
  currency VARCHAR(3) DEFAULT 'RWF',
  
  -- Availability
  is_available BOOLEAN DEFAULT true, -- Currently accepting requests
  availability_hours JSONB, -- e.g., {"monday": "08:00-17:00", "tuesday": "08:00-17:00"}
  
  -- Verification Status
  verification_level INTEGER DEFAULT 1, -- 1=Basic, 2=Skill, 3=Background, 4=Trusted
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  
  -- Media
  profile_photo_url TEXT,
  id_card_photo_url TEXT,
  
  -- Stats
  total_jobs_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0.00, -- 0.00 to 5.00
  total_reviews INTEGER DEFAULT 0,
  response_rate DECIMAL(5, 2) DEFAULT 100.00, -- Percentage
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_suspended BOOLEAN DEFAULT false,
  suspension_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE service_providers IS 'Workers providing on-demand services (plumbers, electricians, etc.)';

CREATE INDEX idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX idx_service_providers_location ON service_providers(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_service_providers_verification ON service_providers(verification_level, is_verified);
CREATE INDEX idx_service_providers_available ON service_providers(is_available, is_active);

-- ================================================
-- 4. SERVICE PROVIDER SKILLS TABLE
-- ================================================
-- Many-to-many relationship between providers and service categories
CREATE TABLE IF NOT EXISTS service_provider_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  
  years_of_experience INTEGER DEFAULT 0,
  proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5), -- 1=Beginner, 5=Expert
  
  -- Certification
  has_certificate BOOLEAN DEFAULT false,
  certificate_url TEXT,
  certificate_expiry DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(service_provider_id, service_category_id)
);

COMMENT ON TABLE service_provider_skills IS 'Skills and certifications of service providers';

CREATE INDEX idx_service_provider_skills_provider ON service_provider_skills(service_provider_id);
CREATE INDEX idx_service_provider_skills_category ON service_provider_skills(service_category_id);

-- ================================================
-- 5. VERIFICATION DOCUMENTS TABLE (Expand existing)
-- ================================================
-- Drop existing table if it's too limited, recreate with more fields
DROP TABLE IF EXISTS verification_documents CASCADE;

CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Document Type
  document_type VARCHAR(50) NOT NULL, -- 'national_id', 'certificate', 'clearance', 'reference', 'selfie'
  service_category_id UUID REFERENCES service_categories(id), -- For skill certificates
  
  -- Document Info
  document_number VARCHAR(100),
  document_url TEXT NOT NULL,
  document_name VARCHAR(255),
  file_size INTEGER, -- bytes
  
  -- Verification
  verification_status verification_status DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  notes TEXT,
  
  -- Expiry
  issue_date DATE,
  expiry_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE verification_documents IS 'Documents for user/provider verification';

CREATE INDEX idx_verification_docs_user ON verification_documents(user_id);
CREATE INDEX idx_verification_docs_status ON verification_documents(verification_status);
CREATE INDEX idx_verification_docs_type ON verification_documents(document_type);

-- ================================================
-- 6. SERVICE REQUESTS TABLE
-- ================================================
-- Customer requests for on-demand services
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer Info
  customer_id UUID NOT NULL REFERENCES job_seekers(id) ON DELETE CASCADE, -- Customers are job_seekers
  
  -- Service Info
  service_category_id UUID NOT NULL REFERENCES service_categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Location
  location_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'Rwanda',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Budget
  budget_min INTEGER, -- RWF
  budget_max INTEGER, -- RWF
  currency VARCHAR(3) DEFAULT 'RWF',
  
  -- Timing
  preferred_date DATE,
  preferred_time VARCHAR(50), -- e.g., "Morning", "Afternoon", "Evening", "Flexible"
  urgency VARCHAR(20) DEFAULT 'normal', -- 'urgent', 'normal', 'scheduled'
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired')),
  
  -- Assignment
  assigned_provider_id UUID REFERENCES service_providers(id),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by VARCHAR(20), -- 'customer', 'provider', 'admin'
  
  -- Payment
  agreed_price INTEGER, -- Final agreed price
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  
  -- Media
  photos JSONB, -- Array of photo URLs
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  interested_providers_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE service_requests IS 'Customer requests for on-demand services';

CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_service_requests_category ON service_requests(service_category_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_provider ON service_requests(assigned_provider_id);
CREATE INDEX idx_service_requests_location ON service_requests(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_service_requests_date ON service_requests(preferred_date) WHERE status = 'pending';

-- ================================================
-- 7. SERVICE PROVIDER INTERESTS TABLE
-- ================================================
-- Track which providers expressed interest in a request
CREATE TABLE IF NOT EXISTS service_provider_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  message TEXT, -- Optional message to customer
  proposed_price INTEGER, -- Provider's quote
  
  status VARCHAR(20) DEFAULT 'interested' CHECK (status IN ('interested', 'accepted', 'rejected')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(service_request_id, service_provider_id)
);

COMMENT ON TABLE service_provider_interests IS 'Providers interested in service requests';

CREATE INDEX idx_provider_interests_request ON service_provider_interests(service_request_id);
CREATE INDEX idx_provider_interests_provider ON service_provider_interests(service_provider_id);

-- ================================================
-- 8. RATINGS & REVIEWS TABLE
-- ================================================
-- Customer reviews for completed services
CREATE TABLE IF NOT EXISTS ratings_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationship
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES job_seekers(id) ON DELETE CASCADE,
  
  -- Rating (1-5 stars)
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  
  -- Review
  review_text TEXT,
  photos JSONB, -- Array of photo URLs
  
  -- Response
  provider_response TEXT,
  provider_responded_at TIMESTAMPTZ,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  is_approved BOOLEAN DEFAULT true,
  
  -- Helpfulness
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(service_request_id) -- One review per service request
);

COMMENT ON TABLE ratings_reviews IS 'Customer reviews and ratings for service providers';

CREATE INDEX idx_ratings_provider ON ratings_reviews(service_provider_id);
CREATE INDEX idx_ratings_customer ON ratings_reviews(customer_id);
CREATE INDEX idx_ratings_request ON ratings_reviews(service_request_id);
CREATE INDEX idx_ratings_overall ON ratings_reviews(overall_rating);

-- ================================================
-- 9. PROVIDER BADGES TABLE
-- ================================================
-- Achievement badges for service providers
CREATE TABLE IF NOT EXISTS provider_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  badge_type VARCHAR(50) NOT NULL, -- 'basic_verified', 'skill_verified', 'background_verified', 'top_professional', 'fast_responder', 'customer_favorite'
  badge_level INTEGER DEFAULT 1, -- Level of achievement
  
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(service_provider_id, badge_type)
);

COMMENT ON TABLE provider_badges IS 'Achievement badges earned by service providers';

CREATE INDEX idx_provider_badges_provider ON provider_badges(service_provider_id);
CREATE INDEX idx_provider_badges_type ON provider_badges(badge_type);

-- ================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_service_categories_updated_at ON service_categories;
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_providers_updated_at ON service_providers;
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verification_documents_updated_at ON verification_documents;
CREATE TRIGGER update_verification_documents_updated_at BEFORE UPDATE ON verification_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_requests_updated_at ON service_requests;
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ratings_reviews_updated_at ON ratings_reviews;
CREATE TRIGGER update_ratings_reviews_updated_at BEFORE UPDATE ON ratings_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 11. FUNCTION TO UPDATE PROVIDER RATINGS
-- ================================================
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_providers SET
    average_rating = (
      SELECT COALESCE(AVG(overall_rating), 0)
      FROM ratings_reviews
      WHERE service_provider_id = NEW.service_provider_id
        AND is_approved = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM ratings_reviews
      WHERE service_provider_id = NEW.service_provider_id
        AND is_approved = true
    )
  WHERE id = NEW.service_provider_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_provider_rating ON ratings_reviews;
CREATE TRIGGER trigger_update_provider_rating
AFTER INSERT OR UPDATE ON ratings_reviews
FOR EACH ROW
EXECUTE FUNCTION update_provider_rating();

-- ================================================
-- 12. FUNCTION TO AUTO-ASSIGN TOP PROFESSIONAL BADGE
-- ================================================
CREATE OR REPLACE FUNCTION check_top_professional_badge()
RETURNS TRIGGER AS $$
BEGIN
  -- If provider has 4.8+ rating and 100+ jobs, give Top Professional badge
  IF NEW.average_rating >= 4.8 AND NEW.total_jobs_completed >= 100 THEN
    INSERT INTO provider_badges (service_provider_id, badge_type, badge_level)
    VALUES (NEW.id, 'top_professional', 1)
    ON CONFLICT (service_provider_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_top_professional_badge ON service_providers;
CREATE TRIGGER trigger_check_top_professional_badge
AFTER UPDATE ON service_providers
FOR EACH ROW
WHEN (OLD.average_rating IS DISTINCT FROM NEW.average_rating OR OLD.total_jobs_completed IS DISTINCT FROM NEW.total_jobs_completed)
EXECUTE FUNCTION check_top_professional_badge();

-- ================================================
-- PHASE 1 COMPLETE
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '✅ PHASE 1 DATABASE FOUNDATION COMPLETE';
  RAISE NOTICE '📊 Created 9 new tables for service provider platform';
  RAISE NOTICE '🎯 Ready for Phase 2: Service Categories Seed Data';
END $$;
