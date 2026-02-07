import { Server } from "socket.io";
import { serialize, parse } from "cookie";
import { randomUUID } from "crypto";

const messages = [];
const map = new Map();

const io = new Server(3001, {
  cookie: true
});

io.engine.on("initial_headers", (headers, request) => {
    const cookies = request.headers.cookie
        ? parse(request.headers.cookie)
        : {};

    let userID = cookies.uid;

    if (!userID) {
    userID = randomUUID();

    addSetCookie(
        headers,
        serialize("uid", userID, {
            maxAge: 60 * 60 * 24 * 365, 
            sameSite: "strict"
        })
    );
    }
});

io.on("connection", (socket) => {
    console.log("User connected")
    const userID = socket.request.userID;
    console.log(userID);

    socket.emit("all_messages", messages);
    socket.emit("your_username", map.get(userID));
    socket.emit("usernames", Array.of(map.values));

    socket.on("set_username", (username) => {
        map.set(userID, username);
        console.log("Set username " + username);
    });

    socket.on("my_username", () => {
        socket.emit("my_username", map.get(userID));
    });

    socket.on("message", (data) => {
        console.log("recieved")
        const message = {id: messages.length, message: data, sender: map.get(userID)};
        messages.push(message)
        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("Disconnected User " + map.get(userID))
    });
});

function addSetCookie(headers, cookie) {
    const prev = headers["set-cookie"];
    headers["set-cookie"] = prev
    ? ([]).concat(prev, cookie)
    : [cookie];
}
