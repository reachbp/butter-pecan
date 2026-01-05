import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ApplicationDetailScreen } from '../ApplicationDetailScreen';
import { Application } from '../../../types/application';
import { Alert } from 'react-native';

/**
 * ApplicationDetailScreen Tests
 */

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock API
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../../services/api', () => ({
  applicationsApi: {
    update: mockUpdate,
    delete: mockDelete,
  },
}));

const mockApplication: Application = {
  id: 'app-1',
  user_id: 'user-1',
  school_id: 'school-1',
  grade_applying: '9',
  application_year: 2026,
  status: 'applied',
  application_date: '2026-01-15',
  interview_date: '2026-02-01',
  created_at: '2026-01-01',
  updated_at: '2026-01-15',
  school: {
    id: 'school-1',
    name: 'Test High School',
    city: 'San Francisco',
    grades_offered: '9-12',
    school_type: 'Independent',
    tuition_range: '$50,000',
  },
};

describe('ApplicationDetailScreen', () => {
  const mockOnBack = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockResolvedValue({
      success: true,
      application: mockApplication,
    });
  });

  describe('Rendering', () => {
    it('should render school name and status', () => {
      const { getByText } = render(
        <ApplicationDetailScreen
          application={mockApplication}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Test High School')).toBeTruthy();
      expect(getByText('applied')).toBeTruthy();
    });

    it('should display school information', () => {
      const { getByText } = render(
        <ApplicationDetailScreen
          application={mockApplication}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('School Information')).toBeTruthy();
      expect(getByText('San Francisco')).toBeTruthy();
      expect(getByText('9-12')).toBeTruthy();
      expect(getByText('Independent')).toBeTruthy();
      expect(getByText('$50,000')).toBeTruthy();
    });

    it('should display application details', () => {
      const { getByText } = render(
        <ApplicationDetailScreen
          application={mockApplication}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Application Details')).toBeTruthy();
      expect(getByText('9')).toBeTruthy();
      expect(getByText('2026')).toBeTruthy();
    });

    it('should display timeline dates', () => {
      const { getByText } = render(
        <ApplicationDetailScreen
          application={mockApplication}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Timeline')).toBeTruthy();
      expect(getByText('Application Date:')).toBeTruthy();
      expect(getByText('Interview Date:')).toBeTruthy();
      expect(getByText('Decision Date:')).toBeTruthy();
    });

    it('should display notes if present', () => {
      const appWithNotes = {
        ...mockApplication,
        notes: 'Great school with strong STEM program',
      };

      const { getByText } = render(
        <ApplicationDetailScreen
          application={appWithNotes}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Notes')).toBeTruthy();
      expect(getByText('Great school with strong STEM program')).toBeTruthy();
    });

    it('should display suggested next steps based on status', () => {
      const { getByText } = render(
        <ApplicationDetailScreen
          application={mockApplication}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('💡 Suggested Next Steps')).toBeTruthy();
      expect(getByText('Confirm application was received')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is pressed', () => {
      const { getByText } = render(
        <ApplicationDetailScreen
          application={mockApplication}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(getByText('← Back'));
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Update Modal', () => {
    it('should open update modal when Update Details is pressed', () => {
      const { getByText } = render(
        <ApplicationDetailScreen
          application={mockApplication}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(getByText('Update Details'));

      // Modal should be visible with update options
      waitFor(() => {
        expect(getByText('Update Application')).toBeTruthy();
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should show confirmation alert when delete is pressed', () => {
      const { getByText } = render(
        <ApplicationDetailScreen
          application={mockApplication}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(getByText('Delete'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Application',
        expect.stringContaining('Test High School'),
        expect.any(Array)
      );
    });

    it('should call delete API and onDelete when confirmed', async () => {
      mockDelete.mockResolvedValue({ success: true });

      const { getByText } = render(
        <ApplicationDetailScreen
          application={mockApplication}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(getByText('Delete'));

      // Simulate pressing "Delete" in the alert
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const deleteCallback = alertCalls[0][2][1].onPress;
      await deleteCallback();

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('app-1');
        expect(mockOnDelete).toHaveBeenCalled();
      });
    });
  });

  describe('Status-specific Content', () => {
    it('should show different next steps for considering status', () => {
      const consideringApp = { ...mockApplication, status: 'considering' as const };

      const { getByText } = render(
        <ApplicationDetailScreen
          application={consideringApp}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Research school curriculum and values')).toBeTruthy();
    });

    it('should show different next steps for interviewed status', () => {
      const interviewedApp = { ...mockApplication, status: 'interviewed' as const };

      const { getByText } = render(
        <ApplicationDetailScreen
          application={interviewedApp}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Send thank you note to interviewer')).toBeTruthy();
    });

    it('should show different next steps for accepted status', () => {
      const acceptedApp = { ...mockApplication, status: 'accepted' as const };

      const { getByText } = render(
        <ApplicationDetailScreen
          application={acceptedApp}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Review financial aid package')).toBeTruthy();
    });
  });

  describe('Date Formatting', () => {
    it('should format dates in readable format', () => {
      const { getByText } = render(
        <ApplicationDetailScreen
          application={mockApplication}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Should display formatted dates, not raw date strings
      expect(getByText(/January|February|March/)).toBeTruthy();
    });

    it('should show "Not set" for missing dates', () => {
      const appWithoutDates = {
        ...mockApplication,
        application_date: undefined,
        interview_date: undefined,
        decision_date: undefined,
      };

      const { getAllByText } = render(
        <ApplicationDetailScreen
          application={appWithoutDates}
          onBack={mockOnBack}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const notSetElements = getAllByText('Not set');
      expect(notSetElements.length).toBeGreaterThan(0);
    });
  });
});
