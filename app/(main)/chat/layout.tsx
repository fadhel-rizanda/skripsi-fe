"use client";

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import {useParams} from "next/navigation";
import {useChatStore} from "@/store/useChatStore";

export default function ChatLayout({children}: { children: React.ReactNode; }) {
    const params = useParams();
    const chatId = params?.userId;
    const { chats } = useChatStore();
    const activeChat = chats.find((c) => c.id === chatId);
    return (
        <div className="flex h-[calc(100vh-64px)]">
            {/* Sidebar */}
            <ChatSidebar/>

            {/* Chat Area */}
            <main className="flex-1 bg-[hsl(var(--chat-bg))]">
                {params?.userId ? (
                    activeChat ? <ChatWindow chat={activeChat}/> : <div>Chat not found.</div>
                ) : (children)}
            </main>
        </div>
    );
}
