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
const PORT = process.env.PORT || 3000;
const URI = process.env.MONGO_URI;
const Server = http.createServer(app);
const Frontend_Url = process.env.FRONTEND_URL;

// attach socket.io with CORS allowing frontend origin and neutral path to bypass ad blockers
const io = new IOServer(Server, {
  path: '/realtime', // Neutral path to bypass ad blockers and filters
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'https://socketly-6ouz.onrender.com',
        Frontend_Url,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ].filter(Boolean);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
  },
  transports: ['polling', 'websocket'], // Prioritize polling for better compatibility
  pingTimeout: 60000,
  upgradeTimeout: 30000,
  allowEIO3: true // Support older Socket.IO clients
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

// Enhanced CORS configuration for better cross-origin support
const allowedOrigins = [
  'https://socketly-6ouz.onrender.com', 
  Frontend_Url, 
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  'https://localhost:5173', // HTTPS local development
  'https://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
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