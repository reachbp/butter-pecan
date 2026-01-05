/**
 * TypeScript types matching PostgreSQL database schema
 */

export type ApplicationStatus =
  | 'considering'
  | 'applied'
  | 'interviewed'
  | 'accepted'
  | 'waitlisted'
  | 'rejected'
  | 'decided';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  user_id: string;
  child_first_name?: string;
  child_last_name?: string;
  current_grade?: string;
  target_graduation_year?: number;
  created_at: Date;
  updated_at: Date;
}

export interface School {
  id: string;
  name: string;
  short_name?: string;
  address?: string;
  city: string;
  state: string;
  zip_code?: string;
  website_url?: string;
  grades_offered?: string;
  tuition_range?: string;
  school_type?: string;
  description?: string;
  logo_url?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Application {
  id: string;
  user_id: string;
  school_id: string;
  grade_applying: string;
  application_year: number;
  status: ApplicationStatus;
  application_date?: Date;
  interview_date?: Date;
  decision_date?: Date;
  decision_type?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  event_type: string;
  event_date: Date;
  old_status?: ApplicationStatus;
  new_status?: ApplicationStatus;
  notes?: string;
  created_at: Date;
}

export interface CommunityData {
  id: string;
  school_id: string;
  grade: string;
  application_year: number;
  total_applications: number;
  total_interviews: number;
  total_acceptances: number;
  total_waitlists: number;
  total_rejections: number;
  last_updated: Date;
}

export interface DecisionTimeline {
  id: string;
  school_id: string;
  grade: string;
  application_year: number;
  decision_type: string;
  reported_date: Date;
  count: number;
  created_at: Date;
}

export interface DiscussionPost {
  id: string;
  school_id?: string;
  grade?: string;
  user_id?: string;
  anonymous_user_id: string;
  category: string;
  title: string;
  content: string;
  upvotes: number;
  created_at: Date;
  updated_at: Date;
}

export interface DiscussionReply {
  id: string;
  post_id: string;
  user_id?: string;
  anonymous_user_id: string;
  content: string;
  upvotes: number;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  deadline_reminders: boolean;
  decision_alerts: boolean;
  waitlist_movement: boolean;
  community_milestones: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at: Date;
  updated_at: Date;
}

// Request/Response DTOs
export interface CreateUserDTO {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface CreateApplicationDTO {
  school_id: string;
  grade_applying: string;
  application_year: number;
  status?: ApplicationStatus;
}

export interface UpdateApplicationDTO {
  status?: ApplicationStatus;
  application_date?: Date;
  interview_date?: Date;
  decision_date?: Date;
  decision_type?: string;
  notes?: string;
}

export interface SchoolStatsDTO {
  school_id: string;
  total_applications: number;
  decisions_received: number;
  acceptance_rate: number;
  waitlist_rate: number;
  rejection_rate: number;
}
