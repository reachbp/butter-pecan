import { Router, Request, Response } from 'express';
import { CommunityDataModel } from '../models/CommunityData';

const router = Router();

/**
 * GET /api/community/preferences
 * Get user's data sharing preferences
 */
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    let preferences = await CommunityDataModel.getSharingPreferences(userId);

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await CommunityDataModel.upsertSharingPreferences(userId, {
        share_outcomes: true,
        share_timeline: true,
        share_ratings: true,
        share_demographics: false,
        share_financial_aid: false,
        always_anonymous: true,
      });
    }

    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Get sharing preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to get preferences' });
  }
});

/**
 * PUT /api/community/preferences
 * Update user's data sharing preferences
 */
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const updates = req.body;

    const preferences = await CommunityDataModel.upsertSharingPreferences(userId, updates);
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

/**
 * POST /api/community/contributions
 * Create a new community contribution
 */
router.post('/contributions', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const data = req.body;

    if (!data.school_id || !data.application_year) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: school_id, application_year',
      });
    }

    const contribution = await CommunityDataModel.createContribution(userId, data);
    res.status(201).json({ success: true, contribution });
  } catch (error) {
    console.error('Create contribution error:', error);
    res.status(500).json({ success: false, error: 'Failed to create contribution' });
  }
});

/**
 * GET /api/community/contributions
 * Get user's contributions
 */
router.get('/contributions', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const contributions = await CommunityDataModel.findByUserId(userId);
    res.json({ success: true, contributions });
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get contributions' });
  }
});

/**
 * PUT /api/community/contributions/:id
 * Update a contribution
 */
router.put('/contributions/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;
    const updates = req.body;

    const contribution = await CommunityDataModel.updateContribution(id, userId, updates);

    if (!contribution) {
      return res.status(404).json({ success: false, error: 'Contribution not found' });
    }

    res.json({ success: true, contribution });
  } catch (error) {
    console.error('Update contribution error:', error);
    res.status(500).json({ success: false, error: 'Failed to update contribution' });
  }
});

/**
 * DELETE /api/community/contributions/:id
 * Delete a contribution
 */
router.delete('/contributions/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;

    const success = await CommunityDataModel.deleteContribution(id, userId);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Contribution not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete contribution error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete contribution' });
  }
});

/**
 * GET /api/community/schools/:schoolId/stats
 * Get aggregated stats for a school
 */
router.get('/schools/:schoolId/stats', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const year = parseInt(req.query.year as string) || new Date().getFullYear() + 1;

    const stats = await CommunityDataModel.getSchoolStats(schoolId, year);

    if (!stats) {
      return res.json({
        success: true,
        stats: null,
        message: 'No community data available for this school and year',
      });
    }

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get school stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get school stats' });
  }
});

/**
 * GET /api/community/schools/:schoolId/history
 * Get historical stats for a school
 */
router.get('/schools/:schoolId/history', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const yearsBack = parseInt(req.query.years_back as string) || 3;

    const history = await CommunityDataModel.getSchoolStatsHistory(schoolId, yearsBack);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Get school history error:', error);
    res.status(500).json({ success: false, error: 'Failed to get school history' });
  }
});

/**
 * GET /api/community/schools/:schoolId/contributions
 * Get anonymized public contributions for a school
 */
router.get('/schools/:schoolId/contributions', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const year = parseInt(req.query.year as string) || new Date().getFullYear() + 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const contributions = await CommunityDataModel.getPublicContributions(schoolId, year, limit);
    res.json({ success: true, contributions });
  } catch (error) {
    console.error('Get public contributions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get contributions' });
  }
});

/**
 * GET /api/community/top-schools
 * Get top schools by acceptance rate
 */
router.get('/top-schools', async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear() + 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const schools = await CommunityDataModel.getTopSchoolsByAcceptanceRate(year, limit);
    res.json({ success: true, schools });
  } catch (error) {
    console.error('Get top schools error:', error);
    res.status(500).json({ success: false, error: 'Failed to get top schools' });
  }
});

/**
 * POST /api/community/compare
 * Compare statistics for multiple schools
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { school_ids, year } = req.body;

    if (!school_ids || !Array.isArray(school_ids) || school_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid school_ids array',
      });
    }

    if (school_ids.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 schools can be compared at once',
      });
    }

    const applicationYear = year || new Date().getFullYear() + 1;
    const comparison = await CommunityDataModel.compareSchools(school_ids, applicationYear);

    res.json({ success: true, comparison });
  } catch (error) {
    console.error('Compare schools error:', error);
    res.status(500).json({ success: false, error: 'Failed to compare schools' });
  }
});

export default router;
