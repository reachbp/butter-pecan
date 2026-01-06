import { Router, Request, Response } from 'express';
import { ReminderModel } from '../models/Reminder';

const router = Router();

/**
 * GET /api/reminders/preferences
 * Get user's reminder preferences
 */
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const preferences = await ReminderModel.getPreferences(userId);

    // Create default preferences if none exist
    if (!preferences) {
      const defaultPrefs = await ReminderModel.upsertPreferences(userId, {
        application_deadline_days: [7, 3, 1],
        interview_date_days: [7, 3, 1],
        decision_date_days: [7, 3, 1],
        notification_enabled: true,
        email_enabled: true,
        push_enabled: true,
      });
      return res.json({ success: true, preferences: defaultPrefs });
    }

    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to get preferences' });
  }
});

/**
 * PUT /api/reminders/preferences
 * Update user's reminder preferences
 */
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const updates = req.body;

    const preferences = await ReminderModel.upsertPreferences(userId, updates);
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

/**
 * GET /api/reminders
 * Get all reminders for the user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const includeSent = req.query.include_sent === 'true';

    const reminders = await ReminderModel.findByUserId(userId, includeSent);
    res.json({ success: true, reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ success: false, error: 'Failed to get reminders' });
  }
});

/**
 * GET /api/reminders/application/:applicationId
 * Get reminders for a specific application
 */
router.get('/application/:applicationId', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const reminders = await ReminderModel.findByApplicationId(applicationId);
    res.json({ success: true, reminders });
  } catch (error) {
    console.error('Get application reminders error:', error);
    res.status(500).json({ success: false, error: 'Failed to get reminders' });
  }
});

/**
 * POST /api/reminders
 * Create a new reminder
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { application_id, reminder_type, remind_at } = req.body;

    if (!application_id || !reminder_type || !remind_at) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: application_id, reminder_type, remind_at',
      });
    }

    const reminder = await ReminderModel.create(userId, {
      application_id,
      reminder_type,
      remind_at,
    });

    res.status(201).json({ success: true, reminder });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ success: false, error: 'Failed to create reminder' });
  }
});

/**
 * POST /api/reminders/auto-create/:applicationId
 * Auto-create reminders for an application based on user preferences
 */
router.post('/auto-create/:applicationId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { applicationId } = req.params;

    const reminders = await ReminderModel.autoCreateReminders(userId, applicationId);
    res.status(201).json({ success: true, reminders, count: reminders.length });
  } catch (error) {
    console.error('Auto-create reminders error:', error);
    res.status(500).json({ success: false, error: 'Failed to auto-create reminders' });
  }
});

/**
 * DELETE /api/reminders/:id
 * Delete a reminder
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;

    const success = await ReminderModel.delete(id, userId);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete reminder' });
  }
});

export default router;
