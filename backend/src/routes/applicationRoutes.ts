import { Router, Request, Response, NextFunction } from 'express';
import { ApplicationModel } from '../models/Application';
import { createError } from '../middleware/errorHandler';

const router = Router();

// TODO: Add authentication middleware
// For now, we'll use a hardcoded user ID for testing
const TEMP_USER_ID = 'test-user-123';

// GET /api/applications - Get user's applications
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const userId = TEMP_USER_ID; // TODO: Get from auth token

    let applications;
    if (status) {
      applications = await ApplicationModel.findByStatus(userId, status as string);
    } else {
      applications = await ApplicationModel.findByUserId(userId);
    }

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/applications/stats - Get application statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = TEMP_USER_ID; // TODO: Get from auth token
    const stats = await ApplicationModel.getStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/applications/deadlines - Get upcoming deadlines
router.get('/deadlines', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = TEMP_USER_ID; // TODO: Get from auth token
    const { days = '7' } = req.query;

    const applications = await ApplicationModel.getUpcomingDeadlines(
      userId,
      parseInt(days as string)
    );

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/applications/:id - Get specific application
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const application = await ApplicationModel.findById(id);

    if (!application) {
      throw createError('Application not found', 404);
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/applications - Create new application
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = TEMP_USER_ID; // TODO: Get from auth token
    const applicationData = req.body;

    if (!applicationData.school_id) {
      throw createError('school_id is required', 400);
    }
    if (!applicationData.grade_applying) {
      throw createError('grade_applying is required', 400);
    }
    if (!applicationData.application_year) {
      throw createError('application_year is required', 400);
    }

    const application = await ApplicationModel.create(userId, applicationData);

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/applications/:id - Update application
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = TEMP_USER_ID; // TODO: Get from auth token
    const updates = req.body;

    const application = await ApplicationModel.update(id, userId, updates);

    if (!application) {
      throw createError('Application not found or unauthorized', 404);
    }

    res.json({
      success: true,
      message: 'Application updated successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/applications/:id - Delete application
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = TEMP_USER_ID; // TODO: Get from auth token

    const deleted = await ApplicationModel.delete(id, userId);

    if (!deleted) {
      throw createError('Application not found or unauthorized', 404);
    }

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
