import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) return res.status(400).json({ message: "Invalid data" });

  let message = await Message.create({
    sender: req.user.id,
    content,
    chat: chatId,
  });

  message = await message.populate("sender", "name email");
  message = await message.populate("chat");
  await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

  res.json(message);
};

export const getMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name email")
    .populate("chat");
  res.json(messages);
};
