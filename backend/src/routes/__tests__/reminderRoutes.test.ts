import request from 'supertest';
import express from 'express';
import reminderRoutes from '../reminderRoutes';
import { ReminderModel } from '../../models/Reminder';

// Mock the Reminder model
jest.mock('../../models/Reminder');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.headers['x-user-id'] = 'test-user-1';
  next();
});
app.use('/api/reminders', reminderRoutes);

describe('Reminder Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reminders/preferences', () => {
    it('should get user preferences', async () => {
      const mockPreferences = {
        id: 'pref-1',
        user_id: 'test-user-1',
        application_deadline_days: [7, 3, 1],
        notification_enabled: true,
      };

      (ReminderModel.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);

      const response = await request(app).get('/api/reminders/preferences');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.preferences).toEqual(mockPreferences);
    });

    it('should create default preferences if none exist', async () => {
      const mockDefaultPrefs = {
        id: 'pref-1',
        user_id: 'test-user-1',
        application_deadline_days: [7, 3, 1],
        interview_date_days: [7, 3, 1],
        decision_date_days: [7, 3, 1],
        notification_enabled: true,
      };

      (ReminderModel.getPreferences as jest.Mock).mockResolvedValue(null);
      (ReminderModel.upsertPreferences as jest.Mock).mockResolvedValue(mockDefaultPrefs);

      const response = await request(app).get('/api/reminders/preferences');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(ReminderModel.upsertPreferences).toHaveBeenCalled();
    });
  });

  describe('PUT /api/reminders/preferences', () => {
    it('should update user preferences', async () => {
      const updates = {
        notification_enabled: false,
        push_enabled: false,
      };

      const mockUpdated = {
        id: 'pref-1',
        user_id: 'test-user-1',
        ...updates,
      };

      (ReminderModel.upsertPreferences as jest.Mock).mockResolvedValue(mockUpdated);

      const response = await request(app)
        .put('/api/reminders/preferences')
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.preferences).toMatchObject(updates);
      expect(ReminderModel.upsertPreferences).toHaveBeenCalledWith('test-user-1', updates);
    });
  });

  describe('GET /api/reminders', () => {
    it('should get all reminders for user', async () => {
      const mockReminders = [
        {
          id: 'reminder-1',
          user_id: 'test-user-1',
          application_id: 'app-1',
          reminder_type: 'application_deadline',
          is_sent: false,
        },
        {
          id: 'reminder-2',
          user_id: 'test-user-1',
          application_id: 'app-2',
          reminder_type: 'interview_date',
          is_sent: false,
        },
      ];

      (ReminderModel.findByUserId as jest.Mock).mockResolvedValue(mockReminders);

      const response = await request(app).get('/api/reminders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.reminders).toEqual(mockReminders);
      expect(ReminderModel.findByUserId).toHaveBeenCalledWith('test-user-1', false);
    });

    it('should include sent reminders when requested', async () => {
      (ReminderModel.findByUserId as jest.Mock).mockResolvedValue([]);

      await request(app).get('/api/reminders?include_sent=true');

      expect(ReminderModel.findByUserId).toHaveBeenCalledWith('test-user-1', true);
    });
  });

  describe('GET /api/reminders/application/:applicationId', () => {
    it('should get reminders for a specific application', async () => {
      const mockReminders = [
        {
          id: 'reminder-1',
          application_id: 'app-1',
          reminder_type: 'application_deadline',
        },
      ];

      (ReminderModel.findByApplicationId as jest.Mock).mockResolvedValue(mockReminders);

      const response = await request(app).get('/api/reminders/application/app-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.reminders).toEqual(mockReminders);
    });
  });

  describe('POST /api/reminders', () => {
    it('should create a new reminder', async () => {
      const reminderData = {
        application_id: 'app-1',
        reminder_type: 'application_deadline',
        remind_at: '2026-02-01T09:00:00Z',
      };

      const mockReminder = {
        id: 'reminder-1',
        user_id: 'test-user-1',
        ...reminderData,
        is_sent: false,
      };

      (ReminderModel.create as jest.Mock).mockResolvedValue(mockReminder);

      const response = await request(app)
        .post('/api/reminders')
        .send(reminderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.reminder).toEqual(mockReminder);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/reminders')
        .send({ application_id: 'app-1' }); // Missing reminder_type and remind_at

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('POST /api/reminders/auto-create/:applicationId', () => {
    it('should auto-create reminders for an application', async () => {
      const mockReminders = [
        { id: 'reminder-1', reminder_type: 'application_deadline' },
        { id: 'reminder-2', reminder_type: 'interview_date' },
      ];

      (ReminderModel.autoCreateReminders as jest.Mock).mockResolvedValue(mockReminders);

      const response = await request(app).post('/api/reminders/auto-create/app-1');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.reminders).toEqual(mockReminders);
      expect(response.body.count).toBe(2);
      expect(ReminderModel.autoCreateReminders).toHaveBeenCalledWith('test-user-1', 'app-1');
    });
  });

  describe('DELETE /api/reminders/:id', () => {
    it('should delete a reminder', async () => {
      (ReminderModel.delete as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete('/api/reminders/reminder-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(ReminderModel.delete).toHaveBeenCalledWith('reminder-1', 'test-user-1');
    });

    it('should return 404 if reminder not found', async () => {
      (ReminderModel.delete as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete('/api/reminders/reminder-999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
