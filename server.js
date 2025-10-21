import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import router from './src/routes/auth.route.js';
import usersRouter from './src/routes/user.route.js';
import messageRouter from './src/routes/message.route.js';
import chatRouter from './src/routes/chat.route.js';
import { Server as IOServer } from 'socket.io';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGO_URI;
const Server = http.createServer(app);

// attach socket.io with CORS allowing frontend origin
const io = new IOServer(Server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io middleware for authentication
import jwt from 'jsonwebtoken';
import User from './src/models/user.model.js';
import Chat from './src/models/chat.model.js';
import Message from './src/models/message.model.js';

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log("No token provided in socket connection");
      return next(new Error("Authentication error"));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      console.log("User not found for socket connection");
      return next(new Error("User not found"));
    }
    
    console.log("Socket authenticated for user:", user.username);
    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    return next(new Error("Authentication error"));
  }
});

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.user.username);
  
  // Create or join a socket room for the user
  socket.join(socket.user._id.toString());
  
  // Handle joining a specific chat room
  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.user.username} joined chat: ${chatId}`);
  });
  
  // Handle new messages
  socket.on("new message", async (message) => {
    try {
      const chat = await Chat.findById(message.chat);
      if (!chat) return;
      
      // Send message to all users in the chat except sender
      chat.users.forEach(userId => {
        if (userId.toString() !== socket.user._id.toString()) {
          io.to(userId.toString()).emit("message received", message);
        }
      });
      
      // Update the chat's latest message
      await Chat.findByIdAndUpdate(message.chat, { latestMessage: message._id });
    } catch (error) {
      console.error("Socket error:", error);
    }
  });
  
  // Handle typing indicators
  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing", { user: socket.user._id, chatId });
  });
  
  socket.on("stop typing", (chatId) => {
    socket.to(chatId).emit("stop typing");
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.username);
  });
});

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use('/api/auth', router);
app.use('/api/users', usersRouter);
app.use('/api/messages', messageRouter);
app.use('/api/chats', chatRouter);

//MongoDB connection
mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'chatapp'
}).then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

//server 
Server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});