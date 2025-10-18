import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    senderName: { type: String, required: true, unique: true },
    receiverName: { type: String, required: true, unique: true },
    messageText: { type: String, required: true },
    messagePhoto: { type: String },
}, { timestamps: true });
const Message = mongoose.model('Message', userSchema);

export default Message;
