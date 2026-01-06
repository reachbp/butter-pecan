import request from 'supertest';
import express from 'express';
import communityDataRoutes from '../communityDataRoutes';
import { CommunityDataModel } from '../../models/CommunityData';

// Mock the CommunityData model
jest.mock('../../models/CommunityData');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.headers['x-user-id'] = 'test-user-1';
  next();
});
app.use('/api/community', communityDataRoutes);

describe('Community Data Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/community/preferences', () => {
    it('should get user preferences', async () => {
      const mockPrefs = {
        id: 'pref-1',
        user_id: 'test-user-1',
        share_outcomes: true,
        share_timeline: true,
      };

      (CommunityDataModel.getSharingPreferences as jest.Mock).mockResolvedValue(mockPrefs);

      const response = await request(app).get('/api/community/preferences');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.preferences).toEqual(mockPrefs);
    });

    it('should create default preferences if none exist', async () => {
      const mockDefaultPrefs = {
        id: 'pref-1',
        user_id: 'test-user-1',
        share_outcomes: true,
      };

      (CommunityDataModel.getSharingPreferences as jest.Mock).mockResolvedValue(null);
      (CommunityDataModel.upsertSharingPreferences as jest.Mock).mockResolvedValue(mockDefaultPrefs);

      const response = await request(app).get('/api/community/preferences');

      expect(response.status).toBe(200);
      expect(CommunityDataModel.upsertSharingPreferences).toHaveBeenCalled();
    });
  });

  describe('PUT /api/community/preferences', () => {
    it('should update preferences', async () => {
      const updates = { share_outcomes: false };
      const mockUpdated = {
        id: 'pref-1',
        user_id: 'test-user-1',
        ...updates,
      };

      (CommunityDataModel.upsertSharingPreferences as jest.Mock).mockResolvedValue(mockUpdated);

      const response = await request(app).put('/api/community/preferences').send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.preferences).toMatchObject(updates);
    });
  });

  describe('POST /api/community/contributions', () => {
    it('should create a new contribution', async () => {
      const contributionData = {
        school_id: 'school-1',
        application_year: 2026,
        acceptance_status: 'accepted',
      };

      const mockContribution = {
        id: 'contrib-1',
        user_id: 'test-user-1',
        ...contributionData,
      };

      (CommunityDataModel.createContribution as jest.Mock).mockResolvedValue(mockContribution);

      const response = await request(app).post('/api/community/contributions').send(contributionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.contribution).toMatchObject(contributionData);
    });

    it('should return 400 if required fields missing', async () => {
      const response = await request(app).post('/api/community/contributions').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/community/contributions', () => {
    it('should get user contributions', async () => {
      const mockContributions = [
        { id: 'contrib-1', school_id: 'school-1' },
        { id: 'contrib-2', school_id: 'school-2' },
      ];

      (CommunityDataModel.findByUserId as jest.Mock).mockResolvedValue(mockContributions);

      const response = await request(app).get('/api/community/contributions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.contributions).toEqual(mockContributions);
    });
  });

  describe('PUT /api/community/contributions/:id', () => {
    it('should update a contribution', async () => {
      const updates = { acceptance_status: 'accepted' };
      const mockUpdated = { id: 'contrib-1', ...updates };

      (CommunityDataModel.updateContribution as jest.Mock).mockResolvedValue(mockUpdated);

      const response = await request(app).put('/api/community/contributions/contrib-1').send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 if not found', async () => {
      (CommunityDataModel.updateContribution as jest.Mock).mockResolvedValue(null);

      const response = await request(app).put('/api/community/contributions/contrib-999').send({});

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/community/contributions/:id', () => {
    it('should delete a contribution', async () => {
      (CommunityDataModel.deleteContribution as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete('/api/community/contributions/contrib-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 if not found', async () => {
      (CommunityDataModel.deleteContribution as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete('/api/community/contributions/contrib-999');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/community/schools/:schoolId/stats', () => {
    it('should get school stats', async () => {
      const mockStats = {
        school_id: 'school-1',
        application_year: 2026,
        total_contributions: 50,
        acceptance_rate: 25.5,
      };

      (CommunityDataModel.getSchoolStats as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app).get('/api/community/schools/school-1/stats?year=2026');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toEqual(mockStats);
    });

    it('should return null for schools with no data', async () => {
      (CommunityDataModel.getSchoolStats as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/community/schools/school-999/stats');

      expect(response.status).toBe(200);
      expect(response.body.stats).toBeNull();
    });
  });

  describe('GET /api/community/schools/:schoolId/history', () => {
    it('should get historical stats', async () => {
      const mockHistory = [
        { application_year: 2026, total_contributions: 50 },
        { application_year: 2025, total_contributions: 45 },
      ];

      (CommunityDataModel.getSchoolStatsHistory as jest.Mock).mockResolvedValue(mockHistory);

      const response = await request(app).get('/api/community/schools/school-1/history?years_back=3');

      expect(response.status).toBe(200);
      expect(response.body.history).toEqual(mockHistory);
    });
  });

  describe('GET /api/community/schools/:schoolId/contributions', () => {
    it('should get public contributions', async () => {
      const mockContributions = [
        { acceptance_status: 'accepted' },
        { acceptance_status: 'waitlisted' },
      ];

      (CommunityDataModel.getPublicContributions as jest.Mock).mockResolvedValue(mockContributions);

      const response = await request(app).get('/api/community/schools/school-1/contributions?year=2026&limit=50');

      expect(response.status).toBe(200);
      expect(response.body.contributions).toEqual(mockContributions);
    });
  });

  describe('GET /api/community/top-schools', () => {
    it('should get top schools by acceptance rate', async () => {
      const mockSchools = [
        { school_id: 'school-1', acceptance_rate: 35 },
        { school_id: 'school-2', acceptance_rate: 30 },
      ];

      (CommunityDataModel.getTopSchoolsByAcceptanceRate as jest.Mock).mockResolvedValue(mockSchools);

      const response = await request(app).get('/api/community/top-schools?year=2026&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.schools).toEqual(mockSchools);
    });
  });

  describe('POST /api/community/compare', () => {
    it('should compare multiple schools', async () => {
      const schoolIds = ['school-1', 'school-2'];
      const mockComparison = [
        { school_id: 'school-1', acceptance_rate: 30 },
        { school_id: 'school-2', acceptance_rate: 25 },
      ];

      (CommunityDataModel.compareSchools as jest.Mock).mockResolvedValue(mockComparison);

      const response = await request(app).post('/api/community/compare').send({
        school_ids: schoolIds,
        year: 2026,
      });

      expect(response.status).toBe(200);
      expect(response.body.comparison).toEqual(mockComparison);
    });

    it('should return 400 if school_ids missing', async () => {
      const response = await request(app).post('/api/community/compare').send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 if more than 10 schools', async () => {
      const schoolIds = Array.from({ length: 11 }, (_, i) => `school-${i}`);

      const response = await request(app).post('/api/community/compare').send({
        school_ids: schoolIds,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Maximum 10 schools');
    });
  });
});
