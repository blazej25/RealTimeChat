import { Server } from "socket.io";

const io = new Server(8080, {
  // options
});

io.on("connection", (socket) => {
  io.emit("message", "Welcome to the chat!", "Server")
});