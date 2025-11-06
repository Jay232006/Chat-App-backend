import express from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

export default router;