/**
 * Onboarding Types
 */

export interface OnboardingData {
  childFirstName?: string;
  childGrade: string;
  targetGraduationYear: number;
  applicationYear: number;
  selectedSchools: string[]; // Array of school IDs
}

export const GRADES = [
  { value: 'PK', label: 'Pre-K' },
  { value: 'K', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade (Freshman)' },
  { value: '10', label: '10th Grade (Sophomore)' },
  { value: '11', label: '11th Grade (Junior)' },
  { value: '12', label: '12th Grade (Senior)' },
] as const;

export type GradeValue = typeof GRADES[number]['value'];

export interface School {
  id: string;
  name: string;
  short_name?: string;
  city: string;
  grades_offered?: string;
  tuition_range?: string;
  school_type?: string;
  description?: string;
}
