import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

export const oldChats = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    };

    let chat = await Chat.findOne({ users: { $all: [req.user._id, userId] },
     }).populate("users","-password").populate("messages");

     if(chat) return res.json(chat);

     
};
