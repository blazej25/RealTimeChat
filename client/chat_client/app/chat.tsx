"use client"; // REQUIRED in App Router

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export default function Chat() {
    const [message, setMessage] = useState("Default message");

    useEffect(() => {
        const socket = getSocket();

        socket.connect();

        socket.on("connect", () => {
            setMessage("Chat connected")
            console.log("Connected:", socket.id);
        });

        socket.on("message", (data: String, sender: String) => {
            setMessage("Recieved message: " + data + "\nSender: " + sender);
            console.log("Message:", data);
        });

        return () => {
            socket.off("message");
            socket.disconnect();
        };
    }, []);

    return <div>{message}</div>;
}