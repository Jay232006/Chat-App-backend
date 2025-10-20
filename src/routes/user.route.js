import express from 'express';
import { getUsers, updateProfile } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/users
router.get('/', getUsers);

// PUT /api/users/profile - Update user profile
router.put('/profile', verifyToken, updateProfile);

export default router;