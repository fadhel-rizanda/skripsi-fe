"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { getEcho } from "@/lib/echo"
import {Channel} from "@/types";
import {Notification} from "@/types/notification";

export default function NotificationPage() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const processedIds = useRef<Set<string>>(new Set())

    useEffect(() => {
        if (!session?.accessToken || !session.user?.channels) return

        const echo = getEcho(session.accessToken)
        if (!echo) return

        const subscriptions: { channelName: string; eventName: string }[] = []

        session.user.channels.forEach(({ name: channelName, event: eventName }: Channel) => {
            if (!channelName || !eventName) return

            const channel = echo.private(channelName)

            channel.listen(`.${eventName}`, (data: Notification) => {
                console.log("Received:", data)

                if (!data.id) return // skip if no id
                if (processedIds.current.has(data.id)) {
                    console.log("Duplicate notification ignored:", data.id)
                    return
                }

                processedIds.current.add(data.id)
                setNotifications((prev) => [data, ...prev])
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

    if (!session) return <p>Loading...</p>

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            {notifications.length === 0 ? (
                <p className="text-gray-500">No notifications yet</p>
            ) : (
                <ul className="space-y-2">
                    {notifications.map((notif) => (
                        <li
                            key={notif.id}
                            className="border p-3 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
                        >
                            <p className="font-semibold text-lg">{notif.title || "Notification"}</p>
                            <p className="text-gray-700">{notif.message || JSON.stringify(notif)}</p>
                            <p className="text-xs text-gray-400 mt-2">
                                {notif.created_at
                                    ? new Date(notif.created_at).toLocaleString()
                                    : "Just now"}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
