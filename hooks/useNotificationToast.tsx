"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { getEcho } from "@/lib/echo"
import { toast } from "sonner"
import { Icon } from "@iconify/react"
import { Channel } from "@/types";
import { usePathname } from "next/navigation";
import {useChatStore} from "@/store/useChatStore";
import { useNotificationStore } from "@/store/useNotificationStore"
import {useAdoptionStore} from "@/store/useAdoptionStore";

export const CHANNEL_ICON_MAP: Record<string, string> = {
    notification: "ph:bell",
    chat: "ph:chat-circle",
    community: "ph:users-three",
    adoption: "ph:paw-print",
    'adoption.requirement': "ph:files",
    'adoption.handover': "ph:package",
    'adoption.meetngreet': "ph:users",
}

const adoptionTypes = [
    'adoption',
    'adoption.requirement',
    'adoption.handover',
    'adoption.meetngreet'
];

export function useNotificationToast() {
    const { data: session } = useSession()
    const pathname = usePathname();
    const currentUserId = session?.user?.id;
    const { triggerRefresh } = useChatStore();
    const { setHasUnread } = useNotificationStore()
    const { triggerAdoptionRefresh } = useAdoptionStore();

    useEffect(() => {
        if (!session?.accessToken) return
        if (!Array.isArray(session.user?.channels) || session.user.channels.length === 0) return

        const echo = getEcho(session.accessToken)
        if (!echo) return

        const subscriptions: { channelName: string; eventName: string }[] = []

        session.user.channels.forEach(({ name: channelName, event: eventName }: Channel) => {
            if (!channelName || !eventName) return

            const channel = echo.private(channelName)

            channel.listen(`.${eventName}`, (data: any) => {
                const messageData = data.data;

                if (adoptionTypes.includes(messageData.reference_type)) {
                    triggerAdoptionRefresh();
                }

                setHasUnread(true)
                if (!messageData) return;
                if (messageData.sender?.id === currentUserId) return;
                if (messageData.chat_id) {
                    triggerRefresh();
                    const isCurrentlyInThisChat = pathname.includes(messageData.chat_id);

                    if (isCurrentlyInThisChat) return;
                }
                const iconName = CHANNEL_ICON_MAP[messageData.reference_type]

                toast(messageData.sender?.name || "New Message", {
                    description: messageData.content || "Sent an attachment",
                    duration: 5000,
                    icon: iconName ? <Icon icon={iconName} className="opacity-50 h-4 w-4" /> : undefined,
                });
            });

            subscriptions.push({ channelName, eventName })
        })

        return () => {
            subscriptions.forEach(({ channelName, eventName }) => {
                echo.private(channelName).stopListening(`.${eventName}`)
                echo.leave(`private-${channelName}`)
            })
        }
    }, [session?.accessToken, session?.user.channels, pathname, currentUserId, triggerRefresh, setHasUnread, triggerAdoptionRefresh])
}