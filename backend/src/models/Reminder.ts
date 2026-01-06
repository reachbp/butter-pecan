import { query } from './database';

/**
 * Reminder Model
 * Manages deadline reminders and notification preferences
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

export interface CreateReminderDTO {
  application_id: string;
  reminder_type: Reminder['reminder_type'];
  remind_at: string;
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

export class ReminderModel {
  /**
   * Get user's reminder preferences
   */
  static async getPreferences(userId: string): Promise<UserReminderPreferences | null> {
    const result = await query(
      'SELECT * FROM user_reminder_preferences WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Create or update user reminder preferences
   */
  static async upsertPreferences(
    userId: string,
    preferences: UpdateReminderPreferencesDTO
  ): Promise<UserReminderPreferences> {
    const fields = Object.keys(preferences);
    const values = Object.values(preferences);

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');

    const result = await query(
      `INSERT INTO user_reminder_preferences (user_id, ${fields.join(', ')})
       VALUES ($1, ${fields.map((_, i) => `$${i + 2}`).join(', ')})
       ON CONFLICT (user_id)
       DO UPDATE SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, ...values, ...values]
    );

    return result.rows[0];
  }

  /**
   * Create a reminder
   */
  static async create(userId: string, data: CreateReminderDTO): Promise<Reminder> {
    const result = await query(
      `INSERT INTO reminders (user_id, application_id, reminder_type, remind_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, data.application_id, data.reminder_type, data.remind_at]
    );
    return result.rows[0];
  }

  /**
   * Get all reminders for a user
   */
  static async findByUserId(userId: string, includesSent: boolean = false): Promise<Reminder[]> {
    const query_str = includesSent
      ? 'SELECT * FROM reminders WHERE user_id = $1 ORDER BY remind_at ASC'
      : 'SELECT * FROM reminders WHERE user_id = $1 AND is_sent = FALSE ORDER BY remind_at ASC';

    const result = await query(query_str, [userId]);
    return result.rows;
  }

  /**
   * Get reminders for a specific application
   */
  static async findByApplicationId(applicationId: string): Promise<Reminder[]> {
    const result = await query(
      'SELECT * FROM reminders WHERE application_id = $1 AND is_sent = FALSE ORDER BY remind_at ASC',
      [applicationId]
    );
    return result.rows;
  }

  /**
   * Get pending reminders that need to be sent
   */
  static async getPendingReminders(beforeTime?: Date): Promise<Reminder[]> {
    const time = beforeTime || new Date();
    const result = await query(
      `SELECT
        r.*,
        json_build_object(
          'id', a.id,
          'school_id', a.school_id,
          'status', a.status,
          'application_date', a.application_date,
          'interview_date', a.interview_date,
          'decision_date', a.decision_date
        ) as application,
        json_build_object(
          'id', s.id,
          'name', s.name,
          'short_name', s.short_name
        ) as school
      FROM reminders r
      JOIN applications a ON r.application_id = a.id
      JOIN schools s ON a.school_id = s.id
      WHERE r.is_sent = FALSE AND r.remind_at <= $1
      ORDER BY r.remind_at ASC`,
      [time.toISOString()]
    );
    return result.rows;
  }

  /**
   * Mark reminder as sent
   */
  static async markAsSent(reminderId: string): Promise<boolean> {
    const result = await query(
      'UPDATE reminders SET is_sent = TRUE, sent_at = CURRENT_TIMESTAMP WHERE id = $1',
      [reminderId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete a reminder
   */
  static async delete(reminderId: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM reminders WHERE id = $1 AND user_id = $2',
      [reminderId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all reminders for an application
   */
  static async deleteByApplicationId(applicationId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM reminders WHERE application_id = $1',
      [applicationId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Auto-create reminders for an application based on user preferences
   */
  static async autoCreateReminders(userId: string, applicationId: string): Promise<Reminder[]> {
    // Get user preferences
    const preferences = await this.getPreferences(userId);
    if (!preferences || !preferences.notification_enabled) {
      return [];
    }

    // Get application details
    const appResult = await query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
      [applicationId, userId]
    );
    const application = appResult.rows[0];
    if (!application) {
      return [];
    }

    const reminders: Reminder[] = [];

    // Create reminders for application deadline
    if (application.application_date && preferences.application_deadline_days) {
      for (const days of preferences.application_deadline_days) {
        const remindAt = new Date(application.application_date);
        remindAt.setDate(remindAt.getDate() - days);

        if (remindAt > new Date()) {
          const reminder = await this.create(userId, {
            application_id: applicationId,
            reminder_type: 'application_deadline',
            remind_at: remindAt.toISOString(),
          });
          reminders.push(reminder);
        }
      }
    }

    // Create reminders for interview date
    if (application.interview_date && preferences.interview_date_days) {
      for (const days of preferences.interview_date_days) {
        const remindAt = new Date(application.interview_date);
        remindAt.setDate(remindAt.getDate() - days);

        if (remindAt > new Date()) {
          const reminder = await this.create(userId, {
            application_id: applicationId,
            reminder_type: 'interview_date',
            remind_at: remindAt.toISOString(),
          });
          reminders.push(reminder);
        }
      }
    }

    // Create reminders for decision date
    if (application.decision_date && preferences.decision_date_days) {
      for (const days of preferences.decision_date_days) {
        const remindAt = new Date(application.decision_date);
        remindAt.setDate(remindAt.getDate() - days);

        if (remindAt > new Date()) {
          const reminder = await this.create(userId, {
            application_id: applicationId,
            reminder_type: 'decision_date',
            remind_at: remindAt.toISOString(),
          });
          reminders.push(reminder);
        }
      }
    }

    return reminders;
  }
}

export default ReminderModel;
