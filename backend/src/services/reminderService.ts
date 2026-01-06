import { ReminderModel } from '../models/Reminder';

/**
 * Reminder Service
 * Handles scheduled reminder checks and notifications
 */

export interface ReminderNotification {
  reminderId: string;
  userId: string;
  applicationId: string;
  reminderType: string;
  schoolName: string;
  message: string;
}

export class ReminderService {
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  /**
   * Start the reminder checker service
   * Checks every 5 minutes for pending reminders
   */
  start(intervalMinutes: number = 5): void {
    if (this.isRunning) {
      console.warn('Reminder service is already running');
      return;
    }

    console.log(`🔔 Starting reminder service (checking every ${intervalMinutes} minutes)`);
    this.isRunning = true;

    // Run immediately on start
    this.checkAndProcessReminders();

    // Then run on interval
    this.checkInterval = setInterval(
      () => this.checkAndProcessReminders(),
      intervalMinutes * 60 * 1000
    );
  }

  /**
   * Stop the reminder checker service
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.isRunning = false;
      console.log('🔕 Reminder service stopped');
    }
  }

  /**
   * Check for pending reminders and process them
   */
  private async checkAndProcessReminders(): Promise<void> {
    try {
      const pendingReminders = await ReminderModel.getPendingReminders();

      if (pendingReminders.length === 0) {
        return;
      }

      console.log(`📬 Found ${pendingReminders.length} pending reminder(s)`);

      for (const reminder of pendingReminders) {
        try {
          await this.processReminder(reminder);
          await ReminderModel.markAsSent(reminder.id);
          console.log(`✅ Processed reminder ${reminder.id}`);
        } catch (error) {
          console.error(`❌ Failed to process reminder ${reminder.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  /**
   * Process a single reminder
   * In a real app, this would send push notifications, emails, etc.
   */
  private async processReminder(reminder: any): Promise<void> {
    const notification = this.createNotification(reminder);

    // TODO: In Task 15 (Notification System), integrate with:
    // - Push notification service (e.g., Expo Push Notifications)
    // - Email service (e.g., SendGrid, AWS SES)
    // - In-app notification system (Socket.IO)

    // For now, just log the notification
    console.log('📨 Reminder notification:', {
      type: notification.reminderType,
      message: notification.message,
      school: notification.schoolName,
    });

    // Emit to Socket.IO if available (will be used in real-time updates)
    // io.to(notification.userId).emit('reminder', notification);

    return Promise.resolve();
  }

  /**
   * Create a notification object from a reminder
   */
  private createNotification(reminder: any): ReminderNotification {
    const school = reminder.school || { name: 'Unknown School' };
    const application = reminder.application || {};

    let message = '';
    const deadlineDate = new Date(reminder.remind_at);
    const formattedDate = deadlineDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    switch (reminder.reminder_type) {
      case 'application_deadline':
        message = `Application deadline for ${school.name} is coming up on ${formattedDate}!`;
        break;
      case 'interview_date':
        message = `Interview scheduled at ${school.name} on ${formattedDate}`;
        break;
      case 'decision_date':
        message = `Decision date for ${school.name} is on ${formattedDate}`;
        break;
      case 'custom':
        message = `Reminder for ${school.name}`;
        break;
      default:
        message = `Reminder for ${school.name}`;
    }

    return {
      reminderId: reminder.id,
      userId: reminder.user_id,
      applicationId: reminder.application_id,
      reminderType: reminder.reminder_type,
      schoolName: school.name,
      message,
    };
  }

  /**
   * Manually trigger a check for pending reminders
   */
  async checkNow(): Promise<number> {
    await this.checkAndProcessReminders();
    const pending = await ReminderModel.getPendingReminders();
    return pending.length;
  }
}

// Export singleton instance
export const reminderService = new ReminderService();
export default reminderService;
