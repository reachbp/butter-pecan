import { CommunityDataModel } from '../CommunityData';
import { query } from '../database';

// Mock database query
jest.mock('../database', () => ({
  query: jest.fn(),
}));

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('CommunityDataModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSharingPreferences', () => {
    it('should get user sharing preferences', async () => {
      const mockPrefs = {
        id: 'pref-1',
        user_id: 'user-1',
        share_outcomes: true,
        share_timeline: true,
        share_ratings: true,
        share_demographics: false,
        share_financial_aid: false,
        always_anonymous: true,
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockPrefs] } as any);

      const result = await CommunityDataModel.getSharingPreferences('user-1');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM user_data_sharing_preferences WHERE user_id = $1',
        ['user-1']
      );
      expect(result).toEqual(mockPrefs);
    });

    it('should return null if no preferences exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await CommunityDataModel.getSharingPreferences('user-1');

      expect(result).toBeNull();
    });
  });

  describe('upsertSharingPreferences', () => {
    it('should create or update sharing preferences', async () => {
      const updates = {
        share_outcomes: false,
        share_demographics: true,
      };

      const mockUpdated = {
        id: 'pref-1',
        user_id: 'user-1',
        ...updates,
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUpdated] } as any);

      const result = await CommunityDataModel.upsertSharingPreferences('user-1', updates);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toMatchObject(updates);
    });
  });

  describe('createContribution', () => {
    it('should create a new community contribution', async () => {
      const contributionData = {
        school_id: 'school-1',
        application_year: 2026,
        acceptance_status: 'accepted' as const,
        application_difficulty_rating: 4,
      };

      const mockPrefs = { share_outcomes: true };
      const mockContribution = {
        id: 'contrib-1',
        user_id: 'user-1',
        ...contributionData,
        is_public: true,
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockPrefs] } as any);
      mockQuery.mockResolvedValueOnce({ rows: [mockContribution] } as any);

      const result = await CommunityDataModel.createContribution('user-1', contributionData);

      expect(result).toMatchObject(contributionData);
      expect(result.is_public).toBe(true);
    });

    it('should set is_public based on user preferences', async () => {
      const contributionData = {
        school_id: 'school-1',
        application_year: 2026,
      };

      const mockPrefs = { share_outcomes: false };

      mockQuery.mockResolvedValueOnce({ rows: [mockPrefs] } as any);
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'contrib-1', is_public: false }] } as any);

      await CommunityDataModel.createContribution('user-1', contributionData);

      // Second call should include is_public = false
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe('findByUserId', () => {
    it('should get all contributions for a user', async () => {
      const mockContributions = [
        {
          id: 'contrib-1',
          user_id: 'user-1',
          school_id: 'school-1',
          application_year: 2026,
          school: { id: 'school-1', name: 'Test School' },
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockContributions } as any);

      const result = await CommunityDataModel.findByUserId('user-1');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('FROM community_contributions'),
        ['user-1']
      );
      expect(result).toEqual(mockContributions);
    });
  });

  describe('findById', () => {
    it('should find a contribution by ID', async () => {
      const mockContribution = {
        id: 'contrib-1',
        user_id: 'user-1',
        school_id: 'school-1',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockContribution] } as any);

      const result = await CommunityDataModel.findById('contrib-1');

      expect(result).toEqual(mockContribution);
    });

    it('should return null if not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await CommunityDataModel.findById('contrib-999');

      expect(result).toBeNull();
    });
  });

  describe('updateContribution', () => {
    it('should update a contribution', async () => {
      const updates = {
        acceptance_status: 'accepted' as const,
        application_difficulty_rating: 5,
      };

      const mockUpdated = {
        id: 'contrib-1',
        user_id: 'user-1',
        ...updates,
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUpdated] } as any);

      const result = await CommunityDataModel.updateContribution('contrib-1', 'user-1', updates);

      expect(result).toMatchObject(updates);
    });

    it('should return null if contribution not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await CommunityDataModel.updateContribution('contrib-999', 'user-1', {});

      expect(result).toBeNull();
    });
  });

  describe('deleteContribution', () => {
    it('should delete a contribution', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 } as any);

      const result = await CommunityDataModel.deleteContribution('contrib-1', 'user-1');

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM community_contributions WHERE id = $1 AND user_id = $2',
        ['contrib-1', 'user-1']
      );
      expect(result).toBe(true);
    });

    it('should return false if not found', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 } as any);

      const result = await CommunityDataModel.deleteContribution('contrib-999', 'user-1');

      expect(result).toBe(false);
    });
  });

  describe('getSchoolStats', () => {
    it('should get school statistics for a year', async () => {
      const mockStats = {
        id: 'stats-1',
        school_id: 'school-1',
        application_year: 2026,
        total_contributions: 50,
        acceptance_rate: 25.5,
        waitlist_rate: 15.2,
        rejection_rate: 59.3,
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockStats] } as any);

      const result = await CommunityDataModel.getSchoolStats('school-1', 2026);

      expect(result).toEqual(mockStats);
    });

    it('should return null if no stats exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await CommunityDataModel.getSchoolStats('school-1', 2026);

      expect(result).toBeNull();
    });
  });

  describe('getSchoolStatsHistory', () => {
    it('should get historical stats for a school', async () => {
      const mockHistory = [
        { school_id: 'school-1', application_year: 2026, total_contributions: 50 },
        { school_id: 'school-1', application_year: 2025, total_contributions: 45 },
        { school_id: 'school-1', application_year: 2024, total_contributions: 40 },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockHistory } as any);

      const result = await CommunityDataModel.getSchoolStatsHistory('school-1', 3);

      expect(result).toEqual(mockHistory);
      expect(result).toHaveLength(3);
    });
  });

  describe('getPublicContributions', () => {
    it('should get anonymized public contributions', async () => {
      const mockContributions = [
        {
          acceptance_status: 'accepted',
          grade_applied: '9',
          application_difficulty_rating: 4,
        },
        {
          acceptance_status: 'waitlisted',
          grade_applied: '9',
          application_difficulty_rating: 5,
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockContributions } as any);

      const result = await CommunityDataModel.getPublicContributions('school-1', 2026, 50);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE school_id = $1'),
        ['school-1', 2026, 50]
      );
      expect(result).toEqual(mockContributions);
    });
  });

  describe('getTopSchoolsByAcceptanceRate', () => {
    it('should get top schools by acceptance rate', async () => {
      const mockSchools = [
        {
          school_id: 'school-1',
          acceptance_rate: 35.5,
          school: { id: 'school-1', name: 'School A' },
        },
        {
          school_id: 'school-2',
          acceptance_rate: 30.2,
          school: { id: 'school-2', name: 'School B' },
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockSchools } as any);

      const result = await CommunityDataModel.getTopSchoolsByAcceptanceRate(2026, 10);

      expect(result).toEqual(mockSchools);
    });
  });

  describe('compareSchools', () => {
    it('should compare multiple schools', async () => {
      const schoolIds = ['school-1', 'school-2', 'school-3'];
      const mockComparison = [
        {
          school_id: 'school-1',
          acceptance_rate: 30,
          school: { id: 'school-1', name: 'School A' },
        },
        {
          school_id: 'school-2',
          acceptance_rate: 25,
          school: { id: 'school-2', name: 'School B' },
        },
        {
          school_id: 'school-3',
          acceptance_rate: 20,
          school: { id: 'school-3', name: 'School C' },
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockComparison } as any);

      const result = await CommunityDataModel.compareSchools(schoolIds, 2026);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE scs.school_id = ANY($1)'),
        [schoolIds, 2026]
      );
      expect(result).toEqual(mockComparison);
      expect(result).toHaveLength(3);
    });
  });

  describe('recalculateStats', () => {
    it('should manually recalculate stats', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await CommunityDataModel.recalculateStats('school-1', 2026);

      expect(mockQuery).toHaveBeenCalledWith('SELECT recalculate_school_stats($1, $2)', [
        'school-1',
        2026,
      ]);
    });
  });
});
