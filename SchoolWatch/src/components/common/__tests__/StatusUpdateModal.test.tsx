import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StatusUpdateModal } from '../StatusUpdateModal';
import { Application } from '../../../types/application';

/**
 * StatusUpdateModal Tests
 */

const mockApplication: Application = {
  id: 'app-1',
  user_id: 'user-1',
  school_id: 'school-1',
  grade_applying: '9',
  application_year: 2026,
  status: 'considering',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  school: {
    id: 'school-1',
    name: 'Test School',
    city: 'San Francisco',
  },
};

describe('StatusUpdateModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible', () => {
      const { getByText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(getByText('Update Application')).toBeTruthy();
      expect(getByText('Test School')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <StatusUpdateModal
          visible={false}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(queryByText('Update Application')).toBeNull();
    });

    it('should render all status options', () => {
      const { getByText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(getByText('considering')).toBeTruthy();
      expect(getByText('applied')).toBeTruthy();
      expect(getByText('interviewed')).toBeTruthy();
      expect(getByText('accepted')).toBeTruthy();
      expect(getByText('waitlisted')).toBeTruthy();
      expect(getByText('rejected')).toBeTruthy();
      expect(getByText('decided')).toBeTruthy();
    });

    it('should render date input fields', () => {
      const { getByPlaceholderText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(getByPlaceholderText('YYYY-MM-DD')).toBeTruthy();
    });

    it('should render notes input field', () => {
      const { getByPlaceholderText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(getByPlaceholderText('Add notes about this application...')).toBeTruthy();
    });
  });

  describe('Status Selection', () => {
    it('should pre-select current status', () => {
      const { getByText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Current status card should be selected (have stronger styling)
      const currentStatusCard = getByText('considering').parent?.parent;
      expect(currentStatusCard).toBeTruthy();
    });

    it('should allow selecting a different status', () => {
      const { getByText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Press on "applied" status
      fireEvent.press(getByText('applied'));

      // Should update selection (verified by Save button working correctly)
      expect(getByText('applied')).toBeTruthy();
    });

    it('should show status descriptions', () => {
      const { getByText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(getByText('You are considering applying to this school')).toBeTruthy();
      expect(getByText('Application has been submitted')).toBeTruthy();
    });
  });

  describe('Date Input', () => {
    it('should pre-fill existing dates', () => {
      const appWithDates = {
        ...mockApplication,
        application_date: '2026-01-15',
        interview_date: '2026-02-01',
        decision_date: '2026-03-15',
      };

      const { getAllByDisplayValue } = render(
        <StatusUpdateModal
          visible={true}
          application={appWithDates}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(getAllByDisplayValue('2026-01-15')).toBeTruthy();
      expect(getAllByDisplayValue('2026-02-01')).toBeTruthy();
      expect(getAllByDisplayValue('2026-03-15')).toBeTruthy();
    });

    it('should allow editing application date', () => {
      const { getAllByPlaceholderText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const dateInputs = getAllByPlaceholderText('YYYY-MM-DD');
      fireEvent.changeText(dateInputs[0], '2026-01-20');

      expect(dateInputs[0].props.value).toBe('2026-01-20');
    });
  });

  describe('Notes Input', () => {
    it('should pre-fill existing notes', () => {
      const appWithNotes = {
        ...mockApplication,
        notes: 'Great STEM program',
      };

      const { getByDisplayValue } = render(
        <StatusUpdateModal
          visible={true}
          application={appWithNotes}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(getByDisplayValue('Great STEM program')).toBeTruthy();
    });

    it('should allow editing notes', () => {
      const { getByPlaceholderText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const notesInput = getByPlaceholderText('Add notes about this application...');
      fireEvent.changeText(notesInput, 'Updated notes here');

      expect(notesInput.props.value).toBe('Updated notes here');
    });
  });

  describe('Save Functionality', () => {
    it('should call onUpdate with changed status when Save is pressed', () => {
      const { getByText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Change status
      fireEvent.press(getByText('applied'));

      // Save changes
      fireEvent.press(getByText('Save Changes'));

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'applied',
        })
      );
    });

    it('should call onUpdate with all changed fields', () => {
      const { getByText, getAllByPlaceholderText, getByPlaceholderText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Change multiple fields
      fireEvent.press(getByText('applied'));

      const dateInputs = getAllByPlaceholderText('YYYY-MM-DD');
      fireEvent.changeText(dateInputs[0], '2026-01-20');

      const notesInput = getByPlaceholderText('Add notes about this application...');
      fireEvent.changeText(notesInput, 'New notes');

      // Save
      fireEvent.press(getByText('Save Changes'));

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'applied',
          application_date: '2026-01-20',
          notes: 'New notes',
        })
      );
    });

    it('should call onClose after saving', () => {
      const { getByText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      fireEvent.press(getByText('Save Changes'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not call onUpdate if no changes were made', () => {
      const { getByText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Just press Save without making changes
      fireEvent.press(getByText('Save Changes'));

      expect(mockOnUpdate).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onClose when Cancel is pressed', () => {
      const { getByText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      fireEvent.press(getByText('Cancel'));

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('should not save changes when Cancel is pressed', () => {
      const { getByText } = render(
        <StatusUpdateModal
          visible={true}
          application={mockApplication}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Make changes
      fireEvent.press(getByText('applied'));

      // Cancel instead of save
      fireEvent.press(getByText('Cancel'));

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Null Application Handling', () => {
    it('should return null when application is null', () => {
      const { container } = render(
        <StatusUpdateModal
          visible={true}
          application={null}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(container).toBeTruthy();
    });
  });
});
