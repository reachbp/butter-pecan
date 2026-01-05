import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DashboardScreen } from '../DashboardScreen';
import { Application } from '../../../types/application';

/**
 * Dashboard Screen Tests
 */

// Mock the API
const mockApplications: Application[] = [
  {
    id: '1',
    user_id: 'test-user',
    school_id: 'school-1',
    grade_applying: '9',
    application_year: 2026,
    status: 'considering',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    school: {
      id: 'school-1',
      name: 'Test School 1',
      city: 'San Francisco',
      grades_offered: 'K-12',
      school_type: 'Independent',
    },
  },
  {
    id: '2',
    user_id: 'test-user',
    school_id: 'school-2',
    grade_applying: '10',
    application_year: 2026,
    status: 'applied',
    application_date: '2026-01-15',
    created_at: '2026-01-01',
    updated_at: '2026-01-15',
    school: {
      id: 'school-2',
      name: 'Test School 2',
      city: 'Oakland',
      grades_offered: '9-12',
      school_type: 'Progressive',
    },
  },
  {
    id: '3',
    user_id: 'test-user',
    school_id: 'school-3',
    grade_applying: '11',
    application_year: 2026,
    status: 'accepted',
    decision_date: '2026-03-15',
    created_at: '2026-01-01',
    updated_at: '2026-03-15',
    school: {
      id: 'school-3',
      name: 'Test School 3',
      city: 'Palo Alto',
      grades_offered: 'K-8',
      school_type: 'Independent',
    },
  },
];

jest.mock('../../../services/api', () => ({
  applicationsApi: {
    getAll: jest.fn().mockResolvedValue({
      success: true,
      count: 3,
      applications: mockApplications,
    }),
    getStats: jest.fn().mockResolvedValue({
      success: true,
      stats: {
        total: 3,
        byStatus: {
          considering: 1,
          applied: 1,
          accepted: 1,
        },
      },
    }),
  },
}));

describe('DashboardScreen', () => {
  const mockOnApplicationPress = jest.fn();
  const mockOnAddApplication = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard header', async () => {
      const { getByText } = render(<DashboardScreen />);

      expect(getByText('My Applications')).toBeTruthy();
      expect(getByText('Track your Bay Area private school applications')).toBeTruthy();
    });

    it('should display loading state initially', () => {
      const { getByText } = render(<DashboardScreen />);
      expect(getByText('Loading applications...')).toBeTruthy();
    });

    it('should display applications after loading', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test School 1')).toBeTruthy();
        expect(getByText('Test School 2')).toBeTruthy();
        expect(getByText('Test School 3')).toBeTruthy();
      });
    });
  });

  describe('Statistics', () => {
    it('should display total applications count', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('3')).toBeTruthy(); // Total count
      });
    });

    it('should display stats by status', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('considering (1)')).toBeTruthy();
        expect(getByText('applied (1)')).toBeTruthy();
        expect(getByText('accepted (1)')).toBeTruthy();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter applications by status', async () => {
      const { getByText, queryByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test School 1')).toBeTruthy();
      });

      // Click on "applied" filter
      fireEvent.press(getByText('applied (1)'));

      await waitFor(() => {
        expect(getByText('Test School 2')).toBeTruthy();
        expect(queryByText('Test School 1')).toBeNull();
        expect(queryByText('Test School 3')).toBeNull();
      });
    });

    it('should show all applications when "All" filter is selected', async () => {
      const { getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        // Initially shows all
        expect(getByText('Showing 3 applications')).toBeTruthy();
      });

      // Filter by status
      fireEvent.press(getByText('applied (1)'));

      await waitFor(() => {
        expect(getByText('Showing 1 application')).toBeTruthy();
      });

      // Go back to "All"
      fireEvent.press(getByText(/All \(3\)/));

      await waitFor(() => {
        expect(getByText('Showing 3 applications')).toBeTruthy();
      });
    });
  });

  describe('Search', () => {
    it('should filter applications by search query', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <DashboardScreen />
      );

      await waitFor(() => {
        expect(getByText('Test School 1')).toBeTruthy();
      });

      // Search for "Oakland"
      const searchInput = getByPlaceholderText('Search schools, cities, grades...');
      fireEvent.changeText(searchInput, 'Oakland');

      await waitFor(() => {
        expect(getByText('Test School 2')).toBeTruthy();
        expect(queryByText('Test School 1')).toBeNull();
      });
    });

    it('should show "no results" when search has no matches', async () => {
      const { getByPlaceholderText, getByText } = render(<DashboardScreen />);

      await waitFor(() => {
        expect(getByText('Test School 1')).toBeTruthy();
      });

      const searchInput = getByPlaceholderText('Search schools, cities, grades...');
      fireEvent.changeText(searchInput, 'NonExistentSchool');

      await waitFor(() => {
        expect(getByText('No applications match your filters')).toBeTruthy();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no applications', async () => {
      // Mock empty response
      jest.mocked(require('../../../services/api').applicationsApi.getAll).mockResolvedValueOnce({
        success: true,
        count: 0,
        applications: [],
      });

      const { getByText } = render(
        <DashboardScreen onAddApplication={mockOnAddApplication} />
      );

      await waitFor(() => {
        expect(getByText('No applications yet')).toBeTruthy();
        expect(getByText('Start tracking your school applications by adding your first one!')).toBeTruthy();
      });
    });

    it('should show add button in empty state', async () => {
      jest.mocked(require('../../../services/api').applicationsApi.getAll).mockResolvedValueOnce({
        success: true,
        count: 0,
        applications: [],
      });

      const { getByText } = render(
        <DashboardScreen onAddApplication={mockOnAddApplication} />
      );

      await waitFor(() => {
        const addButton = getByText('Add First Application');
        expect(addButton).toBeTruthy();
        fireEvent.press(addButton);
      });

      expect(mockOnAddApplication).toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('should call onApplicationPress when card is pressed', async () => {
      const { getByText } = render(
        <DashboardScreen onApplicationPress={mockOnApplicationPress} />
      );

      await waitFor(() => {
        const card = getByText('Test School 1');
        fireEvent.press(card);
      });

      expect(mockOnApplicationPress).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          school: expect.objectContaining({ name: 'Test School 1' }),
        })
      );
    });

    it('should call onAddApplication when FAB is pressed', async () => {
      const { getByText } = render(
        <DashboardScreen onAddApplication={mockOnAddApplication} />
      );

      await waitFor(() => {
        expect(getByText('Test School 1')).toBeTruthy();
      });

      const fabButton = getByText('+ Add Application');
      fireEvent.press(fabButton);

      expect(mockOnAddApplication).toHaveBeenCalled();
    });
  });
});
