/**
 * API Service
 * Handles all backend API calls
 */

import { School } from '../types/onboarding';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.schoolwatch.app/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * School API
 */
export const schoolsApi = {
  /**
   * Get all schools
   */
  getAll: async (): Promise<{ success: boolean; count: number; schools: School[] }> => {
    return apiFetch<{ success: boolean; count: number; schools: School[] }>('/schools');
  },

  /**
   * Search schools by name
   */
  search: async (term: string): Promise<{ success: boolean; schools: School[] }> => {
    return apiFetch<{ success: boolean; schools: School[] }>(`/schools?search=${encodeURIComponent(term)}`);
  },

  /**
   * Filter schools by city
   */
  filterByCity: async (city: string): Promise<{ success: boolean; schools: School[] }> => {
    return apiFetch<{ success: boolean; schools: School[] }>(`/schools?city=${encodeURIComponent(city)}`);
  },

  /**
   * Filter schools by type
   */
  filterByType: async (type: string): Promise<{ success: boolean; schools: School[] }> => {
    return apiFetch<{ success: boolean; schools: School[] }>(`/schools?type=${encodeURIComponent(type)}`);
  },

  /**
   * Get school by ID
   */
  getById: async (id: string): Promise<{ success: boolean; school: School }> => {
    return apiFetch<{ success: boolean; school: School }>(`/schools/${id}`);
  },

  /**
   * Get school statistics summary
   */
  getStatsSummary: async (): Promise<{
    success: boolean;
    summary: {
      total: number;
      byCity: { city: string; count: number }[];
      byType: { school_type: string; count: number }[];
    };
  }> => {
    return apiFetch('/schools/stats/summary');
  },
};

export default {
  schools: schoolsApi,
};
