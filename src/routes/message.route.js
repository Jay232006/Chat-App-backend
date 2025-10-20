import express from 'express';
import { sendMessage, getMessages } from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route to send a message
router.post('/', protect, sendMessage);

// Route to get messages for a specific chat
router.get('/:chatId', protect, getMessages);

export default router;