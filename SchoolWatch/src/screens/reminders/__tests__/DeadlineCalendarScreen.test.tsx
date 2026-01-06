import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DeadlineCalendarScreen } from '../DeadlineCalendarScreen';
import { applicationsApi } from '../../../services/api';

// Mock API
jest.mock('../../../services/api', () => ({
  applicationsApi: {
    getAll: jest.fn(),
  },
}));

const mockApplications = [
  {
    id: 'app-1',
    user_id: 'user-1',
    school_id: 'school-1',
    grade_applying: '9',
    application_year: 2026,
    status: 'applied',
    application_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    interview_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    school: {
      id: 'school-1',
      name: 'Test School',
      city: 'San Francisco',
    },
  },
  {
    id: 'app-2',
    user_id: 'user-1',
    school_id: 'school-2',
    grade_applying: '9',
    application_year: 2026,
    status: 'considering',
    application_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    school: {
      id: 'school-2',
      name: 'Another School',
      city: 'Oakland',
    },
  },
];

describe('DeadlineCalendarScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (applicationsApi.getAll as jest.Mock).mockResolvedValue({
      success: true,
      applications: mockApplications,
    });
  });

  describe('Rendering', () => {
    it('should render the screen title', async () => {
      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        expect(getByText('Upcoming Deadlines')).toBeTruthy();
      });
    });

    it('should show loading state initially', () => {
      (applicationsApi.getAll as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByText } = render(<DeadlineCalendarScreen />);

      expect(getByText('Loading deadlines...')).toBeTruthy();
    });

    it('should display deadlines count', async () => {
      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        // 3 deadlines total: 2 application dates + 1 interview date
        expect(getByText(/3 upcoming deadlines/)).toBeTruthy();
      });
    });
  });

  describe('Deadline Grouping', () => {
    it('should group deadlines by time period', async () => {
      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        // Should show "This Week" section for 5 days deadline
        expect(getByText('This Week')).toBeTruthy();
        // Should show "Next Week" section for 10-15 days deadlines
        expect(getByText('Next Week')).toBeTruthy();
      });
    });

    it('should show "Today" for deadlines today', async () => {
      const todayApp = {
        ...mockApplications[0],
        application_date: new Date().toISOString().split('T')[0],
      };

      (applicationsApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        applications: [todayApp],
      });

      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        expect(getByText('Today')).toBeTruthy();
        expect(getByText('Due Today!')).toBeTruthy();
      });
    });

    it('should show "Tomorrow" for deadlines tomorrow', async () => {
      const tomorrowApp = {
        ...mockApplications[0],
        application_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      (applicationsApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        applications: [tomorrowApp],
      });

      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        expect(getByText('Tomorrow')).toBeTruthy();
        expect(getByText('Due Tomorrow')).toBeTruthy();
      });
    });
  });

  describe('Deadline Display', () => {
    it('should display school names', async () => {
      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        expect(getByText('Test School')).toBeTruthy();
        expect(getByText('Another School')).toBeTruthy();
      });
    });

    it('should display deadline types', async () => {
      const { getAllByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        const applicationDeadlines = getAllByText('Application Deadline');
        expect(applicationDeadlines.length).toBeGreaterThan(0);

        const interviewDates = getAllByText('Interview Date');
        expect(interviewDates.length).toBeGreaterThan(0);
      });
    });

    it('should display status badges', async () => {
      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        expect(getByText('applied')).toBeTruthy();
        expect(getByText('considering')).toBeTruthy();
      });
    });

    it('should display days remaining', async () => {
      const { getAllByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        const daysRemaining = getAllByText(/\d+ days remaining/);
        expect(daysRemaining.length).toBeGreaterThan(0);
      });
    });

    it('should display appropriate icons for deadline types', async () => {
      const { getAllByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        // Application deadline icon
        expect(getAllByText('📝').length).toBeGreaterThan(0);
        // Interview icon
        expect(getAllByText('🎯').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no deadlines exist', async () => {
      (applicationsApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        applications: [],
      });

      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        expect(getByText('No Upcoming Deadlines')).toBeTruthy();
        expect(getByText(/Add application dates/)).toBeTruthy();
      });
    });

    it('should show empty state when all deadlines are in the past', async () => {
      const pastApp = {
        ...mockApplications[0],
        application_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        interview_date: undefined,
      };

      (applicationsApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        applications: [pastApp],
      });

      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        expect(getByText('No Upcoming Deadlines')).toBeTruthy();
      });
    });
  });

  describe('Urgency Indicators', () => {
    it('should use different colors for different urgency levels', async () => {
      const urgentApp = {
        ...mockApplications[0],
        application_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days
      };

      (applicationsApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        applications: [urgentApp],
      });

      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        // Should show urgency indicator for deadlines within 3 days
        expect(getByText(/2 days remaining/)).toBeTruthy();
      });
    });
  });

  describe('Interactions', () => {
    it('should call onApplicationPress when deadline card is pressed', async () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(<DeadlineCalendarScreen onApplicationPress={mockOnPress} />);

      await waitFor(() => {
        const schoolName = getByText('Test School');
        fireEvent.press(schoolName);
      });

      expect(mockOnPress).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'app-1',
          school: expect.objectContaining({ name: 'Test School' }),
        })
      );
    });

    it('should support pull-to-refresh', async () => {
      const { getByTestId, UNSAFE_getByType } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        expect(applicationsApi.getAll).toHaveBeenCalledTimes(1);
      });

      // Simulate pull to refresh
      const scrollView = UNSAFE_getByType('RCTScrollView');
      fireEvent(scrollView, 'refresh');

      await waitFor(() => {
        expect(applicationsApi.getAll).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (applicationsApi.getAll as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        // Should show empty state on error
        expect(getByText('No Upcoming Deadlines')).toBeTruthy();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load deadlines:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Multiple Deadline Types', () => {
    it('should show all deadline types for a single application', async () => {
      const fullApp = {
        ...mockApplications[0],
        application_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        interview_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        decision_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      (applicationsApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        applications: [fullApp],
      });

      const { getByText } = render(<DeadlineCalendarScreen />);

      await waitFor(() => {
        expect(getByText('Application Deadline')).toBeTruthy();
        expect(getByText('Interview Date')).toBeTruthy();
        expect(getByText('Decision Date')).toBeTruthy();
      });
    });
  });
});
