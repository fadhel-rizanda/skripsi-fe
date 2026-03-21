"use client"

import {useEffect, useRef} from "react"
import { useSession } from "next-auth/react"
import { getEcho } from "@/lib/echo"
import { toast } from "sonner"
import { Icon } from "@iconify/react"
import { Channel } from "@/types";
import { usePathname } from "next/navigation";
import {useChatStore} from "@/store/useChatStore";
import { useNotificationStore } from "@/store/useNotificationStore"
import {useAdoptionStore} from "@/store/useAdoptionStore";

// TODO Fix reassign channel saat adopt dan segala macam create
export const CHANNEL_ICON_MAP: Record<string, string> = {
    notification: "ph:bell",
    chat: "ph:chat-circle",
    community: "ph:users-three",
    adoption: "ph:paw-print",
    'requirement': "ph:files",
    'handover': "ph:package",
    'meetngreet': "ph:users",
}

export function useNotificationToast() {
    const { data: session } = useSession()
    const pathname = usePathname();
    const pathnameRef = useRef(pathname);
    const currentUserIdRef = useRef(session?.user?.id);

    const { triggerRefresh } = useChatStore();
    const { setHasUnread } = useNotificationStore();
    const {
        triggerAdoptionRefresh,
        triggerMeetNGreetRefresh,
        triggerReviewRefresh,
        triggerHandoverRefresh,
    } = useAdoptionStore();

    const storeActionsRef = useRef({
        triggerRefresh,
        setHasUnread,
        triggerAdoptionRefresh,
        triggerMeetNGreetRefresh,
        triggerReviewRefresh,
        triggerHandoverRefresh,
    });

    useEffect(() => { pathnameRef.current = pathname; }, [pathname]);
    useEffect(() => { currentUserIdRef.current = session?.user?.id; }, [session?.user?.id]);
    useEffect(() => {
        storeActionsRef.current = {
            triggerRefresh, setHasUnread,
            triggerAdoptionRefresh, triggerMeetNGreetRefresh,
            triggerReviewRefresh, triggerHandoverRefresh,
        };
    });

    const adoptionRefreshMap = {
        'meetngreet': 'triggerMeetNGreetRefresh',
        'requirement': 'triggerReviewRefresh',
        'handover': 'triggerHandoverRefresh',
        'adoption': 'triggerAdoptionRefresh',
    }

    const channelsKey = JSON.stringify(session?.user?.channels ?? []);

    useEffect(() => {
        if (!session?.accessToken) return
        if (!Array.isArray(session.user?.channels) || session.user.channels.length === 0) return

        const echo = getEcho(session.accessToken)
        if (!echo) return

        const subscriptions: { channelName: string; eventName: string }[] = []

        session.user.channels.forEach(({ name: channelName, event: eventName }: Channel) => {
            if (!channelName || !eventName) return

            echo.private(channelName)
                .subscribed(() => console.log("Subscribed:", channelName))
                .error((error: any) => console.error("Error:", channelName, error))
                .listen(`.${eventName}`, (data: any) => {
                    const messageData = data.data;
                    if (!messageData) return;

                    const actions = storeActionsRef.current;
                    const refreshKey = adoptionRefreshMap[messageData.reference_type as keyof typeof adoptionRefreshMap];
                    if (refreshKey) {
                        const actionFunc = (storeActionsRef.current as any)[refreshKey];
                        if (typeof actionFunc === 'function') actionFunc();
                    }

                    actions.setHasUnread(true);

                    if (messageData.sender?.id === currentUserIdRef.current) return;

                    if (messageData.chat_id) {
                        actions.triggerRefresh();
                        if (pathnameRef.current.includes(messageData.chat_id)) return;
                    }

                    const iconName = CHANNEL_ICON_MAP[messageData.reference_type];
                    toast(messageData.sender?.name || messageData.title || "New Message", {
                        description: messageData.content || messageData.message || "Sent an attachment",
                        duration: 5000,
                        icon: iconName ? <Icon icon={iconName} className="opacity-50 h-4 w-4" /> : undefined,
                    });
                });

            subscriptions.push({ channelName, eventName });
        })

        return () => {
            subscriptions.forEach(({ channelName, eventName }) => {
                echo.private(channelName).stopListening(`.${eventName}`)
                echo.leave(`private-${channelName}`)
            })
        }
    }, [session?.accessToken, channelsKey])
}