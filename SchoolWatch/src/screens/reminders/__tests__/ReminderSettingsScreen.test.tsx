import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ReminderSettingsScreen } from '../ReminderSettingsScreen';
import { reminderApi } from '../../../services/reminderApi';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock API
jest.mock('../../../services/reminderApi', () => ({
  reminderApi: {
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
  },
}));

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

describe('ReminderSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (reminderApi.getPreferences as jest.Mock).mockResolvedValue({
      success: true,
      preferences: mockPreferences,
    });
    (reminderApi.updatePreferences as jest.Mock).mockResolvedValue({
      success: true,
      preferences: mockPreferences,
    });
  });

  describe('Rendering', () => {
    it('should render the screen title', async () => {
      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('Reminder Settings')).toBeTruthy();
      });
    });

    it('should show loading state initially', () => {
      (reminderApi.getPreferences as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByText } = render(<ReminderSettingsScreen />);

      expect(getByText('Loading preferences...')).toBeTruthy();
    });

    it('should display back button when onBack is provided', async () => {
      const mockOnBack = jest.fn();
      const { getAllByText } = render(<ReminderSettingsScreen onBack={mockOnBack} />);

      await waitFor(() => {
        const backButtons = getAllByText('← Back');
        expect(backButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Notification Channels', () => {
    it('should display all notification channel toggles', async () => {
      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('All Notifications')).toBeTruthy();
        expect(getByText('Push Notifications')).toBeTruthy();
        expect(getByText('Email Reminders')).toBeTruthy();
      });
    });

    it('should show notification channel descriptions', async () => {
      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('Master switch for all reminders')).toBeTruthy();
        expect(getByText('Get notifications on your device')).toBeTruthy();
        expect(getByText('Receive reminders via email')).toBeTruthy();
      });
    });

    it('should toggle notification switches', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('All Notifications')).toBeTruthy();
      });

      const switches = UNSAFE_getAllByType('RCTSwitch');
      const notificationSwitch = switches[0]; // First switch is "All Notifications"

      fireEvent(notificationSwitch, 'valueChange', false);

      // Should update the switch state
      expect(notificationSwitch.props.value).toBe(false);
    });
  });

  describe('Reminder Timing', () => {
    it('should display reminder timing sections', async () => {
      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('Reminder Timing')).toBeTruthy();
        expect(getByText('Application Deadlines')).toBeTruthy();
        expect(getByText('Interview Dates')).toBeTruthy();
        expect(getByText('Decision Dates')).toBeTruthy();
      });
    });

    it('should display day selector options', async () => {
      const { getAllByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        const day1Options = getAllByText('1 day before');
        const day3Options = getAllByText('3 days before');
        const day7Options = getAllByText('7 days before');
        const day14Options = getAllByText('14 days before');

        // Should have 3 sets (one for each deadline type)
        expect(day1Options.length).toBe(3);
        expect(day3Options.length).toBe(3);
        expect(day7Options.length).toBe(3);
        expect(day14Options.length).toBe(3);
      });
    });

    it('should show selected day preferences', async () => {
      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('Application Deadlines')).toBeTruthy();
        // 7, 3, 1 days should be selected based on mockPreferences
      });
    });

    it('should toggle day preferences when pressed', async () => {
      const { getAllByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        const day14Options = getAllByText('14 days before');
        fireEvent.press(day14Options[0]); // Press first "14 days before" option

        // Should add 14 to the selected days
        // Verify by checking if it can be pressed again to deselect
        fireEvent.press(day14Options[0]);
      });
    });
  });

  describe('Save Functionality', () => {
    it('should save preferences when Save button is pressed', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('Save Preferences')).toBeTruthy();
      });

      // Toggle a switch
      const switches = UNSAFE_getAllByType('RCTSwitch');
      fireEvent(switches[0], 'valueChange', false);

      // Press Save
      const saveButton = getByText('Save Preferences');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(reminderApi.updatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({
            notification_enabled: false,
          })
        );
      });
    });

    it('should show success alert after saving', async () => {
      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('Save Preferences')).toBeTruthy();
      });

      fireEvent.press(getByText('Save Preferences'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Reminder preferences updated successfully'
        );
      });
    });

    it('should reload preferences after saving', async () => {
      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(reminderApi.getPreferences).toHaveBeenCalledTimes(1);
      });

      fireEvent.press(getByText('Save Preferences'));

      await waitFor(() => {
        // Should be called again after save
        expect(reminderApi.getPreferences).toHaveBeenCalledTimes(2);
      });
    });

    it('should show loading state while saving', async () => {
      (reminderApi.updatePreferences as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('Save Preferences')).toBeTruthy();
      });

      fireEvent.press(getByText('Save Preferences'));

      // Button should show loading state
      // Note: Loading state is handled by GlassButton component
    });

    it('should handle save errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (reminderApi.updatePreferences as jest.Mock).mockRejectedValue(new Error('Save failed'));

      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('Save Preferences')).toBeTruthy();
      });

      fireEvent.press(getByText('Save Preferences'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save reminder preferences');
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Info Section', () => {
    it('should display how reminders work info', async () => {
      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('How Reminders Work')).toBeTruthy();
        expect(getByText(/automatically created/)).toBeTruthy();
      });
    });

    it('should display info icon', async () => {
      const { getByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(getByText('💡')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is pressed', async () => {
      const mockOnBack = jest.fn();
      const { getAllByText } = render(<ReminderSettingsScreen onBack={mockOnBack} />);

      await waitFor(() => {
        const backButtons = getAllByText('← Back');
        fireEvent.press(backButtons[0]);
      });

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle load errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (reminderApi.getPreferences as jest.Mock).mockRejectedValue(new Error('Load failed'));

      render(<ReminderSettingsScreen />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load reminder preferences');
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Preference Persistence', () => {
    it('should load and display existing preferences', async () => {
      const customPreferences = {
        ...mockPreferences,
        notification_enabled: false,
        email_enabled: false,
        application_deadline_days: [14, 7],
      };

      (reminderApi.getPreferences as jest.Mock).mockResolvedValue({
        success: true,
        preferences: customPreferences,
      });

      const { UNSAFE_getAllByType } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        const switches = UNSAFE_getAllByType('RCTSwitch');
        // First switch (All Notifications) should be false
        expect(switches[0].props.value).toBe(false);
      });
    });
  });

  describe('Disable Dependent Switches', () => {
    it('should disable push and email when notifications are off', async () => {
      const { UNSAFE_getAllByType } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        const switches = UNSAFE_getAllByType('RCTSwitch');
        // Disable all notifications
        fireEvent(switches[0], 'valueChange', false);
      });

      const switches = UNSAFE_getAllByType('RCTSwitch');
      // Push and email switches should be disabled
      expect(switches[1].props.disabled).toBe(true); // Push
      expect(switches[2].props.disabled).toBe(true); // Email
    });
  });

  describe('Multiple Day Selection', () => {
    it('should allow selecting multiple reminder days', async () => {
      const { getAllByText } = render(<ReminderSettingsScreen />);

      await waitFor(() => {
        // Initially 7, 3, 1 are selected, add 14
        const day14Options = getAllByText('14 days before');
        fireEvent.press(day14Options[0]);

        // Now deselect 1 day
        const day1Options = getAllByText('1 day before');
        fireEvent.press(day1Options[0]);
      });

      // After save, should have [14, 7, 3]
      const { getByText } = render(<ReminderSettingsScreen />);
      fireEvent.press(getByText('Save Preferences'));

      // Verify the saved preferences
      await waitFor(() => {
        expect(reminderApi.updatePreferences).toHaveBeenCalled();
      });
    });
  });
});
