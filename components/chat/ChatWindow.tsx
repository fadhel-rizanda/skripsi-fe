"use client";

import {useEffect, useState, useRef, useCallback, memo} from "react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Icon} from "@iconify/react";
import {chatService} from "@/services/chatServices";
import {Chat, Message} from "@/types/chat";
import {Skeleton} from "@/components/ui/skeleton";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {SendMessageSchema} from "@/schemas/chat.schema";
import {useSession} from "next-auth/react";
import {clsx} from "clsx";
import Image from "next/image";
import {isValidUrl} from "@/lib/utils";
import {Attachment} from "@/types/attachment";
import {getEcho} from "@/lib/echo";
import {downloadAttachment, uploadAttachment} from "@/lib/attachment-helpers";
import {AxiosError} from "axios";
import {ErrorResponse} from "@/types";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {ActionDialog} from "@/components/dialog/ActionDialog";
import {useChatStore} from "@/store/useChatStore";
import ChatFormDialog from "@/components/dialog/ChatFormDialog";
import Link from "next/link";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {createPetShareMessage, parsePetShareMessage} from "@/lib/chat-pet-share";

function MessageContent({content}: { content: string }) {
    const petShare = parsePetShareMessage(content);

    if (!petShare) {
        return (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {content}
            </p>
        );
    }

    return (
        <Link href={`/pets/${petShare.petId}`} className="block group">
            <div className={clsx(
                "overflow-hidden rounded-2xl border transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md",
                "border-gray-200 bg-white hover:border-gray-300"
            )}>
                <div className={clsx(
                    "flex items-center justify-between gap-2.5 px-3.5 py-2.5",
                    "border-b border-gray-100"
                )}>
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-gray-500">
                            Pet profile
                        </p>
                        <p className={clsx(
                            "mt-0.5 text-[13px] font-semibold truncate",
                            "text-gray-900"
                        )}>
                            {petShare.petName}
                        </p>
                    </div>

                    <div className={clsx(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        "bg-gray-100 text-gray-700"
                    )}>
                        <Icon icon="ph:arrow-up-right" className="h-3.5 w-3.5" />
                    </div>
                </div>

                {petShare.petImageUrl && isValidUrl(petShare.petImageUrl) && (
                    <div className="px-3.5 pb-3.5">
                        <div className="relative h-20 w-full overflow-hidden rounded-xl bg-gray-50">
                            <Image
                                src={petShare.petImageUrl}
                                alt={petShare.petName}
                                fill
                                className="object-contain p-1.5"
                                sizes="(max-width: 768px) 80vw, 320px"
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between gap-2.5 px-3.5 py-2.5">
                    <p className={clsx(
                        "text-[11px] leading-relaxed",
                        "text-gray-600"
                    )}>
                        Tap to open pet details and continue the conversation.
                    </p>
                    <span className={clsx(
                        "shrink-0 text-[10px] font-semibold",
                        "text-gray-700"
                    )}>
                        View
                    </span>
                </div>
            </div>
        </Link>
    );
}

function ChatWindow({chat, onBack}: { chat: Chat; onBack?: () => void; }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const {data: session} = useSession();
    const currentUser = session?.user;

    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [content, setContent] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);

    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<string>("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);
    const processedPetShareKeyRef = useRef<string | null>(null);
    const isChatDisabled = chat.active_member_count < 2;
    const { triggerRefresh } = useChatStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const petShareFromQuery = useCallback(() => {
        const petId = searchParams.get("pet_id")?.trim();
        const petName = searchParams.get("pet_name")?.trim();
        const petImageUrl = searchParams.get("pet_image")?.trim();
        const petShareToken = searchParams.get("pet_share_token")?.trim();

        if (!petId || !petName) {
            return null;
        }

        return {
            petId,
            petName,
            petImageUrl: petImageUrl || undefined,
            petShareToken: petShareToken || undefined,
        };
    }, [searchParams]);

    const clearPetShareParams = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("pet_id");
        params.delete("pet_name");
        params.delete("pet_image");
        params.delete("pet_share_token");

        const nextQuery = params.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {scroll: false});
    }, [pathname, router, searchParams]);
    const isDirectPrivate = chat.type === "private" && chat.users[0].name === chat.name;

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !cursor) return;

        setLoadingMore(true);
        const container = scrollRef.current;
        if (!container) {
            setLoadingMore(false);
            return;
        }

        const prevHeight = container.scrollHeight;
        const prevScrollTop = container.scrollTop;

        try {
            const res = await chatService.getMessages(chat?.id, cursor);

            setMessages(prev => {
                const existingIds = new Set(prev.map(m => m.id));
                const newMessages = res.data.messages.filter(
                    (m: Message) => !existingIds.has(m.id)
                );
                return [...newMessages, ...prev];
            });

            setCursor(res.data.next_cursor);
            setHasMore(res.data.has_more);

            requestAnimationFrame(() => {
                const newHeight = container.scrollHeight;
                container.scrollTop = prevScrollTop + (newHeight - prevHeight);
            });

        } catch (error) {
            console.error("Failed to load more messages:", error);
            if (error instanceof AxiosError) {
                const errData = error.response?.data as ErrorResponse;
                toast.error(errData?.message || "Failed to load more messages");
            }
        } finally {
            setLoadingMore(false);
        }
    }, [chat?.id, cursor, hasMore, loadingMore]);

    const handleSendMessage = async () => {
        if (!content.trim() && !file) return;

        setIsSending(true);

        try {
            let attachmentId: string | null = null;

            if (file) {
                attachmentId = await uploadAttachment(file);
            }

            const messagePayload = {
                content,
                attachment_id: attachmentId,
            };

            const messageValidation = SendMessageSchema.safeParse(messagePayload);

            if (!messageValidation.success) {
                toast.error(messageValidation.error.issues[0]?.message);
                return;
            }

            const response = await chatService.sendMessage(
                chat?.id,
                messageValidation.data
            );

            setMessages((prev) => [...prev, response.data]);
            shouldAutoScrollRef.current = true;

            setContent("");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (error: unknown) {
            console.error("Failed to send message", error);
            if (error instanceof AxiosError) {
                const errData = error.response?.data as ErrorResponse;
                toast.error(errData?.message || "Failed to send message");
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleEditMessage = async (messageId: string) => {
        if (!editContent.trim()) {
            toast.error("Message cannot be empty");
            return;
        }

        try {
            await chatService.editMessage(chat.id, messageId, editContent);

            setMessages(prev => prev.map(m =>
                m.id === messageId
                    ? { ...m, content: editContent, updated_at: new Date().toISOString() }
                    : m
            ));

            setEditingMessageId(null);
            setEditContent("");
            toast.success("Message updated");
        } catch (error) {
            console.error("Failed to edit message:", error);
            if (error instanceof AxiosError) {
                const errData = error.response?.data as ErrorResponse;
                toast.error(errData?.message || "Failed to edit message");
            }
        }
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteMessage = async (messageId: string) => {
        setIsDeleting(true);
        try {
            await chatService.deleteMessage(chat.id, messageId);

            setMessages(prev => prev.filter(m => m.id !== messageId));

            setDeleteDialogOpen(false);
            setMessageToDelete(null);
            toast.success("Message deleted");
        } catch (error) {
            console.error("Failed to delete message:", error);
            if (error instanceof AxiosError) {
                const errData = error.response?.data as ErrorResponse;
                toast.error(errData?.message || "Failed to delete message");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const [deleteChatDialogOpen, setDeleteChatDialogOpen] = useState(false);

    const handleDeleteChat = async () => {
        await chatService.deleteChat(chat.id);
    };

    const handleDownload = async (attachment: Attachment) => {
        try {
            toast.info("Preparing download...");

            await downloadAttachment(attachment, (pct) => {
                console.log(`Downloading: ${pct}%`);
            });

            toast.success("Download started!");
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download file.");
        }
    };

    const canModifyMessage = (createdAt: string | Date, limitMinutes: number) => {
        if (!createdAt) return false;
        const createdTime = new Date(createdAt).getTime();
        const now = Date.now();
        const diffMinutes = (now - createdTime) / (1000 * 60);
        return diffMinutes <= limitMinutes;
    };

    useEffect(() => {
        if (!scrollRef.current || !shouldAutoScrollRef.current) return;

        const container = scrollRef.current;
        container.scrollTop = container.scrollHeight;
        shouldAutoScrollRef.current = false;
    }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!chat?.id) return;
            setLoading(true);
            try {
                const response = await chatService.getMessages(chat?.id);
                const messagesData = response.data.messages || [];

                setMessages(messagesData);
                setCursor(response.data.next_cursor);
                setHasMore(response.data.has_more);
                shouldAutoScrollRef.current = true;
            } catch (error) {
                console.error("Failed to fetch messages:", error);
                toast.error("Failed to load messages. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [chat?.id]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onScroll = () => {
            const nearTop = el.scrollTop < 100;

            if (nearTop && hasMore && !loadingMore) {
                loadMore();
            }
        };

        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, [loadMore, hasMore, loadingMore]);

    useEffect(() => {
        if (!session?.accessToken || !chat?.id) return;

        const echo = getEcho(session.accessToken);
        if (!echo) return;

        const channelName = `chat.${chat.id}`;

        echo.private(channelName)
            .listen('.message.sent', (response: any) => {
                const event = response as {
                    type?: string;
                    data?: Record<string, unknown>;
                };
                const {type, data} = event;

                switch (type) {
                    case 'message.sent':
                        if (!data || typeof data.id !== "string") return;

                        const sentMessage = data as unknown as Message;

                        setMessages((prev) => {
                            if (prev.some(m => m.id === sentMessage.id)) return prev;
                            return [...prev, sentMessage];
                        });
                        shouldAutoScrollRef.current = true;
                        break;

                    case 'message.updated':
                        if (!data || typeof data.id !== "string" || typeof data.content !== "string" || typeof data.updated_at !== "string") return;

                        const updatedMessageId = data.id;
                        const updatedContent = data.content;
                        const updatedAt = data.updated_at;

                        setMessages(prev =>
                            prev.map(m =>
                                m.id === updatedMessageId
                                    ? {
                                        ...m,
                                        content: updatedContent,
                                        updated_at: updatedAt
                                    }
                                    : m
                            )
                        );
                        break;

                    case 'message.deleted':
                        if (!data || typeof data.id !== "string") return;

                        const deletedMessageId = data.id;

                        setMessages(prev => prev.filter(m => m.id !== deletedMessageId));
                        break;

                    default:
                        console.warn("Unknown message type:", type);
                        break;
                }
            });

        return () => {
            echo.leave(`private-${channelName}`);
        };
    }, [chat?.id, session?.accessToken]);

    useEffect(() => {
        const petShare = petShareFromQuery();
        if (!petShare || isChatDisabled || loading) return;

        const processKey = `${chat.id}:${petShare.petId}:${petShare.petShareToken ?? "default"}`;
        if (processedPetShareKeyRef.current === processKey) {
            return;
        }

        processedPetShareKeyRef.current = processKey;

        const sharePet = async () => {
            try {
                const content = createPetShareMessage({
                    petId: petShare.petId,
                    petName: petShare.petName,
                    petImageUrl: petShare.petImageUrl,
                });
                const parsedPayload = SendMessageSchema.safeParse({
                    content,
                    attachment_id: null,
                });

                if (!parsedPayload.success) {
                    toast.error(parsedPayload.error.issues[0]?.message || "Failed to share pet details");
                    return;
                }

                const response = await chatService.sendMessage(chat.id, parsedPayload.data);
                setMessages((prev) => {
                    if (prev.some((message) => message.id === response.data.id)) {
                        return prev;
                    }
                    return [...prev, response.data];
                });
                shouldAutoScrollRef.current = true;
            } catch (error) {
                console.error("Failed to share pet in chat:", error);
                if (error instanceof AxiosError) {
                    const errData = error.response?.data as ErrorResponse;
                    toast.error(errData?.message || "Failed to share pet details");
                }
            } finally {
                clearPetShareParams();
            }
        };

        void sharePet();
    }, [chat.id, clearPetShareParams, isChatDisabled, loading, petShareFromQuery]);

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-[#F9FAFB]">
                <div className="bg-white border-b px-3 md:px-6 py-3 md:py-4 flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full"/>
                    <Skeleton className="h-4 w-32"/>
                </div>
                <div className="flex-1 p-3 md:p-6 space-y-5 md:space-y-6 overflow-y-auto">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0"/>}
                            <div className="flex flex-col space-y-2 w-full max-w-[60%]">
                                <Skeleton
                                    className={`h-16 w-full rounded-2xl ${i % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none"}`}/>
                                <Skeleton className={`h-3 w-12 ${i % 2 === 0 ? "self-end" : "self-start"}`}/>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-white border-t px-3 md:px-6 py-3 md:py-4 flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded-2xl"/>
                    <Skeleton className="h-10 w-10 rounded-full"/>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-full bg-[#F9FAFB]">
                {/* Header */}
                <div className="bg-white border-b px-3 md:px-6 py-3 md:py-4 font-semibold flex items-center justify-between text-gray-800">
                    {/* LEFT SECTION */}
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        {onBack && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={onBack}
                                aria-label="Back to chat list"
                            >
                                <Icon icon="ph:arrow-left" className="w-5 h-5"/>
                            </Button>
                        )}
                        <ChatFormDialog
                            mode="detail"
                            chat={chat}
                            disabled={isChatDisabled}
                            onSuccessAction={triggerRefresh}
                            trigger={
                                <button
                                    type="button"
                                    className="flex items-center gap-2 md:gap-3 min-w-0 hover:opacity-80 transition-opacity"
                                >
                                    <Avatar className="h-8 w-8">
                                        {chat.users[0]?.avatar && isValidUrl(chat.users[0].avatar) ? (
                                            <Image
                                                src={chat.users[0].avatar}
                                                alt={chat.name || "Chat Avatar"}
                                                fill
                                                priority
                                                className="rounded-full object-cover"
                                                sizes="32px"
                                            />
                                        ) : (
                                            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                                {chat?.name?.[0] || "U"}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <span className="truncate">{chat.name}</span>
                                </button>
                            }
                        />
                    </div>

                    {/* RIGHT SECTION */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-gray-900"
                            >
                                <Icon icon="lucide:ellipsis-vertical" className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setDeleteChatDialogOpen(true)}
                            >
                                <Icon icon="lucide:trash-2" className="h-4 w-4 mr-2" />
                                {isChatDisabled ? "Delete Chat" : "Deactivate Chat"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 p-3 md:p-6 space-y-4 overflow-y-auto bg-[#E9F2E9]">
                    {loadingMore && (
                        <div className="text-center text-xs text-gray-400 py-2">
                            Loading more messages...
                        </div>
                    )}
                    {messages.map((m) => {
                        const isMe = m.sender.id === currentUser?.id;

                        return (
                            <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                {/* Header: Name & Time */}
                                <div
                                    className={`flex items-center gap-2 mb-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <span className="text-xs font-semibold text-gray-700">
                                    {isMe ? "You" : m.sender.name}
                                </span>
                                    <span className="text-[11px] text-gray-500">
                                    {new Date(m.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                                    {m.created_at !== m.updated_at && (
                                        <span
                                            className="text-[11px] text-gray-400 italic">(edited)</span>
                                    )}
                                </div>

                                {/* Message Body */}
                                <div className={`flex gap-2 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"} group`}>
                                    {/* Avatar */}
                                    <Avatar className="h-9 w-9 shrink-0 shadow-sm border border-gray-200">
                                        {m.sender.avatar && isValidUrl(m.sender.avatar) ? (
                                            <Image
                                                src={m.sender.avatar}
                                                alt={m.sender.name}
                                                fill
                                                priority
                                                className="rounded-full object-cover"
                                                sizes="36px"
                                                onError={() => {
                                                    console.error("Image failed to load:", m.sender.avatar);
                                                }}
                                            />
                                        ) : (
                                            <AvatarFallback
                                                className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
                                                {m.sender.name[0].toUpperCase()}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>

                                    {/* Message Bubble */}
                                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                                        {editingMessageId === m.id ? (
                                            // Edit Mode
                                            <div
                                                className="px-4 py-2.5 rounded-2xl shadow-sm border-2 border-emerald-500 bg-white">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full text-sm resize-none border-none focus:outline-none focus:ring-0 p-0 bg-transparent text-gray-800"
                                                rows={3}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleEditMessage(m.id);
                                                    }
                                                    if (e.key === 'Escape') {
                                                        setEditingMessageId(null);
                                                        setEditContent("");
                                                    }
                                                }}
                                            />
                                                <div className="flex gap-2 mt-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingMessageId(null);
                                                            setEditContent("");
                                                        }}
                                                        className="h-7 px-3 text-xs"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleEditMessage(m.id)}
                                                        disabled={!editContent.trim()}
                                                        className="h-7 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <div className={clsx(
                                                "px-4 py-2.5 rounded-2xl shadow-sm",
                                                isMe
                                                    ? "bg-white text-gray-800 border border-gray-200 rounded-tr-sm"
                                                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                                            )}>
                                                <MessageContent content={m.content} />

                                                {/* Attachment */}
                                                {m.attachment && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className={clsx(
                                                            "mt-2 w-full justify-start gap-2 h-auto py-2 px-3 rounded-lg transition-colors",
                                                            isMe
                                                                ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                                                                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                                                        )}
                                                        onClick={() => handleDownload(m.attachment as Attachment)}
                                                    >
                                                        <Icon icon="ph:file-arrow-down" className="w-4 h-4 shrink-0"/>
                                                        <span className="truncate text-xs font-medium">
                                                        {m.attachment.filename}
                                                    </span>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Dropdown Menu */}
                                    {editingMessageId !== m.id && isMe && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0"
                                                >
                                                    <Icon icon="lucide:more-vertical" className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                {
                                                    m.content?.trim() &&
                                                    <DropdownMenuItem
                                                        onClick={() => navigator.clipboard.writeText(m.content)}>
                                                        <Icon icon="lucide:copy" className="h-4 w-4 mr-2"/>
                                                        Copy text
                                                    </DropdownMenuItem>
                                                }
                                                {
                                                    m.content?.trim() &&
                                                    canModifyMessage(m.created_at, 10) &&
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditingMessageId(m.id);
                                                            setEditContent(m.content);
                                                        }}
                                                    ><Icon icon="lucide:pencil" className="h-4 w-4 mr-2"/>
                                                        Edit
                                                    </DropdownMenuItem>
                                                }
                                                {
                                                    canModifyMessage(m.created_at, 15) &&
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        onClick={() => {
                                                            setMessageToDelete(m.id);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Icon icon="lucide:trash-2" className="h-4 w-4 mr-2"/>
                                                        Delete
                                                    </DropdownMenuItem>
                                                }
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <div className="bg-white border-t px-3 md:px-6 py-3 md:py-4 flex flex-col gap-2">
                    {isChatDisabled && (
                        <div className="flex items-center gap-2 px-3 py-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                            <Icon icon="ph:warning-circle" className="w-4 h-4 shrink-0" />
                            <span>This conversation is no longer active because the other member has left. Please start a new conversation{isDirectPrivate && ` or reactivate by click "Chat ${chat.name}" button`}.</span>
                        </div>
                    )}
                    {file && (
                        <div
                            className="text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg flex items-center justify-between border border-emerald-200">
                            <div className="flex items-center gap-2">
                                <Icon icon="ph:paperclip" className="w-4 h-4"/>
                                <span className="font-medium truncate">{file.name}</span>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-red-500 hover:text-red-700 font-bold ml-2"
                            >
                                <Icon icon="ph:x" className="w-4 h-4"/>
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            disabled={isSending || isChatDisabled}
                            className="rounded-full focus-visible:ring-emerald-500 focus-visible:ring-2"
                        />

                        <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className={clsx(
                                "rounded-full shrink-0",
                                file && "border-emerald-500 text-emerald-500 bg-emerald-50"
                            )}
                            disabled={isSending || isChatDisabled}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Icon icon="ph:paperclip" className="w-5 h-5"/>
                        </Button>

                        <Button
                            onClick={handleSendMessage}
                            disabled={isSending || (!content.trim() && !file)}
                            className="rounded-full bg-emerald-500 hover:bg-emerald-600 px-4 md:px-6"
                        >
                            <span className="hidden sm:inline">Send</span>
                            <Icon icon="ph:paper-plane-right" className="sm:ml-2 w-4 h-4"/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Message Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Message</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this message? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setMessageToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-500! hover:bg-red-600!"
                            onClick={() => messageToDelete && handleDeleteMessage(messageToDelete)}
                            disabled={!messageToDelete || isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Chat Confirmation Dialog */}
            <ActionDialog
                open={deleteChatDialogOpen}
                onOpenChange={setDeleteChatDialogOpen}
                onConfirm={handleDeleteChat}
                onContinue={() => {
                    onBack?.()
                    triggerRefresh();
                }}
                confirmVariant="destructive"
                title={isChatDisabled ? "Delete Chat" : "Deactivate Chat"}
                description={
                    isChatDisabled
                        ? "The other member is no longer here. Delete this chat record? You won't be able to access ini these messages anymore."
                        : `Deactivate this chat? It will be removed from your inbox${
                            isDirectPrivate
                                ? ", but can be reactivated if there’s a new message—unless the other member deletes it permanently."
                                : "."
                        }`
                }
                successTitle={isChatDisabled ? "Chat Deleted" : "Chat Deactivated"}
                successDescription={isChatDisabled ? "The conversation has been deleted successfully." : "The conversation has been deactivated successfully."}
            />
        </>
    );
}

export default memo(ChatWindow, (prevProps, nextProps) => {
    return (
        prevProps.chat.id === nextProps.chat.id &&
        prevProps.chat.active_member_count === nextProps.chat.active_member_count
    );
});