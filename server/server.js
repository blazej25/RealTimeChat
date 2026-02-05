import { Server } from "socket.io";
const messages = [];
const map = new Map();
var countUsers = 0;

const io = new Server(8080, {
  // options
});

io.on("connection", (socket) => {
    countUsers++;
    console.log("User connected")
    map.set(socket, countUsers);

    socket.emit("all_messages", messages);
    socket.emit("your_username", "User" + countUsers);

    socket.on("message", (data) => {
        console.log("recieved")
        const message = {id: messages.length, message: data, sender: "User" + map.get(socket)};
        messages.push(message)
        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("Disconnected User" + map.get(socket))
        map.delete(socket);
    })
});
