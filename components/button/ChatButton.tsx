"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { chatService } from "@/services/chatServices";
import {toast} from "sonner";

interface ChatButtonProps {
    targetUserId: string;
    label?: string;
    className?: string;
    size?: "default" | "sm" | "lg" | "icon";
    iconClassName?: string;
}

export default function ChatButton({
    targetUserId,
    label = "Chat",
    className,
    size,
    iconClassName,
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
                is_create_manually: false,
            });

            router.push(`/chat/${chat.data.id}`);
        } catch (error: any) {
            console.log("Failed to create chat:", error);
            toast.error(error?.response?.data?.message || "Failed to create chat. Please try again later")
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleChat}
            disabled={isLoading || !targetUserId}
            size={size}
            className={
                className ??
                "bg-[#19E619] hover:bg-green-500 text-black rounded-2xl px-4 h-8 text-xs font-bold gap-1.5"
            }
        >
            <MessageCircle className={iconClassName ?? "h-3.5! w-3.5!"} />
            {isLoading ? "Opening..." : label}
        </Button>
    );
}