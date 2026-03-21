"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { chatService } from "@/services/chatServices";
import { useSession } from "next-auth/react";
import { userService } from "@/services/userServices";

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
    const { data: session, update } = useSession();

    const handleChat = async () => {
        if (!targetUserId) return;

        try {
            setIsLoading(true);

            const chat = await chatService.createChat({
                type: "private",
                user_ids: [targetUserId],
            });

            const alreadySubscribed = session?.user.channels.some(
                (ch) => ch.name === `chat.${chat.data.id}`
            );

            if (!alreadySubscribed) {
                const { channels } = await userService.userChannels();
                await update({ channels });
            }

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