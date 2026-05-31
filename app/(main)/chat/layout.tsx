"use client";

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import {useParams, useRouter} from "next/navigation";
import {useChatStore} from "@/store/useChatStore";
import {useMemo} from "react";
import {useIsMobile} from "@/hooks/use-mobile";

export default function ChatLayout({children}: { children: React.ReactNode; }) {
    const router = useRouter();
    const isMobile = useIsMobile();
    const params = useParams();
    const chatId = Array.isArray(params?.userId) ? params.userId[0] : params?.userId;
    const { chats } = useChatStore();
    const activeChat = useMemo(() => {
        return chats.find((c) => c.id === chatId);
    }, [chats, chatId]);

    const showSidebar = !isMobile || !chatId;
    const showChatArea = !isMobile || !!chatId;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {showSidebar && <ChatSidebar/>}

            {showChatArea && (
                <main className="flex-1 min-w-0 bg-[hsl(var(--chat-bg))]">
                    {chatId ? (
                        activeChat ? (
                            <ChatWindow key={chatId} chat={activeChat} onBack={() => router.push("/chat")}/>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground px-4 text-center">
                                Chat not found.
                            </div>
                        )
                    ) : (children)}
                </main>
            )}
        </div>
    );
}
