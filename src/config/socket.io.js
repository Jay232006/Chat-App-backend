import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new IOServer(server, {
  pingTimeout: 60000,
  cors: { origin: process.env.FRONTEND_URL, methods: ["GET", "POST"], credentials: true }
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => socket.join(room));

  socket.on("new message", (newMsg) => {
    const chat = newMsg.chat;
    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id === newMsg.sender._id) return;
      socket.in(user._id).emit("message received", newMsg);
    });

    socket.to(newMsg.chat._id).emit("message received", newMsg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
