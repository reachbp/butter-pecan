import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SchoolInsightsScreen } from '../SchoolInsightsScreen';
import { communityDataApi } from '../../../services/communityDataApi';

// Mock API
jest.mock('../../../services/communityDataApi', () => ({
  communityDataApi: {
    getSchoolStats: jest.fn(),
    getSchoolHistory: jest.fn(),
  },
}));

const mockSchool = {
  id: 'school-1',
  name: 'Test High School',
  short_name: 'THS',
  city: 'San Francisco',
  state: 'CA',
  grades_offered: '9-12',
  school_type: 'Independent',
  tuition_range: '$50,000',
};

const mockStats = {
  id: 'stats-1',
  school_id: 'school-1',
  application_year: 2026,
  total_contributions: 50,
  acceptance_rate: 25.5,
  waitlist_rate: 15.2,
  rejection_rate: 59.3,
  avg_application_difficulty: 4.2,
  avg_interview_difficulty: 3.8,
  avg_overall_experience: 4.5,
  financial_aid_percentage: 35.0,
  last_updated: '2026-01-01',
  created_at: '2026-01-01',
};

const mockHistory = [
  { ...mockStats, application_year: 2026 },
  { ...mockStats, application_year: 2025, total_contributions: 45 },
  { ...mockStats, application_year: 2024, total_contributions: 40 },
];

describe('SchoolInsightsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (communityDataApi.getSchoolStats as jest.Mock).mockResolvedValue({
      success: true,
      stats: mockStats,
    });
    (communityDataApi.getSchoolHistory as jest.Mock).mockResolvedValue({
      success: true,
      history: mockHistory,
    });
  });

  describe('Rendering', () => {
    it('should render school name', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('Test High School')).toBeTruthy();
      });
    });

    it('should show loading state initially', () => {
      (communityDataApi.getSchoolStats as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      expect(getByText('Loading insights...')).toBeTruthy();
    });

    it('should display community insights title', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('Community Insights')).toBeTruthy();
      });
    });

    it('should display total contributions badge', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('50 contributions')).toBeTruthy();
      });
    });
  });

  describe('Acceptance Statistics', () => {
    it('should display acceptance rate', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('📈 Acceptance Statistics')).toBeTruthy();
        expect(getByText('25.5%')).toBeTruthy();
      });
    });

    it('should display waitlist rate', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('15.2%')).toBeTruthy();
      });
    });

    it('should display rejection rate', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('59.3%')).toBeTruthy();
      });
    });

    it('should display stat card labels', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('Acceptance Rate')).toBeTruthy();
        expect(getByText('Waitlist Rate')).toBeTruthy();
        expect(getByText('Rejection Rate')).toBeTruthy();
      });
    });
  });

  describe('Experience Ratings', () => {
    it('should display experience ratings section', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('⭐ Experience Ratings')).toBeTruthy();
      });
    });

    it('should display application difficulty rating', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('Application Difficulty')).toBeTruthy();
        expect(getByText(/4\.2/)).toBeTruthy(); // Rating value
      });
    });

    it('should display interview difficulty rating', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('Interview Difficulty')).toBeTruthy();
        expect(getByText(/3\.8/)).toBeTruthy();
      });
    });

    it('should display overall experience rating', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('Overall Experience')).toBeTruthy();
        expect(getByText(/4\.5/)).toBeTruthy();
      });
    });

    it('should render star ratings', async () => {
      const { getAllByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        const starRatings = getAllByText(/★/);
        expect(starRatings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Financial Aid', () => {
    it('should display financial aid section when available', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('💰 Financial Aid')).toBeTruthy();
        expect(getByText('35.0%')).toBeTruthy();
        expect(getByText('Families Receiving Aid')).toBeTruthy();
      });
    });

    it('should not display financial aid if percentage is 0', async () => {
      const statsNoAid = { ...mockStats, financial_aid_percentage: 0 };
      (communityDataApi.getSchoolStats as jest.Mock).mockResolvedValue({
        success: true,
        stats: statsNoAid,
      });

      const { queryByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(queryByText('💰 Financial Aid')).toBeNull();
      });
    });
  });

  describe('Historical Trends', () => {
    it('should display historical trends when available', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('📊 Historical Trends')).toBeTruthy();
        expect(getByText('2026')).toBeTruthy();
        expect(getByText('2025')).toBeTruthy();
        expect(getByText('2024')).toBeTruthy();
      });
    });

    it('should not display historical trends if only one year', async () => {
      (communityDataApi.getSchoolHistory as jest.Mock).mockResolvedValue({
        success: true,
        history: [mockStats],
      });

      const { queryByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(queryByText('📊 Historical Trends')).toBeNull();
      });
    });

    it('should display contribution counts for each year', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('50 contributions')).toBeTruthy();
        expect(getByText('45 contributions')).toBeTruthy();
        expect(getByText('40 contributions')).toBeTruthy();
      });
    });
  });

  describe('Privacy Notice', () => {
    it('should display privacy information', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('About This Data')).toBeTruthy();
        expect(getByText(/anonymized/i)).toBeTruthy();
        expect(getByText(/Individual identities are never revealed/i)).toBeTruthy();
      });
    });

    it('should display privacy lock icon', async () => {
      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('🔒')).toBeTruthy();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no data available', async () => {
      (communityDataApi.getSchoolStats as jest.Mock).mockResolvedValue({
        success: true,
        stats: null,
      });

      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('No Community Data Yet')).toBeTruthy();
        expect(getByText(/Be the first to contribute/i)).toBeTruthy();
      });
    });

    it('should show empty state when contributions is 0', async () => {
      const emptyStats = { ...mockStats, total_contributions: 0 };
      (communityDataApi.getSchoolStats as jest.Mock).mockResolvedValue({
        success: true,
        stats: emptyStats,
      });

      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        expect(getByText('No Community Data Yet')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (communityDataApi.getSchoolStats as jest.Mock).mockRejectedValue(new Error('API Error'));
      (communityDataApi.getSchoolHistory as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { getByText } = render(<SchoolInsightsScreen school={mockSchool} />);

      await waitFor(() => {
        // Should show empty state on error
        expect(getByText('No Community Data Yet')).toBeTruthy();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load community insights:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
