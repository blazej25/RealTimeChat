import { Server } from "socket.io";
const messages = [];
const map = new Map();

const io = new Server(3001, {
  // options
});

io.on("connection", (socket) => {
    console.log("User connected")

    socket.emit("all_messages", messages);
    socket.emit("your_username", map.get(socket));
    socket.emit("usernames", Array.of(map.values));

    socket.on("set_username", (username) => {
        map.set(socket, username);
        console.log("Set username " + username);
    });

    socket.on("my_username", () => {
        socket.emit("my_username", map.get(socket));
    });

    socket.on("message", (data) => {
        console.log("recieved")
        const message = {id: messages.length, message: data, sender: map.get(socket)};
        messages.push(message)
        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("Disconnected User " + map.get(socket))
    });
});
