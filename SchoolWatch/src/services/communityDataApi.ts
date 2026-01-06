import { API_BASE_URL, getHeaders } from './api';

/**
 * Community Data API Service
 * Handles community-contributed data and school statistics
 */

export interface CommunityContribution {
  id: string;
  user_id: string;
  school_id: string;
  application_year: number;
  grade_applied?: string;
  acceptance_status?: 'accepted' | 'waitlisted' | 'rejected';
  gender?: string;
  legacy_status?: boolean;
  standardized_test_score?: number;
  application_submitted_date?: string;
  interview_date?: string;
  decision_received_date?: string;
  application_difficulty_rating?: number;
  interview_difficulty_rating?: number;
  overall_experience_rating?: number;
  financial_aid_received?: boolean;
  financial_aid_amount_range?: string;
  is_verified: boolean;
  is_public: boolean;
  verification_method?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolCommunityStats {
  id: string;
  school_id: string;
  application_year: number;
  total_contributions: number;
  acceptance_rate?: number;
  waitlist_rate?: number;
  rejection_rate?: number;
  avg_application_difficulty?: number;
  avg_interview_difficulty?: number;
  avg_overall_experience?: number;
  financial_aid_percentage?: number;
  avg_days_to_interview?: number;
  avg_days_to_decision?: number;
  last_updated: string;
  created_at: string;
}

export interface UserDataSharingPreferences {
  id: string;
  user_id: string;
  share_outcomes: boolean;
  share_timeline: boolean;
  share_ratings: boolean;
  share_demographics: boolean;
  share_financial_aid: boolean;
  always_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContributionDTO {
  school_id: string;
  application_year: number;
  grade_applied?: string;
  acceptance_status?: 'accepted' | 'waitlisted' | 'rejected';
  gender?: string;
  legacy_status?: boolean;
  standardized_test_score?: number;
  application_submitted_date?: string;
  interview_date?: string;
  decision_received_date?: string;
  application_difficulty_rating?: number;
  interview_difficulty_rating?: number;
  overall_experience_rating?: number;
  financial_aid_received?: boolean;
  financial_aid_amount_range?: string;
}

export const communityDataApi = {
  /**
   * Get user's data sharing preferences
   */
  getSharingPreferences: async (): Promise<{
    success: boolean;
    preferences: UserDataSharingPreferences;
  }> => {
    const response = await fetch(`${API_BASE_URL}/community/preferences`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Update user's data sharing preferences
   */
  updateSharingPreferences: async (
    updates: Partial<UserDataSharingPreferences>
  ): Promise<{ success: boolean; preferences: UserDataSharingPreferences }> => {
    const response = await fetch(`${API_BASE_URL}/community/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  /**
   * Create a new community contribution
   */
  createContribution: async (
    data: CreateContributionDTO
  ): Promise<{ success: boolean; contribution: CommunityContribution }> => {
    const response = await fetch(`${API_BASE_URL}/community/contributions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Get user's contributions
   */
  getMyContributions: async (): Promise<{
    success: boolean;
    contributions: CommunityContribution[];
  }> => {
    const response = await fetch(`${API_BASE_URL}/community/contributions`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Update a contribution
   */
  updateContribution: async (
    id: string,
    updates: Partial<CreateContributionDTO>
  ): Promise<{ success: boolean; contribution: CommunityContribution }> => {
    const response = await fetch(`${API_BASE_URL}/community/contributions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  /**
   * Delete a contribution
   */
  deleteContribution: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/community/contributions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Get school community stats for a specific year
   */
  getSchoolStats: async (
    schoolId: string,
    year?: number
  ): Promise<{ success: boolean; stats: SchoolCommunityStats | null }> => {
    const params = new URLSearchParams();
    if (year) {
      params.append('year', year.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/community/schools/${schoolId}/stats?${params.toString()}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );
    return response.json();
  },

  /**
   * Get historical stats for a school
   */
  getSchoolHistory: async (
    schoolId: string,
    yearsBack?: number
  ): Promise<{ success: boolean; history: SchoolCommunityStats[] }> => {
    const params = new URLSearchParams();
    if (yearsBack) {
      params.append('years_back', yearsBack.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/community/schools/${schoolId}/history?${params.toString()}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );
    return response.json();
  },

  /**
   * Get anonymized public contributions for a school
   */
  getPublicContributions: async (
    schoolId: string,
    year?: number,
    limit?: number
  ): Promise<{ success: boolean; contributions: Partial<CommunityContribution>[] }> => {
    const params = new URLSearchParams();
    if (year) {
      params.append('year', year.toString());
    }
    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/community/schools/${schoolId}/contributions?${params.toString()}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );
    return response.json();
  },

  /**
   * Get top schools by acceptance rate
   */
  getTopSchools: async (
    year?: number,
    limit?: number
  ): Promise<{ success: boolean; schools: any[] }> => {
    const params = new URLSearchParams();
    if (year) {
      params.append('year', year.toString());
    }
    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await fetch(`${API_BASE_URL}/community/top-schools?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Compare statistics for multiple schools
   */
  compareSchools: async (
    schoolIds: string[],
    year?: number
  ): Promise<{ success: boolean; comparison: any[] }> => {
    const response = await fetch(`${API_BASE_URL}/community/compare`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        school_ids: schoolIds,
        year: year || new Date().getFullYear() + 1,
      }),
    });
    return response.json();
  },
};

export default communityDataApi;
