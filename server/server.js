import { Server } from "socket.io";
import { serialize, parse } from "cookie";
import { randomUUID } from "crypto";
import { addUser } from "./db-service.js";

const messages = [];
const map = new Map();

const io = new Server(3001, {
  cookie: true
});


// set headers on new connection
io.engine.on("initial_headers", (headers, request) => {
    const cookies = request.headers.cookie
        ? parse(request.headers.cookie)
        : {};

    let userID = cookies.uid;

    // generate new uid if not present 
    if (!userID) {
    userID = randomUUID();

    // set the new uid in a cookie 
    addSetCookie(
        headers,
        serialize("uid", userID, {
            maxAge: 60 * 60 * 24 * 365, 
            sameSite: "strict"
        })
    );
    }
});

io.use((socket, next) => {
  const req = socket.request;

  const cookies = req.headers.cookie
    ? parse(req.headers.cookie)
    : {};

  let userID = cookies.uid;

  socket.userID = userID; 
  next();
});

io.on("connection", (socket) => {
    console.log("User connected")
    const userID = socket.userID;
    console.log(userID);

    socket.emit("all_messages", messages);
    socket.emit("your_username", map.get(userID));
    socket.emit("usernames", Array.of(map.values));

    // set username for a session 
    socket.on("set_username", (username) => {
        map.set(userID, username);
        addUser(username, userID);
        console.log("Set username " + username);
    });

    // responds with username associated with the user asking 
    socket.on("my_username", () => {
        socket.emit("my_username", map.get(userID));
    });

    // persists and forewards a message
    socket.on("message", (data) => {
        console.log("recieved")
        const message = {id: messages.length, message: data, sender: map.get(userID)};
        messages.push(message)
        io.emit("message", message);
    });

    // disconnect user
    socket.on("disconnect", () => {
        console.log("Disconnected User " + map.get(userID))
    });
});

// sets a cookie
function addSetCookie(headers, cookie) {
    const prev = headers["set-cookie"];
    headers["set-cookie"] = prev
    ? ([]).concat(prev, cookie)
    : [cookie];
}
