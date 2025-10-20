import express from 'express';
import { getUsers } from '../controllers/user.controller.js';

const router = express.Router();

// GET /api/users
router.get('/', getUsers);

export default router;