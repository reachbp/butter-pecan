import { Router } from 'express';

const router = Router();

// GET /api/schools - Get all schools
router.get('/', (req, res) => {
  res.json({
    message: 'Get all schools',
    schools: [],
  });
});

// GET /api/schools/:id - Get school by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: `Get school ${id}`,
    school: null,
  });
});

// GET /api/schools/:id/stats - Get school statistics
router.get('/:id/stats', (req, res) => {
  const { id } = req.params;
  res.json({
    message: `Get stats for school ${id}`,
    stats: {
      totalApplications: 0,
      decisionsReceived: 0,
      acceptanceRate: 0,
    },
  });
});

export default router;
