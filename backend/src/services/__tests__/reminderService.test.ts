import { ReminderService } from '../reminderService';
import { ReminderModel } from '../../models/Reminder';

jest.mock('../../models/Reminder');

describe('ReminderService', () => {
  let service: ReminderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReminderService();
  });

  afterEach(() => {
    service.stop();
  });

  describe('start', () => {
    it('should start the reminder service', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      service.start(5);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting reminder service')
      );

      consoleLogSpy.mockRestore();
    });

    it('should not start if already running', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      service.start(5);
      service.start(5); // Try to start again

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Reminder service is already running'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('stop', () => {
    it('should stop the reminder service', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      service.start(5);
      service.stop();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Reminder service stopped')
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('checkNow', () => {
    it('should check for pending reminders', async () => {
      const mockPendingReminders = [
        {
          id: 'reminder-1',
          user_id: 'user-1',
          application_id: 'app-1',
          reminder_type: 'application_deadline',
          remind_at: new Date().toISOString(),
          is_sent: false,
          application: { id: 'app-1' },
          school: { name: 'Test School' },
        },
      ];

      (ReminderModel.getPendingReminders as jest.Mock).mockResolvedValue(mockPendingReminders);
      (ReminderModel.markAsSent as jest.Mock).mockResolvedValue(true);

      const count = await service.checkNow();

      expect(count).toBe(0); // After processing, should be 0 pending
      expect(ReminderModel.markAsSent).toHaveBeenCalledWith('reminder-1');
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (ReminderModel.getPendingReminders as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await service.checkNow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error checking reminders:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('processReminder', () => {
    it('should process reminders and log notifications', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const mockReminders = [
        {
          id: 'reminder-1',
          user_id: 'user-1',
          application_id: 'app-1',
          reminder_type: 'application_deadline',
          remind_at: new Date().toISOString(),
          is_sent: false,
          application: { id: 'app-1' },
          school: { name: 'Test School' },
        },
      ];

      (ReminderModel.getPendingReminders as jest.Mock).mockResolvedValue(mockReminders);
      (ReminderModel.markAsSent as jest.Mock).mockResolvedValue(true);

      await service.checkNow();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Found 1 pending reminder')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📨 Reminder notification:',
        expect.objectContaining({
          type: 'application_deadline',
          school: 'Test School',
        })
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('createNotification', () => {
    it('should create proper notification messages for different reminder types', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const mockReminders = [
        {
          id: 'reminder-1',
          reminder_type: 'application_deadline',
          remind_at: '2026-02-01T09:00:00Z',
          school: { name: 'Test School' },
          application: {},
        },
        {
          id: 'reminder-2',
          reminder_type: 'interview_date',
          remind_at: '2026-02-15T09:00:00Z',
          school: { name: 'Interview School' },
          application: {},
        },
        {
          id: 'reminder-3',
          reminder_type: 'decision_date',
          remind_at: '2026-03-01T09:00:00Z',
          school: { name: 'Decision School' },
          application: {},
        },
      ];

      for (const reminder of mockReminders) {
        (ReminderModel.getPendingReminders as jest.Mock).mockResolvedValueOnce([reminder]);
        (ReminderModel.markAsSent as jest.Mock).mockResolvedValue(true);

        await service.checkNow();
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📨 Reminder notification:',
        expect.objectContaining({
          message: expect.stringContaining('Test School'),
        })
      );

      consoleLogSpy.mockRestore();
    });
  });
});
