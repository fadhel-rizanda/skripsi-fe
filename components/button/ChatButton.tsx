"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { chatService } from "@/services/chatServices";
import {toast} from "sonner";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types";
import {useChatStore} from "@/store/useChatStore";

interface ChatButtonPetShare {
    petId: string;
    petName: string;
    petImageUrl?: string;
}

interface ChatButtonProps {
    targetUserId: string;
    label?: string;
    className?: string;
    size?: "default" | "sm" | "lg" | "icon";
    iconClassName?: string;
    petShare?: ChatButtonPetShare;
}

export default function ChatButton({
    targetUserId,
    label = "Chat",
    className,
    size,
    iconClassName,
    petShare,
}: ChatButtonProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const { setChats } = useChatStore();

    const handleChat = async () => {
        // Jika belum login, arahkan ke halaman login
        if (!session) {
            router.push("/login");
            return;
        }

        if (!targetUserId) return;

        try {
            setIsLoading(true);

            const chat = await chatService.createChat({
                type: "private",
                user_ids: [targetUserId],
                is_create_manually: false,
            });

            const params = new URLSearchParams();

            if (petShare?.petId && petShare?.petName) {
                const shareToken = typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

                params.set("pet_id", petShare.petId);
                params.set("pet_name", petShare.petName);
                params.set("pet_share_token", shareToken);

                if (petShare.petImageUrl) {
                    params.set("pet_image", petShare.petImageUrl);
                }
            }

            const destination = params.toString()
                ? `/chat/${chat.data.id}?${params.toString()}`
                : `/chat/${chat.data.id}`;

            setChats((prev) => {
                const exists = prev.find((c) => c.id === chat.data.id);
                if (exists) return prev;
                return [chat.data, ...prev];
            });

            router.push(destination);
        } catch (error: any) {
            if (error instanceof AxiosError) {
                const errData = error.response?.data as ErrorResponse;
                toast.error(errData?.message || "Failed to create chat. Please try again later");
                return;
            }

            toast.error("Failed to create chat. Please try again later");
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