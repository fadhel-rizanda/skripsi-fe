"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";
import { chatService } from "@/services/chatServices";
import {Button} from "@/components/ui/button";
import {Icon} from "@iconify/react";
import {useChatStore} from "@/store/useChatStore";
import {isValidUrl} from "@/lib/utils";

export default function ChatSidebar() {
    const params = useParams();
    const activeId = params?.userId;
    const { chats, setChats, refreshTrigger } = useChatStore();
    const [loading, setLoading] = useState(true);

    const refreshChats = async () => {
        setLoading(true);
        try {
            const response = await chatService.getAllChats();
            setChats(response.data);
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleMarkAsRead = async (chatId: string) => {
        setChats(prev => prev.map(chat =>
            chat.id === chatId ? { ...chat, unread_count: 0 } : chat
        ));

        try {
            await chatService.markAsRead(chatId);
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await chatService.getAllChats();
                setChats(response.data);
            } catch (error) {
                console.error("Error fetching chats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChats().then(r => r);
    }, []);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await chatService.getAllChats();
                setChats(response.data);
            } catch (error) {
                console.error("Error refetching chats:", error);
            }
        };

        fetchChats();
    }, [refreshTrigger]);

    if (loading) {
        return (
            <aside className="w-full md:w-80 md:min-w-80 border-r bg-white h-full flex flex-col">
                <div className="p-3 md:p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Messages</h2>
                    <Button type="button" variant="outline" size="sm" onClick={refreshChats} disabled={loading}>
                        <Icon icon="ph:arrows-counter-clockwise" className="w-6 h-6"/>
                    </Button>
                </div>
                <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-full md:w-80 md:min-w-80 border-r bg-white h-full flex flex-col">
            <div className="p-3 md:p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Messages</h2>
                <Button type="button" variant="outline" size="sm" onClick={refreshChats}>
                    <Icon icon="ph:arrows-counter-clockwise" className="w-6 h-6"/>
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {chats.map((chat) => (
                    <Link key={chat.id} href={`/chat/${chat.id}`} onClick={() => (chat.unread_count > 0) && handleMarkAsRead(chat.id)}>
                        <div className={clsx(
                            "flex gap-3 px-3 md:px-4 py-4 cursor-pointer transition relative border-l-4",
                            activeId === chat.id
                                ? "bg-emerald-50 border-emerald-500"
                                : "hover:bg-gray-50 border-transparent"
                        )}>
                            <div className="relative h-12 w-12 shrink-0">
                                <Avatar className="h-12 w-12">
                                    {chat.users[0]?.avatar && isValidUrl(chat.users[0].avatar) ? (
                                        <Image
                                            src={chat.users[0].avatar}
                                            alt={chat.name || "Chat Avatar"}
                                            fill
                                            priority
                                            className="rounded-full object-cover"
                                            sizes="48px"
                                            onError={(e) => {
                                                console.error("Image failed to load:", chat.users[0].avatar);
                                            }}
                                        />
                                    ) : (
                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                            {chat?.name?.[0] || "U"}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-semibold text-sm truncate text-gray-900">
                                        {chat.name}
                                    </h3>
                                    {chat?.last_message && (
                                        <span className="text-[10px] text-gray-500 shrink-0 ml-1">
                                            {new Date(chat.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className={clsx(
                                        "text-xs truncate flex-1 pr-2",
                                        chat.unread_count > 0 ? "text-gray-900 font-bold" : "text-gray-500"
                                    )}>
                                        {chat.last_message?.content || "No messages yet"}
                                    </p>

                                    {chat.unread_count > 0 && (
                                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center">
                                            {chat.unread_count > 99 ? '99+' : chat.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </aside>
    );
}