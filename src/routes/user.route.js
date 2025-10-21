import express from 'express';
import { getUsers, updateProfile, getMe } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/users
router.get('/', getUsers);

// GET /api/users/me - Get current authenticated user
router.get('/me', protect, getMe);

// PUT /api/users/profile - Update user profile
router.put('/profile', protect, updateProfile);

export default router;