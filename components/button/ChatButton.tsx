"use client";

import {Button} from "@/components/ui/button";
import {MessageCircle} from "lucide-react";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {chatService} from "@/services/chatServices";

interface ChatButtonProps {
    targetUserId: string;
    label?: string;
    className?: string;
}

export default function ChatButton({
                                       targetUserId,
                                       label = "Chat",
                                       className,
                                   }: ChatButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleChat = async () => {
        if (!targetUserId) return;

        try {
            setIsLoading(true);

            const chat = await chatService.createChat({
                type: "private",
                user_ids: [targetUserId],
            });

            router.push(`/chat/${chat.data.id}`);
        } catch (error) {
            console.error("Failed to create chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleChat}
            disabled={isLoading || !targetUserId}
            className={
                className ??
                "bg-[#19E619] hover:bg-green-500 text-black rounded-2xl px-4 h-8 text-xs font-bold gap-1.5"
            }
        >
            <MessageCircle className="h-3.5 w-3.5"/>
            {isLoading ? "Opening..." : label}
        </Button>
    );
}