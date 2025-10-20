import express from 'express';
import { oldChats, fetchChats } from '../controllers/chat.controllers.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get or create a one-to-one chat between current user and provided userId
router.post('/', protect, oldChats);

// List all chats for current user
router.get('/', protect, fetchChats);

export default router;