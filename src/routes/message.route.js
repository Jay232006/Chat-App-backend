import express from 'express';
import { sendMessage, getMessages } from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();
//chat routes should be managed later 
router.post('/', protect, sendMessage);

router.get('/:chatId', protect, getMessages);

export default router;