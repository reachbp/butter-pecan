/**
 * API Service
 * Handles all backend API calls
 */

import { School } from '../types/onboarding';
import {
  Application,
  CreateApplicationDTO,
  UpdateApplicationDTO,
} from '../types/application';

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

/**
 * Application API
 */
export const applicationsApi = {
  /**
   * Get all applications for current user
   */
  getAll: async (): Promise<{ success: boolean; count: number; applications: Application[] }> => {
    return apiFetch<{ success: boolean; count: number; applications: Application[] }>('/applications');
  },

  /**
   * Get applications by status
   */
  getByStatus: async (status: string): Promise<{ success: boolean; applications: Application[] }> => {
    return apiFetch<{ success: boolean; applications: Application[] }>(`/applications?status=${status}`);
  },

  /**
   * Get application by ID
   */
  getById: async (id: string): Promise<{ success: boolean; application: Application }> => {
    return apiFetch<{ success: boolean; application: Application }>(`/applications/${id}`);
  },

  /**
   * Create new application
   */
  create: async (data: CreateApplicationDTO): Promise<{ success: boolean; application: Application }> => {
    return apiFetch<{ success: boolean; application: Application }>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update application
   */
  update: async (id: string, data: UpdateApplicationDTO): Promise<{ success: boolean; application: Application }> => {
    return apiFetch<{ success: boolean; application: Application }>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete application
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`/applications/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get application statistics
   */
  getStats: async (): Promise<{
    success: boolean;
    stats: { total: number; byStatus: Record<string, number> };
  }> => {
    return apiFetch('/applications/stats');
  },

  /**
   * Get upcoming deadlines
   */
  getDeadlines: async (days: number = 7): Promise<{
    success: boolean;
    count: number;
    applications: Application[];
  }> => {
    return apiFetch(`/applications/deadlines?days=${days}`);
  },
};

export default {
  schools: schoolsApi,
  applications: applicationsApi,
};
