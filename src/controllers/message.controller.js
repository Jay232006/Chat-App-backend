import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) return res.status(400).json({ message: "Invalid data" });

    // Find the chat to get participants
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Find the receiver (the other participant in the chat)
    const receiverId = chat.users.find(userId => userId.toString() !== req.user.id.toString());
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver not found in chat' });
    }

    let message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
      chat: chatId,
    });

    message = await message.populate("sender", "name email");
    message = await message.populate("receiver", "name email");
    message = await message.populate({
      path: "chat",
      populate: { path: "users", select: "name email" }
    });
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message, $push: { messages: message._id } });

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name email")
    .populate("chat");
  res.json(messages);
};
