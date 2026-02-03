"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { getEcho } from "@/lib/echo"
import { toast } from "sonner"
import { Icon } from "@iconify/react"
import {Channel} from "@/types";
import {Notification} from "@/types/notification";

const CHANNEL_ICON_MAP: Record<string, string> = {
    notification: "ph:bell",
    chat: "ph:chat-circle",
    community: "ph:users",
    adoption: "ph:heart",
}

export function useNotificationToast() {
    const { data: session } = useSession()

    useEffect(() => {
        if (!session?.accessToken) return
        if (!Array.isArray(session.user?.channels) || session.user.channels.length === 0) return

        const echo = getEcho(session.accessToken)
        if (!echo) return

        const subscriptions: { channelName: string; eventName: string }[] = []

        session.user.channels.forEach(({ name: channelName, event: eventName }: Channel) => {
            if (!channelName || !eventName) return

            const channel = echo.private(channelName)

            channel.listen(`.${eventName}`, (data: Notification) => {
                const iconName = CHANNEL_ICON_MAP[data.reference_by]

                toast(data.title || "Notification", {
                    description: data.message || "",
                    duration: 5000,
                    icon: iconName ? <Icon icon={iconName} className="opacity-50 h-4 w-4" /> : undefined,
                })
            })

            subscriptions.push({ channelName, eventName })
        })

        return () => {
            subscriptions.forEach(({ channelName, eventName }) => {
                echo.private(channelName).stopListening(`.${eventName}`)
                echo.leave(`private-${channelName}`)
            })
        }
    }, [session?.accessToken, session?.user?.channels])
}
