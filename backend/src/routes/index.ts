import { Router } from 'express';
import schoolRoutes from './schoolRoutes';
import applicationRoutes from './applicationRoutes';
import analyticsRoutes from './analyticsRoutes';
import userRoutes from './userRoutes';

const router = Router();

// API version and info
router.get('/', (req, res) => {
  res.json({
    name: 'SchoolWatch API',
    version: '1.0.0',
    description: 'Bay Area Private School Admissions Tracker',
    endpoints: {
      schools: '/api/schools',
      applications: '/api/applications',
      analytics: '/api/analytics',
      users: '/api/users',
    },
  });
});

// Route modules
router.use('/schools', schoolRoutes);
router.use('/applications', applicationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);

export default router;
