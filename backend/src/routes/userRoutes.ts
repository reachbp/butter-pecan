import { Router } from 'express';

const router = Router();

// POST /api/users/register - Register new user
router.post('/register', (req, res) => {
  const userData = req.body;
  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: '1',
      email: userData.email,
    },
  });
});

// POST /api/users/login - Login user
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    message: 'Login successful',
    token: 'mock_jwt_token',
    user: {
      id: '1',
      email,
    },
  });
});

// GET /api/users/profile - Get user profile
router.get('/profile', (req, res) => {
  res.json({
    message: 'Get user profile',
    user: {
      id: '1',
      email: 'user@example.com',
      profile: {},
    },
  });
});

// PUT /api/users/profile - Update user profile
router.put('/profile', (req, res) => {
  const updates = req.body;
  res.json({
    message: 'Profile updated',
    user: updates,
  });
});

export default router;
