import express from "express"
import http from "http";
import jwt from "jsonwebtoken";
import cors from "cors";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser"
import { Server } from "socket.io";
import { serialize, parse, parseCookie } from "cookie";
import { randomUUID } from "crypto";
import { addUser, getUserByUsername, getUserByID } from "./db-service.js";
import { error } from "console";
import { connect } from "http2";

const SECRET = "OdGsuf9CF8GKDfBrsJeXdIRK4LdVZAYp";
const REF_SECRET = "vvgJ48eJrzWi4FlUUoyOPdyfx1yU810m";
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
app.use(cookieParser());

//login the user
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);
    const valid = await bcrypt.compare(password, user.password);
    console.log(valid)

    if (!valid) {
        return res.status(401).send("Invalid");
    }

    console.log("authenticated user " + username);
    // register a token 
    const access_token = jwt.sign({userID: user.id}, SECRET, { expiresIn: "15s"});
    const refresh_token = jwt.sign({userID: user.id}, REF_SECRET, { expiresIn: "1m"});

    // clear old cookie from previous user
    // set the new token in a cookie
    res.cookie("auth_token", access_token, {
        httpOnly: true,
        secure: false,       // true in production (HTTPS)
        path: "/",
        overwrite: true
    });
    res.cookie("ref_token", refresh_token, {
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
    let hashedPassword;

    try {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt)
    } catch {
        return console.log("cannot hash")
    }

    try {
        addUser(username, hashedPassword);
    } catch(error) {
        console.error(error);
        return res.status(400).send("Something wrong with given data");
    }

    return res.status(201).send("Success");
})

app.post("/refresh", (req, res) => {
    console.log("refresh tried")
    const ref_token = req.cookies.ref_token;

    if (!ref_token) return res.sendStatus(401);

    try {
        const payload = jwt.verify(ref_token, REF_SECRET);
        console.log(payload.userID);

        const newAccessToken = jwt.sign(
        { userID: payload.userID },
        SECRET,
        { expiresIn: "15s" }
        );

        res.cookie("auth_token", newAccessToken, {
            httpOnly: true,
            secure: false,       // true in production (HTTPS)
            path: "/",
            overwrite: true
        });

        res.sendStatus(200);
    } catch {
        res.sendStatus(403);
    }
});

server.listen(3001);

io.use((socket, next) => {
    console.log("authorization");
    const cookie = socket.request.headers.cookie;

    if (!cookie) {
        console.log("no cookie");
        return next(new Error("No cookie"));
    }

    const token = parseCookie(cookie).auth_token
    console.log(token)


    if (!token) {
        console.log("no token")
        return next(new Error("No token"));
    }

    try {
        const payload = jwt.verify(token, SECRET);
        console.log(payload)
        
        socket.data.userID = payload.userID;
        socket.data.expiresIn = payload.exp * 1000;
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
    const now = Date.now();
    const timeLeft = socket.data.expiresIn - now;
    console.log(user);

    if (timeLeft <= 0) {
        socket.disconnect();
        return;
    }

    const timeout = setTimeout(() => {
        socket.emit("expired");
        socket.disconnect();
        return;
    }, timeLeft)

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
        clearTimeout(timeout);
    });
});

// sets a cookie
function addSetCookie(headers, cookie) {
    const prev = headers["set-cookie"];
    headers["set-cookie"] = prev
    ? ([]).concat(prev, cookie)
    : [cookie];
}
