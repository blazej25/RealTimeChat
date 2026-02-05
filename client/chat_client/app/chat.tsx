"use client"; // REQUIRED in App Router

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

interface Message {
    message: string;
    sender: string;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        const socket = getSocket();

        socket.connect();

        socket.on("connect", () => {
            console.log("Connected:", socket.id);
        });

        socket.on("message", (data: Message) => {
            setMessages(prev => [...prev, data]);
            console.log("Message:", data);
        });

        return () => {
            socket.off("message");
            socket.disconnect();
        };
    }, []);

    return <div className="flex flex-col">
        {
            messages.map(message => (
                <div key={message.message}>Message: {message.message} From: {message.sender}</div>
            ))
        }
    </div>;
}