import { io } from "socket.io-client";

try {
    const socket = await io("http://localhost:3000");
    socket.emit("setup", { _id: "68f48ddca83645fdbf9827d2" });

    socket.on("connected", () => console.log("Socket connected successfully"));
} catch (error) {
  console.log("Socket connection error:", error);
}
