"use client"

import {Icon} from "@iconify/react"
import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button"
import {notificationService} from "@/services/notificationService"
import {Notification} from "@/types/notification"
import {CHANNEL_ICON_MAP} from "@/hooks/useNotificationToast"
import {formatDistanceToNowStrict} from "date-fns"
import {useNotificationStore} from "@/store/useNotificationStore";
import {getNotificationUrl} from "@/lib/notification-helpers";

export function NotificationDropdown() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [fetchingMore, setFetchingMore] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const {hasUnread, clear} = useNotificationStore()

    useEffect(() => {
        fetchInitial();
    }, [hasUnread]);

    const fetchInitial = async () => {
        if (loading) return;
        try {
            setLoading(true)

            const response = await notificationService.getNotifications({
                page: 1,
                per_page: 10,
            })

            setNotifications(response.data)
            setHasMore(response.has_more_pages)
            setPage(1)
            setUnreadCount(response.unread_count)
            clear()
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        } finally {
            setLoading(false)
        }
    }

    const loadMore = async () => {
        if (!hasMore || fetchingMore) return

        try {
            setFetchingMore(true)

            const nextPage = page + 1

            const response = await notificationService.getNotifications({
                page: nextPage,
                per_page: 10,
            })

            setNotifications(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                const unique = response.data.filter(n => !existingIds.has(n.id));
                return [...prev, ...unique];
            })
            setHasMore(response.has_more_pages)
            setPage(nextPage)
        } catch (error) {
            console.error("Failed to load more notifications", error)
        } finally {
            setFetchingMore(false)
        }
    }

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id)

            setNotifications(prev =>
                prev.map(n =>
                    n.id === id ? {...n, read_at: "SERVER_GENERATED_TIMESTAMP"} : n
                )
            )

            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark as read", error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead()

            setNotifications(prev =>
                prev.map(n =>
                    !n.read_at ? {...n, read_at: "SERVER_GENERATED_TIMESTAMP"} : n
                )
            )

            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark all as read", error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"
                        className="relative focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Icon icon="mdi:bell" className="h-5 w-5"/>

                    {unreadCount > 0 && (
                        <span
                            className="absolute top-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-96" align="end" sideOffset={8} collisionPadding={16} forceMount>
                <DropdownMenuLabel>
                    <div className="flex items-center justify-between">
                        <span>Notifications</span>

                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={unreadCount === 0}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAllAsRead()
                            }}
                            className="h-8 w-8"
                        >
                            <Icon icon="mdi:check-all" className="h-4 w-4"/>
                        </Button>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator/>

                {loading ? (
                    <div className="p-4 text-sm text-center text-gray-500">
                        Loading...
                    </div>
                ) : notifications.length > 0 ? (
                    <div
                        className="max-h-96 overflow-y-auto space-y-1"
                        onScroll={(e) => {
                            const {scrollTop, scrollHeight, clientHeight} = e.currentTarget
                            if (scrollHeight - scrollTop <= clientHeight + 20) {
                                loadMore()
                            }
                        }}
                    >
                        {notifications.map((notif, index) => {
                            const url = getNotificationUrl(notif.reference_type, notif.reference_id);
                            return (
                            <DropdownMenuItem
                                key={`${notif.id}-${index}`}
                                onClick={() => {
                                    if (!notif.read_at) {
                                        handleMarkAsRead(notif.id)
                                    }
                                    if (url) {
                                        router.push(url);
                                    }
                                }}
                                className={`flex items-start gap-3 p-3 ${url ? "cursor-pointer hover:bg-green-50" : "cursor-default"} ${
                                    notif.read_at ? "bg-gray-100" : ""
                                }`}
                            >
                                <div className="relative inline-flex items-center shrink-0 mt-0.5">
                                    <Icon
                                        icon={CHANNEL_ICON_MAP[notif.reference_type] || "ph:bell"}
                                        className="h-6 w-6 opacity-50"
                                    />

                                    {!notif.read_at && (
                                        <span
                                            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"
                                            title="Unread"
                                        />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs sm:text-sm font-medium truncate">{notif.title}</p>

                                        <span className="text-[9px] sm:text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                                    {formatDistanceToNowStrict(new Date(notif.created_at), {
                                        addSuffix: true,
                                    })}
                                  </span>
                                    </div>

                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 line-clamp-2">
                                        {notif.message}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                         );
                        })}

                        {fetchingMore && (
                            <div className="py-3 text-center text-xs text-gray-400">
                                Loading more...
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No notifications
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
