"use client"

import Image from "next/image";
import Chat from "./chat/page";
import Login from "./login/page";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2 justify-center items-center h-screen w-screen bg-amber-50 text-gray-900">
        <h1 className="text-xl text-gray-900">Welcome to the real time chat!</h1>
        <button onClick={() => router.push("/login")} className="bg-gray-900 text-amber-50 px-3 py-1 rounded-2xl border-2 border-gray-900 transition ease-in-out duration-400 hover:bg-amber-50 hover:text-gray-900">
            Log in
        </button>
        <p className="text-gray-900 text-l">Or</p>
        <button onClick={() => router.push("/signup")} className="bg-gray-900 text-amber-50 px-3 py-1 rounded-2xl border-2 border-gray-900 transition ease-in-out duration-400 hover:bg-amber-50 hover:text-gray-900">
            Sign up
        </button>
    </div>
   // <Login/>
  );
}
