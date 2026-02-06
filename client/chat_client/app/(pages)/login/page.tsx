"use client"

import { getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function loginPage() {
    const router = useRouter();
    const [usernames, setUsernames] = useState<string[]>([]);
    const [myUsername, setMyUsername] = useState<string>("");
    const [valid, setValid] = useState<boolean>(true);

    useEffect(() => {
        const socket = getSocket();

        socket.on("usernames", (names: String[]) => {
            setUsernames(usernames);
        });
    }, []);

    const handleClick = () => {
        if (!myUsername.trim()) return;

        const socket = getSocket();

        if (!usernames.includes(myUsername)) {
            socket.emit("set_username", myUsername);
            router.push("/chat");
        }
    };

    return <div className="flex flex-col gap-2 justify-center items-center h-screen w-screen bg-amber-50 text-gray-900">
        <h1 className="text-xl text-gray-900">Welcome to the real time chat!</h1>
        <div className="flex gap-2">
            <input placeholder="Your username" className="border-2 border-gray-900 px-3 py-1 rounded-2xl" onChange={(e) => setMyUsername(e.target.value)}/>
            <button onClick={handleClick} className="bg-gray-900 text-amber-50 px-3 py-1 rounded-2xl border-2 border-gray-900 transition ease-in-out duration-400 hover:bg-amber-50 hover:text-gray-900">
                Enter
            </button>
        </div>
    </div>
}