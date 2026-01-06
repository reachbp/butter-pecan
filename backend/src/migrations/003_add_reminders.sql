-- Migration 003: Add Reminder Preferences and Settings
-- This migration adds support for deadline reminders and notification preferences

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('application_deadline', 'interview_date', 'decision_date', 'custom')),
  remind_at TIMESTAMP NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user reminder preferences table
CREATE TABLE IF NOT EXISTS user_reminder_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  application_deadline_days INTEGER[] DEFAULT ARRAY[7, 3, 1], -- Days before to remind
  interview_date_days INTEGER[] DEFAULT ARRAY[7, 3, 1],
  decision_date_days INTEGER[] DEFAULT ARRAY[7, 3, 1],
  notification_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_application_id ON reminders(application_id);
CREATE INDEX idx_reminders_remind_at ON reminders(remind_at) WHERE is_sent = FALSE;
CREATE INDEX idx_reminders_not_sent ON reminders(is_sent) WHERE is_sent = FALSE;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_reminders_updated_at();

CREATE TRIGGER user_reminder_preferences_updated_at
  BEFORE UPDATE ON user_reminder_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_reminders_updated_at();

-- Insert default preferences for existing users (if any)
INSERT INTO user_reminder_preferences (user_id)
SELECT DISTINCT user_id FROM applications
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE reminders IS 'Stores individual reminder instances for application deadlines';
COMMENT ON TABLE user_reminder_preferences IS 'User-specific reminder and notification preferences';
