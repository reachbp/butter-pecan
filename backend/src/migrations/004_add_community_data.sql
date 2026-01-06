-- Migration 004: Add Community Data Aggregation
-- This migration adds support for community-contributed data sharing

-- Create community data contributions table
CREATE TABLE IF NOT EXISTS community_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  application_year INTEGER NOT NULL,
  grade_applied VARCHAR(10),

  -- Anonymized outcomes
  acceptance_status VARCHAR(50) CHECK (acceptance_status IN ('accepted', 'waitlisted', 'rejected', NULL)),

  -- Optional demographic data (anonymized)
  gender VARCHAR(20),
  legacy_status BOOLEAN,

  -- Test scores (optional, anonymized)
  standardized_test_score INTEGER, -- e.g., SSAT percentile

  -- Timeline data
  application_submitted_date DATE,
  interview_date DATE,
  decision_received_date DATE,

  -- Experience ratings (1-5 scale)
  application_difficulty_rating INTEGER CHECK (application_difficulty_rating BETWEEN 1 AND 5),
  interview_difficulty_rating INTEGER CHECK (interview_difficulty_rating BETWEEN 1 AND 5),
  overall_experience_rating INTEGER CHECK (overall_experience_rating BETWEEN 1 AND 5),

  -- Financial aid
  financial_aid_received BOOLEAN,
  financial_aid_amount_range VARCHAR(50), -- e.g., '$10k-$20k', '>$50k'

  -- Verification and moderation
  is_verified BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE, -- User can opt-out of sharing
  verification_method VARCHAR(50), -- 'email', 'document', 'admin'

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create aggregated stats cache table for performance
CREATE TABLE IF NOT EXISTS school_community_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  application_year INTEGER NOT NULL,

  -- Aggregate statistics
  total_contributions INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5,2), -- Percentage
  waitlist_rate DECIMAL(5,2),
  rejection_rate DECIMAL(5,2),

  -- Average ratings
  avg_application_difficulty DECIMAL(3,2),
  avg_interview_difficulty DECIMAL(3,2),
  avg_overall_experience DECIMAL(3,2),

  -- Financial aid stats
  financial_aid_percentage DECIMAL(5,2),

  -- Timeline averages (in days from application)
  avg_days_to_interview INTEGER,
  avg_days_to_decision INTEGER,

  -- Last updated timestamp for cache invalidation
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(school_id, application_year),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create data sharing preferences table
CREATE TABLE IF NOT EXISTS user_data_sharing_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,

  -- Sharing toggles
  share_outcomes BOOLEAN DEFAULT TRUE,
  share_timeline BOOLEAN DEFAULT TRUE,
  share_ratings BOOLEAN DEFAULT TRUE,
  share_demographics BOOLEAN DEFAULT FALSE,
  share_financial_aid BOOLEAN DEFAULT FALSE,

  -- Anonymization preferences
  always_anonymous BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_community_contributions_school_year ON community_contributions(school_id, application_year);
CREATE INDEX idx_community_contributions_user ON community_contributions(user_id);
CREATE INDEX idx_community_contributions_public ON community_contributions(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_school_stats_school_year ON school_community_stats(school_id, application_year);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_community_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER community_contributions_updated_at
  BEFORE UPDATE ON community_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_community_data_updated_at();

CREATE TRIGGER user_data_sharing_preferences_updated_at
  BEFORE UPDATE ON user_data_sharing_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_community_data_updated_at();

-- Function to recalculate school statistics
CREATE OR REPLACE FUNCTION recalculate_school_stats(p_school_id UUID, p_application_year INTEGER)
RETURNS VOID AS $$
DECLARE
  v_stats RECORD;
BEGIN
  -- Calculate aggregated statistics
  SELECT
    COUNT(*) as total_contributions,
    ROUND(100.0 * COUNT(*) FILTER (WHERE acceptance_status = 'accepted') / NULLIF(COUNT(*), 0), 2) as acceptance_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE acceptance_status = 'waitlisted') / NULLIF(COUNT(*), 0), 2) as waitlist_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE acceptance_status = 'rejected') / NULLIF(COUNT(*), 0), 2) as rejection_rate,
    ROUND(AVG(application_difficulty_rating), 2) as avg_application_difficulty,
    ROUND(AVG(interview_difficulty_rating), 2) as avg_interview_difficulty,
    ROUND(AVG(overall_experience_rating), 2) as avg_overall_experience,
    ROUND(100.0 * COUNT(*) FILTER (WHERE financial_aid_received = TRUE) / NULLIF(COUNT(*), 0), 2) as financial_aid_percentage
  INTO v_stats
  FROM community_contributions
  WHERE school_id = p_school_id
    AND application_year = p_application_year
    AND is_public = TRUE;

  -- Upsert into stats table
  INSERT INTO school_community_stats (
    school_id, application_year, total_contributions,
    acceptance_rate, waitlist_rate, rejection_rate,
    avg_application_difficulty, avg_interview_difficulty, avg_overall_experience,
    financial_aid_percentage, last_updated
  ) VALUES (
    p_school_id, p_application_year, v_stats.total_contributions,
    v_stats.acceptance_rate, v_stats.waitlist_rate, v_stats.rejection_rate,
    v_stats.avg_application_difficulty, v_stats.avg_interview_difficulty, v_stats.avg_overall_experience,
    v_stats.financial_aid_percentage, CURRENT_TIMESTAMP
  )
  ON CONFLICT (school_id, application_year)
  DO UPDATE SET
    total_contributions = v_stats.total_contributions,
    acceptance_rate = v_stats.acceptance_rate,
    waitlist_rate = v_stats.waitlist_rate,
    rejection_rate = v_stats.rejection_rate,
    avg_application_difficulty = v_stats.avg_application_difficulty,
    avg_interview_difficulty = v_stats.avg_interview_difficulty,
    avg_overall_experience = v_stats.avg_overall_experience,
    financial_aid_percentage = v_stats.financial_aid_percentage,
    last_updated = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate stats when contributions change
CREATE OR REPLACE FUNCTION trigger_recalculate_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_school_stats(OLD.school_id, OLD.application_year);
  ELSE
    PERFORM recalculate_school_stats(NEW.school_id, NEW.application_year);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_stats_on_contribution_change
  AFTER INSERT OR UPDATE OR DELETE ON community_contributions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_stats();

COMMENT ON TABLE community_contributions IS 'Anonymized community-contributed application data';
COMMENT ON TABLE school_community_stats IS 'Cached aggregate statistics for school applications';
COMMENT ON TABLE user_data_sharing_preferences IS 'User preferences for data sharing and privacy';
