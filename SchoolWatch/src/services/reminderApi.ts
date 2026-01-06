import { API_BASE_URL, getHeaders } from './api';

/**
 * Reminder API Service
 * Handles reminder preferences and deadline notifications
 */

export interface Reminder {
  id: string;
  user_id: string;
  application_id: string;
  reminder_type: 'application_deadline' | 'interview_date' | 'decision_date' | 'custom';
  remind_at: string;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserReminderPreferences {
  id: string;
  user_id: string;
  application_deadline_days: number[];
  interview_date_days: number[];
  decision_date_days: number[];
  notification_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateReminderPreferencesDTO {
  application_deadline_days?: number[];
  interview_date_days?: number[];
  decision_date_days?: number[];
  notification_enabled?: boolean;
  email_enabled?: boolean;
  push_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface CreateReminderDTO {
  application_id: string;
  reminder_type: Reminder['reminder_type'];
  remind_at: string;
}

export const reminderApi = {
  /**
   * Get user's reminder preferences
   */
  getPreferences: async (): Promise<{ success: boolean; preferences: UserReminderPreferences }> => {
    const response = await fetch(`${API_BASE_URL}/reminders/preferences`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Update user's reminder preferences
   */
  updatePreferences: async (
    updates: UpdateReminderPreferencesDTO
  ): Promise<{ success: boolean; preferences: UserReminderPreferences }> => {
    const response = await fetch(`${API_BASE_URL}/reminders/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  /**
   * Get all reminders for the user
   */
  getAll: async (includeSent: boolean = false): Promise<{ success: boolean; reminders: Reminder[] }> => {
    const params = new URLSearchParams();
    if (includeSent) {
      params.append('include_sent', 'true');
    }

    const response = await fetch(`${API_BASE_URL}/reminders?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Get reminders for a specific application
   */
  getByApplicationId: async (applicationId: string): Promise<{ success: boolean; reminders: Reminder[] }> => {
    const response = await fetch(`${API_BASE_URL}/reminders/application/${applicationId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Create a new reminder
   */
  create: async (data: CreateReminderDTO): Promise<{ success: boolean; reminder: Reminder }> => {
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Auto-create reminders for an application based on user preferences
   */
  autoCreate: async (applicationId: string): Promise<{ success: boolean; reminders: Reminder[]; count: number }> => {
    const response = await fetch(`${API_BASE_URL}/reminders/auto-create/${applicationId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Delete a reminder
   */
  delete: async (reminderId: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/reminders/${reminderId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  },
};

export default reminderApi;
