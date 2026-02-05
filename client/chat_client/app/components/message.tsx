"use client"

export default function Message({message, user, me}: {message: string, user: string, me: boolean}) {
    return <div className={me ? "flex flex-col gap-0.5 w-full items-end" : "flex flex-col gap-0.5 w-full"}>
        <div className="text-amber-100 text-xs max-w-1/3 w-fit">{user}</div>
        <div className="bg-amber-50 text-black text-wrap rounded-2xl px-3 py-1 max-w-1/3 w-fit">{message}</div>
    </div>
}