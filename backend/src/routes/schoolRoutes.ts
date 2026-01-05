import { Router, Request, Response, NextFunction } from 'express';
import { SchoolModel } from '../models/School';
import { createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/schools - Get all schools or search
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, city, type, grade } = req.query;

    let schools;

    if (search) {
      schools = await SchoolModel.search(search as string);
    } else if (city) {
      schools = await SchoolModel.findByCity(city as string);
    } else if (type) {
      schools = await SchoolModel.findByType(type as string);
    } else if (grade) {
      schools = await SchoolModel.findByGrade(grade as string);
    } else {
      schools = await SchoolModel.findAll();
    }

    res.json({
      success: true,
      count: schools.length,
      schools,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/schools/stats/summary - Get school statistics summary
router.get('/stats/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const byCity = await SchoolModel.getCountByCity();
    const byType = await SchoolModel.getCountByType();
    const allSchools = await SchoolModel.findAll();

    res.json({
      success: true,
      summary: {
        total: allSchools.length,
        byCity,
        byType,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/schools/:id - Get school by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const school = await SchoolModel.findById(id);

    if (!school) {
      throw createError('School not found', 404);
    }

    res.json({
      success: true,
      school,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/schools - Create new school (admin only - TODO: add auth)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolData = req.body;

    if (!schoolData.name) {
      throw createError('School name is required', 400);
    }

    const school = await SchoolModel.create(schoolData);

    res.status(201).json({
      success: true,
      message: 'School created successfully',
      school,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/schools/:id - Update school (admin only - TODO: add auth)
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const school = await SchoolModel.update(id, updates);

    if (!school) {
      throw createError('School not found', 404);
    }

    res.json({
      success: true,
      message: 'School updated successfully',
      school,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/schools/:id - Delete school (admin only - TODO: add auth)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await SchoolModel.delete(id);

    if (!deleted) {
      throw createError('School not found', 404);
    }

    res.json({
      success: true,
      message: 'School deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
