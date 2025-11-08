import express from 'express';
import { oldChats, fetchChats } from '../controllers/chat.controllers.js';
import { protect } from '../middlewares/auth.middleware.js';
import Chat from '../models/chat.model.js';

const router = express.Router();

router.post('/', protect, oldChats);

router.get('/', protect, fetchChats());

router.get('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("users", "-password")
      .populate({
        path: "messages",
        populate: {
          path: "sender receiver",
          select: "-password"
        }
      });
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    if (!chat.users.some(user => user._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized to access this chat" });
    }
    
    res.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;