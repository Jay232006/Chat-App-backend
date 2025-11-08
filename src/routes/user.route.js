import express from 'express';
import { getUsers, updateProfile, getMe } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getUsers);

router.get('/me', protect, getMe);

router.put('/profile', protect, updateProfile);

export default router;