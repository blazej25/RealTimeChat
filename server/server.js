import express from "express"
import http from "http";
import jwt from "jsonwebtoken";
import cors from "cors";
import { Server } from "socket.io";
import { serialize, parse, parseCookie } from "cookie";
import { randomUUID } from "crypto";
import { addUser, getUserByUsername, getUserByID } from "./db-service.js";
import { error } from "console";
import { connect } from "http2";

const SECRET = "OdGsuf9CF8GKDfBrsJeXdIRK4LdVZAYp";
const messages = [];
const map = new Map();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
});

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.use(express.json());

//login the user
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);

    if (user.password != password) {
        return res.status(401).send("Invalid");
    }

    console.log("authenticated user " + username);
    // register a token 
    const token = jwt.sign({userID: user.id}, SECRET, { expiresIn: "1h"});
    console.log(token);

    // clear old cookie from previous user
    // set the new token in a cookie
    res.cookie("auth_token", token, {
        httpOnly: true,
        secure: false,       // true in production (HTTPS)
        path: "/",
        overwrite: true
    });

    res.sendStatus(200);
});

// signup a new user
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        addUser(username, password);
    } catch(error) {
        console.error(error);
        return res.status(400).send("Something wrong with given data");
    }

    return res.status(201).send("Success");
})

app.post("/logout", (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: false, // true in production
    path: "/",
    overwrite: true
  });

  res.sendStatus(200);
});

server.listen(3001);

// set headers on new connection
//io.engine.on("initial_headers", (headers, request) => {
    //const cookies = request.headers.cookie
        //? parse(request.headers.cookie)
        //: {};

    //let userID = cookies.uid;

    //// generate new uid if not present 
    //if (!userID) {
    //userID = randomUUID();

    //// set the new uid in a cookie 
    //addSetCookie(
        //headers,
        //serialize("uid", userID, {
            //maxAge: 60 * 60 * 24 * 365, 
            //sameSite: "strict"
        //})
    //);
    //}
//});

io.use((socket, next) => {
    console.log("first");
    const cookie = socket.request.headers.cookie;

    if (!cookie) {
        console.log("no cookie");
        return next(new Error("No cookie"));
    }

    const token = parseCookie(cookie).auth_token

    if (!token) {
        console.log("no token")
        return next(new Error("No token"));
    }

    try {
        const payload = jwt.verify(token, SECRET);
        console.log(payload)
        
        socket.data.userID = payload.userID;
        next();
    } catch {
        console.log("unauthorized!!")
        io.emit("unauthorized");
        next(new Error("UNAUTHORIZED"));
    }
});

io.on("connection", async (socket) => {
    console.log("User connected")
    const userID = socket.data.userID;
    const user = await getUserByID(userID);
    console.log(userID);
    console.log(user);

    socket.emit("all_messages", messages);

    // responds with username associated with the user asking 
    socket.on("my_username", () => {
        socket.emit("my_username", user.username);
    });

    // persists and forewards a message
    socket.on("message", (data) => {
        console.log("recieved")
        const message = {id: messages.length, message: data, sender: user.username};
        messages.push(message)
        io.emit("message", message);
    });

    // disconnect user
    socket.on("disconnect", () => {
        console.log("Disconnected User " + user.username)
    });
});

// sets a cookie
function addSetCookie(headers, cookie) {
    const prev = headers["set-cookie"];
    headers["set-cookie"] = prev
    ? ([]).concat(prev, cookie)
    : [cookie];
}
