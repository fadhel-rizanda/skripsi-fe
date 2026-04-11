"use client"

import {ReactNode, useState, useEffect, useMemo} from "react"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Icon} from "@iconify/react"
import ChatForm from "@/components/form/ChatForm"
import {Chat} from "@/types/chat"
import {UserDetail, UserProfile} from "@/types"
import {useSession} from "next-auth/react"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {useChatStore} from "@/store/useChatStore"
import {cn} from "@/lib/utils"

type Props = {
    trigger?: ReactNode
    mode?: "create" | "detail"
    chat?: Chat
    users?: UserDetail[]
    disabled?: boolean
    onSuccessAction?: () => void
}

const getCreatorId = (createdBy: UserProfile | string | undefined): string | null => {
    if (!createdBy) return null
    return typeof createdBy === "string" ? createdBy : createdBy.id
}

export default function ChatFormDialog({
                                           trigger,
                                           mode = "create",
                                           chat: chatProp,
                                           users = [],
                                           disabled = false,
                                           onSuccessAction,
                                       }: Props) {
    const [open, setOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [localChat, setLocalChat] = useState<Chat | undefined>(chatProp)
    const {data: session} = useSession()
    const currentUserId = session?.user?.id
    const {chats, triggerRefresh} = useChatStore()

    useEffect(() => {
        if (!chatProp?.id) return
        const updated = chats.find(c => c.id === chatProp.id)
        if (updated) setLocalChat(updated)
    }, [chats, chatProp?.id])

    useEffect(() => {
        setLocalChat(chatProp)
    }, [chatProp])

    const creatorId = getCreatorId(localChat?.created_by)
    const userIds = localChat?.users?.map(u => u.id) ?? localChat?.user_ids ?? []
    const isCreator = mode === "detail" && !!creatorId && currentUserId === creatorId && !disabled

    useEffect(() => {
        if (!open) setIsEditMode(false)
    }, [open])

    const usersMap = useMemo(() => {
        const map = new Map(users.map(u => [u.id, u.name ?? u.email]))
        localChat?.users?.forEach(u => {
            if (!map.has(u.id)) map.set(u.id, u.name ?? u.id)
        })
        return map
    }, [users, localChat?.users])

    const renderDetailView = () => {
        if (!localChat) return null

        return (
            <div className="space-y-6 mt-4">
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Chat Name</h3>
                    <p className="text-lg font-semibold">{localChat.name}</p>
                </div>

                <Separator/>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="text-sm">
                        {localChat.description || (
                            <span className="text-muted-foreground italic">No description</span>
                        )}
                    </p>
                </div>

                <Separator/>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                    <Badge variant={localChat.type === "public" ? "default" : "secondary"} className="capitalize">
                        {localChat.type}
                    </Badge>
                </div>

                <Separator/>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Members ({userIds.length})
                    </h3>
                    <div className="space-y-2">
                        {userIds.map(userId => {
                            const user = localChat.users?.find(u => u.id === userId)
                            const isActiveMember = user?.is_active_member !== false

                            return (
                                <div
                                    key={userId}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-lg transition-colors",
                                        isActiveMember
                                            ? "bg-slate-50 hover:bg-slate-100"
                                            : "bg-slate-50 opacity-50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
                                        isActiveMember ? "bg-emerald-500" : "bg-slate-400"
                                    )}>
                                        {(usersMap.get(userId) || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            !isActiveMember && "line-through text-slate-400"
                                        )}>
                                            {usersMap.get(userId) || userId}
                                        </p>
                                    </div>
                                    {userId === creatorId && (
                                        <Badge variant="outline" className="text-xs">
                                            Creator
                                        </Badge>
                                    )}
                                    {!isActiveMember && (
                                        <Badge variant="secondary" className="text-xs text-slate-400">
                                            Left
                                        </Badge>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {(localChat.created_at || localChat.updated_at) && (
                    <>
                        <Separator/>
                        <div className="space-y-2 text-xs text-muted-foreground">
                            {localChat.created_at &&
                                <p>Created: {new Date(localChat.created_at).toLocaleString()}</p>}
                            {localChat.updated_at &&
                                <p>Last updated: {new Date(localChat.updated_at).toLocaleString()}</p>}
                        </div>
                    </>
                )}

                {!isCreator && (
                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground text-center">
                            {disabled
                                ? "This conversation is no longer active"
                                : "Only the creator can edit this chat"
                            }
                        </p>
                    </div>
                )}

                {isCreator && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditMode(true)}
                            className="gap-2"
                        >
                            <Icon icon="ph:pencil-simple" className="w-4 h-4"/>
                            Edit
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button type="button" variant="outline" size="sm">
                        <Icon icon={mode === "create" ? "ph:plus" : "ph:info"} className="w-6 h-6"/>
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold mb-4">
                        {mode === "create"
                            ? "Create Chat"
                            : isEditMode
                                ? "Edit Chat"
                                : "Chat Details"}
                    </DialogTitle>
                </DialogHeader>

                {mode === "create" || (mode === "detail" && isEditMode) ? (
                    <ChatForm
                        mode={mode === "create" ? "create" : "update"}
                        chat={localChat}
                        onSuccessAction={() => {
                            triggerRefresh()
                            if (mode === "detail") {
                                setIsEditMode(false)
                            } else {
                                setOpen(false)
                            }
                            onSuccessAction?.()
                        }}
                        onCancel={() => {
                            if (mode === "detail") {
                                setIsEditMode(false)
                            } else {
                                setOpen(false)
                            }
                        }}
                    />
                ) : (
                    renderDetailView()
                )}
            </DialogContent>
        </Dialog>
    )
}