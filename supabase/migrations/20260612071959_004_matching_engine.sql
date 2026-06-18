-- Matching Engine Functions

-- Function to calculate match score between a job seeker and a job
CREATE OR REPLACE FUNCTION calculate_job_match(
  p_job_id UUID,
  p_job_seeker_id UUID
)
RETURNS TABLE (
  match_score DECIMAL(5,2),
  skills_match DECIMAL(5,2),
  location_match DECIMAL(5,2),
  experience_match DECIMAL(5,2),
  availability_match DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_skills_match DECIMAL(5,2) := 0;
  v_location_match DECIMAL(5,2) := 0;
  v_experience_match DECIMAL(5,2) := 0;
  v_availability_match DECIMAL(5,2) := 0;
  v_job_lat DECIMAL;
  v_job_lon DECIMAL;
  v_seeker_lat DECIMAL;
  v_seeker_lon DECIMAL;
  v_job_experience INTEGER;
  v_seeker_experience INTEGER;
  v_job_skills_count INTEGER;
  v_matched_skills_count INTEGER;
  v_seeker_availability TEXT;
BEGIN
  -- Get job details
  SELECT latitude, longitude, required_experience_years
  INTO v_job_lat, v_job_lon, v_job_experience
  FROM jobs WHERE id = p_job_id;

  -- Get job seeker details
  SELECT latitude, longitude, years_of_experience, availability
  INTO v_seeker_lat, v_seeker_lon, v_seeker_experience, v_seeker_availability
  FROM job_seekers WHERE id = p_job_seeker_id;

  -- Calculate Skills Match (40% weight) - based on required skills matching user skills
  SELECT COUNT(*) INTO v_job_skills_count
  FROM job_skills WHERE job_id = p_job_id;

  IF v_job_skills_count > 0 THEN
    SELECT COUNT(*) INTO v_matched_skills_count
    FROM job_skills js
    JOIN job_seeker_skills jss ON js.skill_id = jss.skill_id
    WHERE js.job_id = p_job_id AND jss.job_seeker_id = p_job_seeker_id;
    
    v_skills_match := (v_matched_skills_count::DECIMAL / v_job_skills_count::DECIMAL) * 100;
  ELSE
    v_skills_match := 50; -- Default if no skills required
  END IF;

  -- Calculate Location Match (30% weight) - based on distance
  IF v_job_lat IS NOT NULL AND v_job_lon IS NOT NULL AND 
     v_seeker_lat IS NOT NULL AND v_seeker_lon IS NOT NULL THEN
    -- Simple distance calculation (haversine approximation)
    DECLARE
      v_distance_km DECIMAL;
      v_lat_diff DECIMAL;
      v_lon_diff DECIMAL;
    BEGIN
      v_lat_diff := ABS(v_job_lat - v_seeker_lat);
      v_lon_diff := ABS(v_job_lon - v_seeker_lon) * COS(RADIANS((v_job_lat + v_seeker_lat) / 2));
      v_distance_km := SQRT(POWER(v_lat_diff * 111, 2) + POWER(v_lon_diff * 111, 2));
      
      -- Score based on distance: 100% < 5km, 80% < 10km, 60% < 20km, 40% < 50km, 20% otherwise
      IF v_distance_km < 5 THEN
        v_location_match := 100;
      ELSIF v_distance_km < 10 THEN
        v_location_match := 80;
      ELSIF v_distance_km < 20 THEN
        v_location_match := 60;
      ELSIF v_distance_km < 50 THEN
        v_location_match := 40;
      ELSE
        v_location_match := 20;
      END IF;
    END;
  ELSE
    v_location_match := 70; -- Default if no location data
  END IF;

  -- Calculate Experience Match (20% weight)
  IF v_job_experience IS NOT NULL AND v_seeker_experience IS NOT NULL THEN
    IF v_seeker_experience >= v_job_experience THEN
      v_experience_match := 100;
    ELSIF v_seeker_experience >= (v_job_experience * 0.75) THEN
      v_experience_match := 85;
    ELSIF v_seeker_experience >= (v_job_experience * 0.5) THEN
      v_experience_match := 70;
    ELSE
      v_experience_match := 50;
    END IF;
  ELSE
    v_experience_match := 50; -- Default if no experience data
  END IF;

  -- Calculate Availability Match (10% weight)
  v_availability_match := CASE 
    WHEN v_seeker_availability = 'immediately' THEN 100
    WHEN v_seeker_availability = 'within_2_weeks' THEN 80
    WHEN v_seeker_availability = 'within_month' THEN 60
    WHEN v_seeker_availability = 'not_available' THEN 20
    ELSE 70 -- Default
  END;

  RETURN QUERY SELECT
    (v_skills_match * 0.4 + v_location_match * 0.3 + v_experience_match * 0.2 + v_availability_match * 0.1)::DECIMAL(5,2),
    v_skills_match::DECIMAL(5,2),
    v_location_match::DECIMAL(5,2),
    v_experience_match::DECIMAL(5,2),
    v_availability_match::DECIMAL(5,2);
END;
$$;

-- Function to update matches for all job seekers against a specific job
CREATE OR REPLACE FUNCTION update_job_matches(p_job_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete existing matches for this job
  DELETE FROM job_matches WHERE job_id = p_job_id;
  
  -- Insert new matches
  INSERT INTO job_matches (job_id, job_seeker_id, match_score, skills_match, location_match, experience_match, availability_match)
  SELECT 
    p_job_id,
    js.id,
    m.match_score,
    m.skills_match,
    m.location_match,
    m.experience_match,
    m.availability_match
  FROM job_seekers js
  CROSS JOIN LATERAL calculate_job_match(p_job_id, js.id) m
  WHERE m.match_score >= 30; -- Only store matches above 30%
END;
$$;

-- Function to update matches for all jobs against a specific job seeker
CREATE OR REPLACE FUNCTION update_seeker_matches(p_job_seeker_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete existing matches for this job seeker
  DELETE FROM job_matches WHERE job_seeker_id = p_job_seeker_id;
  
  -- Insert new matches
  INSERT INTO job_matches (job_id, job_seeker_id, match_score, skills_match, location_match, experience_match, availability_match)
  SELECT 
    j.id,
    p_job_seeker_id,
    m.match_score,
    m.skills_match,
    m.location_match,
    m.experience_match,
    m.availability_match
  FROM jobs j
  CROSS JOIN LATERAL calculate_job_match(j.id, p_job_seeker_id) m
  WHERE j.status = 'active' AND m.match_score >= 30; -- Only active jobs with 30%+ match
END;
$$;

-- Trigger to update matches when a new job is created
CREATE OR REPLACE FUNCTION on_job_created()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM update_job_matches(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger for job creation
DROP TRIGGER IF EXISTS trigger_job_created ON jobs;
CREATE TRIGGER trigger_job_created
AFTER INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION on_job_created();

-- Trigger to update matches when a job seeker updates their profile
CREATE OR REPLACE FUNCTION on_seeker_profile_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update if relevant fields changed
  IF (OLD.latitude <> NEW.latitude OR OLD.longitude <> NEW.longitude OR
      OLD.years_of_experience <> NEW.years_of_experience OR
      OLD.availability <> NEW.availability) THEN
    PERFORM update_seeker_matches(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for job seeker profile updates
DROP TRIGGER IF EXISTS trigger_seeker_profile_updated ON job_seekers;
CREATE TRIGGER trigger_seeker_profile_updated
AFTER UPDATE ON job_seekers
FOR EACH ROW
EXECUTE FUNCTION on_seeker_profile_updated();

-- Trigger to update matches when skills are added/removed
CREATE OR REPLACE FUNCTION on_skills_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_TABLE_NAME = 'job_seeker_skills' THEN
    PERFORM update_seeker_matches(NEW.job_seeker_id);
  ELSIF TG_TABLE_NAME = 'job_skills' THEN
    PERFORM update_job_matches(NEW.job_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for skill changes
DROP TRIGGER IF EXISTS trigger_seeker_skills_updated ON job_seeker_skills;
CREATE TRIGGER trigger_seeker_skills_updated
AFTER INSERT OR DELETE ON job_seeker_skills
FOR EACH ROW
EXECUTE FUNCTION on_skills_updated();