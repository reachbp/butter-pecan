/**
 * Application Types
 */

export type ApplicationStatus =
  | 'considering'
  | 'applied'
  | 'interviewed'
  | 'accepted'
  | 'waitlisted'
  | 'rejected'
  | 'decided';

export interface Application {
  id: string;
  user_id: string;
  school_id: string;
  grade_applying: string;
  application_year: number;
  status: ApplicationStatus;
  application_date?: string;
  interview_date?: string;
  decision_date?: string;
  decision_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Populated from joins
  school?: {
    id: string;
    name: string;
    short_name?: string;
    city: string;
    grades_offered?: string;
    tuition_range?: string;
    school_type?: string;
    logo_url?: string;
  };
}

export interface CreateApplicationDTO {
  school_id: string;
  grade_applying: string;
  application_year: number;
  status?: ApplicationStatus;
}

export interface UpdateApplicationDTO {
  status?: ApplicationStatus;
  application_date?: string;
  interview_date?: string;
  decision_date?: string;
  decision_type?: string;
  notes?: string;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  considering: 'Considering',
  applied: 'Applied',
  interviewed: 'Interviewed',
  accepted: 'Accepted',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
  decided: 'Decided',
};

export const STATUS_ORDER: ApplicationStatus[] = [
  'considering',
  'applied',
  'interviewed',
  'accepted',
  'waitlisted',
  'rejected',
  'decided',
];
