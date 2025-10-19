import { Server } from "socket.io";

export const io = new Server({
  pingTimeout: 60000,
  cors: { origin: "http://localhost:5173" } 
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  // Join personal room 
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Join specific chat room
  socket.on("join chat", (room) => socket.join(room));

  // New message
  socket.on("new message", (newMsg) => {
    const chat = newMsg.chat;
    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id === newMsg.sender._id) return;
      socket.in(user._id).emit("message received", newMsg);
    });
  });

  socket.off("setup", () => console.log("User disconnected"));
});
