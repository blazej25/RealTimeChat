import { Server } from "socket.io";
const messages = [];

const io = new Server(8080, {
  // options
});

io.on("connection", (socket) => {
    var count = 1;
    const welcome_message = {message: "Welcome to the chat!", sender: "Server"};
    messages.push(welcome_message);
    io.emit("message", welcome_message);
    setInterval(() => {
        io.emit("message", {message: "Interval message: " + count, sender: "Server"});
        count++;
    }, 2000)
});