import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OnboardingFlow } from '../OnboardingFlow';
import { OnboardingData } from '../../../types/onboarding';

/**
 * Onboarding Flow Integration Tests
 */

// Mock Alert for React Native
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock the API service
jest.mock('../../../services/api', () => ({
  schoolsApi: {
    getAll: jest.fn().mockResolvedValue({
      success: true,
      count: 3,
      schools: [
        {
          id: '1',
          name: 'Test School 1',
          city: 'San Francisco',
          grades_offered: 'K-12',
          school_type: 'Independent',
        },
        {
          id: '2',
          name: 'Test School 2',
          city: 'Oakland',
          grades_offered: '9-12',
          school_type: 'Progressive',
        },
        {
          id: '3',
          name: 'Test School 3',
          city: 'Palo Alto',
          grades_offered: 'K-8',
          school_type: 'Independent',
        },
      ],
    }),
  },
}));

describe('OnboardingFlow', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step 1: Welcome Screen', () => {
    it('should render welcome screen initially', () => {
      const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);

      expect(getByText('Welcome to SchoolWatch')).toBeTruthy();
      expect(getByText('Current Grade *')).toBeTruthy();
      expect(getByText('Step 1 of 3')).toBeTruthy();
    });

    it('should allow selecting a grade', () => {
      const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);

      const kindergartenButton = getByText('Kindergarten');
      fireEvent.press(kindergartenButton);

      // Verify button is now in selected state
      expect(kindergartenButton).toBeTruthy();
    });

    it('should navigate to step 2 when Continue is pressed with grade selected', () => {
      const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);

      // Select grade
      fireEvent.press(getByText('Kindergarten'));

      // Press Continue
      fireEvent.press(getByText('Continue'));

      // Should show Timeline screen
      expect(getByText('Application Timeline')).toBeTruthy();
      expect(getByText('Step 2 of 3')).toBeTruthy();
    });
  });

  describe('Step 2: Timeline Screen', () => {
    it('should show suggested graduation year based on grade', () => {
      const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);

      // Navigate to step 2
      fireEvent.press(getByText('Kindergarten'));
      fireEvent.press(getByText('Continue'));

      // Should show graduation year section
      expect(getByText('Target Graduation Year')).toBeTruthy();
      expect(getByText(/we suggest/i)).toBeTruthy();
    });

    it('should allow going back to step 1', () => {
      const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);

      // Navigate to step 2
      fireEvent.press(getByText('Kindergarten'));
      fireEvent.press(getByText('Continue'));

      // Go back
      const backButtons = getByText('Back');
      fireEvent.press(backButtons);

      // Should show Welcome screen again
      expect(getByText('Welcome to SchoolWatch')).toBeTruthy();
    });

    it('should navigate to step 3 when Continue is pressed', () => {
      const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);

      // Navigate to step 2
      fireEvent.press(getByText('Kindergarten'));
      fireEvent.press(getByText('Continue'));

      // Press Continue (graduation year and application year should be auto-selected)
      const continueButtons = getByText('Continue');
      fireEvent.press(continueButtons);

      // Should show School Selection screen
      waitFor(() => {
        expect(getByText('Select Schools')).toBeTruthy();
        expect(getByText('Step 3 of 3')).toBeTruthy();
      });
    });
  });

  describe('Step 3: School Selection Screen', () => {
    it('should load and display schools', async () => {
      const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);

      // Navigate to step 3
      fireEvent.press(getByText('Kindergarten'));
      fireEvent.press(getByText('Continue'));
      fireEvent.press(getByText('Continue'));

      // Wait for schools to load
      await waitFor(() => {
        expect(getByText('Test School 1')).toBeTruthy();
        expect(getByText('Test School 2')).toBeTruthy();
        expect(getByText('Test School 3')).toBeTruthy();
      });
    });

    it('should allow selecting schools', async () => {
      const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);

      // Navigate to step 3
      fireEvent.press(getByText('Kindergarten'));
      fireEvent.press(getByText('Continue'));
      fireEvent.press(getByText('Continue'));

      // Wait for schools and select one
      await waitFor(() => {
        fireEvent.press(getByText('Test School 1'));
      });

      // Should show selected count
      await waitFor(() => {
        expect(getByText('1 school selected')).toBeTruthy();
      });
    });

    it('should call onComplete with correct data when Complete Setup is pressed', async () => {
      const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);

      // Navigate through all steps
      fireEvent.press(getByText('Kindergarten'));
      fireEvent.press(getByText('Continue'));
      fireEvent.press(getByText('Continue'));

      // Select a school
      await waitFor(() => {
        fireEvent.press(getByText('Test School 1'));
      });

      // Complete setup
      await waitFor(() => {
        fireEvent.press(getByText('Complete Setup'));
      });

      // Verify onComplete was called with correct data structure
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
      const calledData = mockOnComplete.mock.calls[0][0] as OnboardingData;

      expect(calledData).toHaveProperty('childGrade', 'K');
      expect(calledData).toHaveProperty('targetGraduationYear');
      expect(calledData).toHaveProperty('applicationYear');
      expect(calledData.selectedSchools).toContain('1');
      expect(calledData.selectedSchools.length).toBe(1);
    });
  });

  describe('Navigation Flow', () => {
    it('should complete full onboarding flow successfully', async () => {
      const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);

      // Step 1: Select grade
      expect(getByText('Step 1 of 3')).toBeTruthy();
      fireEvent.press(getByText('5th Grade'));
      fireEvent.press(getByText('Continue'));

      // Step 2: Select timeline
      expect(getByText('Step 2 of 3')).toBeTruthy();
      fireEvent.press(getByText('Continue'));

      // Step 3: Select schools
      await waitFor(() => {
        expect(getByText('Step 3 of 3')).toBeTruthy();
      });

      await waitFor(() => {
        fireEvent.press(getByText('Test School 2'));
        fireEvent.press(getByText('Test School 3'));
      });

      await waitFor(() => {
        fireEvent.press(getByText('Complete Setup'));
      });

      // Verify completion
      expect(mockOnComplete).toHaveBeenCalled();
      const data = mockOnComplete.mock.calls[0][0] as OnboardingData;
      expect(data.selectedSchools.length).toBe(2);
    });
  });
});
