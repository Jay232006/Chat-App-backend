import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    users: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message" 
    }],
    latestMessage: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Message" 
    },
},  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);