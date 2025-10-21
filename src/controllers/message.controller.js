import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) return res.status(400).json({ message: "Invalid data" });

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!Array.isArray(chat.users) || chat.users.length < 2) {
      return res.status(400).json({ message: 'Chat must have at least two users' });
    }

    // Use req.user._id for consistency with Mongoose document id
    const meId = req.user._id?.toString();
    const receiverId = chat.users.map(u => u.toString()).find(uid => uid !== meId);
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver not found in chat' });
    }

    let message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      chat: chatId,
    });

    message = await message.populate("sender", "username email");
    message = await message.populate("receiver", "username email");
    message = await message.populate({
      path: "chat",
      populate: { path: "users", select: "username email" }
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id, $push: { messages: message._id } });

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "username email")
    .populate("chat");
  res.json(messages);
};
