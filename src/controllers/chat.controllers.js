import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

export const oldChats = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    //checking if chat already exists
    let chat = await Chat.findOne({
        users: { $all: [req.user._id, userId] },
    }).populate("users", "-password").populate("messages");

    if (chat) return res.json(chat);
    
    //New chat code
    const newChat = await Chat.create({ users: [req.user._id, userId], messages: [] });
    const fullChat = await Chat.findById(newChat._id).populate("users", "-password").populate("messages");
    res.status(201).json(fullChat);
    
};
//fetching chats
export const fetchChats = async (req, res) => {
    const chats = await Chat.find({ users: req.user.id })
        .populate("users", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });
    res.json(chats);
};


