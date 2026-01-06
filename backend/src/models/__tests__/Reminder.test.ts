import { ReminderModel } from '../Reminder';
import { query } from '../database';

// Mock database query
jest.mock('../database', () => ({
  query: jest.fn(),
}));

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('ReminderModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should get user reminder preferences', async () => {
      const mockPreferences = {
        id: 'pref-1',
        user_id: 'user-1',
        application_deadline_days: [7, 3, 1],
        interview_date_days: [7, 3, 1],
        decision_date_days: [7, 3, 1],
        notification_enabled: true,
        email_enabled: true,
        push_enabled: true,
        quiet_hours_start: '22:00:00',
        quiet_hours_end: '08:00:00',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockPreferences] } as any);

      const result = await ReminderModel.getPreferences('user-1');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM user_reminder_preferences WHERE user_id = $1',
        ['user-1']
      );
      expect(result).toEqual(mockPreferences);
    });

    it('should return null if no preferences exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await ReminderModel.getPreferences('user-1');

      expect(result).toBeNull();
    });
  });

  describe('upsertPreferences', () => {
    it('should create or update user preferences', async () => {
      const updates = {
        notification_enabled: false,
        push_enabled: false,
      };

      const mockUpdated = {
        id: 'pref-1',
        user_id: 'user-1',
        ...updates,
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUpdated] } as any);

      const result = await ReminderModel.upsertPreferences('user-1', updates);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toMatchObject(updates);
    });
  });

  describe('create', () => {
    it('should create a new reminder', async () => {
      const reminderData = {
        application_id: 'app-1',
        reminder_type: 'application_deadline' as const,
        remind_at: '2026-02-01T09:00:00Z',
      };

      const mockReminder = {
        id: 'reminder-1',
        user_id: 'user-1',
        ...reminderData,
        is_sent: false,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockReminder] } as any);

      const result = await ReminderModel.create('user-1', reminderData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO reminders'),
        ['user-1', reminderData.application_id, reminderData.reminder_type, reminderData.remind_at]
      );
      expect(result).toEqual(mockReminder);
    });
  });

  describe('findByUserId', () => {
    it('should get all reminders for a user (excluding sent)', async () => {
      const mockReminders = [
        {
          id: 'reminder-1',
          user_id: 'user-1',
          application_id: 'app-1',
          reminder_type: 'application_deadline',
          remind_at: '2026-02-01',
          is_sent: false,
        },
        {
          id: 'reminder-2',
          user_id: 'user-1',
          application_id: 'app-2',
          reminder_type: 'interview_date',
          remind_at: '2026-02-15',
          is_sent: false,
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockReminders } as any);

      const result = await ReminderModel.findByUserId('user-1', false);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('is_sent = FALSE'),
        ['user-1']
      );
      expect(result).toEqual(mockReminders);
      expect(result).toHaveLength(2);
    });

    it('should include sent reminders when requested', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await ReminderModel.findByUserId('user-1', true);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.not.stringContaining('is_sent = FALSE'),
        ['user-1']
      );
    });
  });

  describe('findByApplicationId', () => {
    it('should get reminders for a specific application', async () => {
      const mockReminders = [
        {
          id: 'reminder-1',
          application_id: 'app-1',
          reminder_type: 'application_deadline',
          is_sent: false,
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockReminders } as any);

      const result = await ReminderModel.findByApplicationId('app-1');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('application_id = $1'),
        ['app-1']
      );
      expect(result).toEqual(mockReminders);
    });
  });

  describe('getPendingReminders', () => {
    it('should get reminders that are due', async () => {
      const now = new Date('2026-02-01T10:00:00Z');
      const mockReminders = [
        {
          id: 'reminder-1',
          remind_at: '2026-02-01T09:00:00Z',
          is_sent: false,
          application: { id: 'app-1' },
          school: { id: 'school-1', name: 'Test School' },
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockReminders } as any);

      const result = await ReminderModel.getPendingReminders(now);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('is_sent = FALSE AND r.remind_at <= $1'),
        [now.toISOString()]
      );
      expect(result).toEqual(mockReminders);
    });
  });

  describe('markAsSent', () => {
    it('should mark a reminder as sent', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 } as any);

      const result = await ReminderModel.markAsSent('reminder-1');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reminders SET is_sent = TRUE'),
        ['reminder-1']
      );
      expect(result).toBe(true);
    });

    it('should return false if reminder not found', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 } as any);

      const result = await ReminderModel.markAsSent('reminder-999');

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a reminder', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 } as any);

      const result = await ReminderModel.delete('reminder-1', 'user-1');

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM reminders WHERE id = $1 AND user_id = $2',
        ['reminder-1', 'user-1']
      );
      expect(result).toBe(true);
    });
  });

  describe('deleteByApplicationId', () => {
    it('should delete all reminders for an application', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 3 } as any);

      const result = await ReminderModel.deleteByApplicationId('app-1');

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM reminders WHERE application_id = $1',
        ['app-1']
      );
      expect(result).toBe(true);
    });
  });

  describe('autoCreateReminders', () => {
    it('should create reminders based on user preferences', async () => {
      const mockPreferences = {
        notification_enabled: true,
        application_deadline_days: [7, 3],
        interview_date_days: [3],
        decision_date_days: [7],
      };

      const mockApplication = {
        id: 'app-1',
        user_id: 'user-1',
        application_date: '2026-03-01',
        interview_date: '2026-03-15',
        decision_date: '2026-04-01',
      };

      // Mock getPreferences
      mockQuery.mockResolvedValueOnce({ rows: [mockPreferences] } as any);
      // Mock get application
      mockQuery.mockResolvedValueOnce({ rows: [mockApplication] } as any);
      // Mock create reminders (4 total: 2 for app, 1 for interview, 1 for decision)
      mockQuery.mockResolvedValue({ rows: [{ id: 'reminder-1' }] } as any);

      const result = await ReminderModel.autoCreateReminders('user-1', 'app-1');

      // Should create multiple reminders
      expect(result.length).toBeGreaterThan(0);
    });

    it('should not create reminders if notifications are disabled', async () => {
      const mockPreferences = {
        notification_enabled: false,
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockPreferences] } as any);

      const result = await ReminderModel.autoCreateReminders('user-1', 'app-1');

      expect(result).toEqual([]);
    });

    it('should not create reminders for past dates', async () => {
      const mockPreferences = {
        notification_enabled: true,
        application_deadline_days: [7, 3, 1],
      };

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const mockApplication = {
        id: 'app-1',
        user_id: 'user-1',
        application_date: pastDate.toISOString(),
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockPreferences] } as any);
      mockQuery.mockResolvedValueOnce({ rows: [mockApplication] } as any);

      const result = await ReminderModel.autoCreateReminders('user-1', 'app-1');

      expect(result).toEqual([]);
    });
  });
});
