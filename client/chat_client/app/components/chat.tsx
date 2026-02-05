"use client"; // REQUIRED in App Router

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import Message from "./message";

interface Message {
    id: number;
    message: string;
    sender: string;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [myUsername, setMyUsername] = useState<string>();

    useEffect(() => {
        const socket = getSocket();

        socket.connect();

        socket.on("connect", (username: string) => {
            console.log("Connected:", socket.id);
        });

        socket.on("your_username", (username: string) => {
            console.log(username)
            setMyUsername(username);
        });

        socket.on("message", (data: Message) => {
            setMessages(prev => [...prev, data]);
            console.log("Message:", data);
        });

        socket.on("all_messages", (data: Message[]) => {
            setMessages(data);
            console.log("Loaded all messages");
        });

        return () => {
            socket.off("message");
            socket.disconnect();
        };
    }, []);

    const sendMessage = () => {
        console.log("I'am pressed!")
        
        if (!input.trim()) return;

        const socket = getSocket();

        socket.emit("message", input)
    }

    return <div className="flex flex-row h-screen">
        <div className="flex flex-col w-1/2 p-5 gap-2">
            {messages.map(message => (
                <Message key={message.id} message={message.message} user={message.sender} me={myUsername === message.sender}/>
            ))}
        </div>
        <div className="flex flex-col gap-3 items-center w-1/2 p-5 bg-amber-50">
            <input value={input} className="py-1 px-3 w-full rounded-2xl bg-black text-white" onChange={e => setInput(e.target.value)}/>
            <button onClick={sendMessage} className="bg-black rounded-2xl w-1/12">Send</button>
        </div>
    </div>;
}