-- SchoolWatch Database Schema
-- PostgreSQL Database Schema for Bay Area Private School Admissions Tracker

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_first_name VARCHAR(100),
  child_last_name VARCHAR(100),
  current_grade VARCHAR(20),
  target_graduation_year INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schools Table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100),
  address TEXT,
  city VARCHAR(100) DEFAULT 'San Francisco',
  state VARCHAR(2) DEFAULT 'CA',
  zip_code VARCHAR(10),
  website_url VARCHAR(500),
  grades_offered VARCHAR(100), -- e.g., "K-8", "9-12"
  tuition_range VARCHAR(100),  -- e.g., "$45,000-$55,000"
  school_type VARCHAR(50),     -- e.g., "Independent", "Montessori", "Progressive"
  description TEXT,
  logo_url VARCHAR(500),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application Status Enum Type
CREATE TYPE application_status AS ENUM (
  'considering',
  'applied',
  'interviewed',
  'accepted',
  'waitlisted',
  'rejected',
  'decided'
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  grade_applying VARCHAR(20) NOT NULL,
  application_year INTEGER NOT NULL,
  status application_status DEFAULT 'considering',
  application_date DATE,
  interview_date DATE,
  decision_date DATE,
  decision_type VARCHAR(50), -- 'Accepted', 'Waitlisted', 'Rejected'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, school_id, application_year)
);

-- Application Timeline Events Table
CREATE TABLE IF NOT EXISTS application_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'status_change', 'interview_scheduled', 'decision_received'
  event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_status application_status,
  new_status application_status,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community Data Aggregation Table (Anonymous)
CREATE TABLE IF NOT EXISTS community_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  grade VARCHAR(20) NOT NULL,
  application_year INTEGER NOT NULL,
  total_applications INTEGER DEFAULT 0,
  total_interviews INTEGER DEFAULT 0,
  total_acceptances INTEGER DEFAULT 0,
  total_waitlists INTEGER DEFAULT 0,
  total_rejections INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(school_id, grade, application_year)
);

-- Decision Timeline Tracking (Anonymous)
CREATE TABLE IF NOT EXISTS decision_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  grade VARCHAR(20) NOT NULL,
  application_year INTEGER NOT NULL,
  decision_type VARCHAR(50) NOT NULL, -- 'Accepted', 'Waitlisted', 'Rejected'
  reported_date DATE NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community Discussion Posts (Anonymous)
CREATE TABLE IF NOT EXISTS discussion_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  grade VARCHAR(20),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  anonymous_user_id UUID NOT NULL, -- Generated per session for anonymity
  category VARCHAR(50) NOT NULL, -- 'interviews', 'decisions', 'general'
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion Replies
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  anonymous_user_id UUID NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deadline_reminders BOOLEAN DEFAULT TRUE,
  decision_alerts BOOLEAN DEFAULT TRUE,
  waitlist_movement BOOLEAN DEFAULT TRUE,
  community_milestones BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_school_id ON applications(school_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_year ON applications(application_year);
CREATE INDEX idx_community_data_school_year ON community_data(school_id, application_year);
CREATE INDEX idx_decision_timeline_school_year ON decision_timeline(school_id, application_year);
CREATE INDEX idx_discussion_posts_school ON discussion_posts(school_id);
CREATE INDEX idx_discussion_posts_category ON discussion_posts(category);
CREATE INDEX idx_discussion_replies_post ON discussion_replies(post_id);

-- Create Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply Updated_at Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_posts_updated_at BEFORE UPDATE ON discussion_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at BEFORE UPDATE ON discussion_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
