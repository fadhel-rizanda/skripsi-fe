"use client";

import {useEffect, useState, useRef, useCallback} from "react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Icon} from "@iconify/react";
import {chatService} from "@/services/chatServices";
import {Chat, Message} from "@/types/chat";
import {Skeleton} from "@/components/ui/skeleton";
import {Input} from "@/components/ui/input";
import {attachmentService} from "@/services/attachmentServices";
import {toast} from "sonner";
import {SendMessageSchema} from "@/schemas/chat.schema";
import {PresignedUrlSchema} from "@/schemas/attachment.schema";
import {useSession} from "next-auth/react";
import {clsx} from "clsx";
import Image from "next/image";
import {isValidUrl} from "@/lib/utils";
import {Attachment} from "@/types/attachment";
import {getEcho} from "@/lib/echo";

export default function ChatWindow({chat}: { chat: Chat }) {
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

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);

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
            toast.error("Failed to load more messages");
        } finally {
            setLoadingMore(false);
        }
    }, [chat?.id, cursor, hasMore, loadingMore]);

    const handleSendMessage = async () => {
        if (!content.trim() && !file) return;

        setIsSending(true);
        let attachmentId: string | null = null;

        try {
            if (file) {
                const attachmentPayload = {
                    filename: file.name,
                    mime_type: file.type,
                    file_size: file.size,
                    is_public: false,
                };
                const attachmentValidation = PresignedUrlSchema.safeParse(attachmentPayload);
                if (!attachmentValidation.success) {
                    console.error(attachmentValidation.error.issues);
                    return;
                }
                const presignedResponse = await attachmentService.getPresignedUrl(attachmentValidation.data);
                const {id, upload_url} = presignedResponse.data;

                await attachmentService.uploadToS3(upload_url, file);
                await attachmentService.confirmUpload(id);

                attachmentId = id;
            }

            const messagePayload = {
                content: content,
                attachment_id: attachmentId,
            };
            const messageValidation = SendMessageSchema.safeParse(messagePayload);
            if (!messageValidation.success) {
                console.error(messageValidation.error.issues);
                return;
            }
            const response = await chatService.sendMessage(chat?.id, messageValidation.data);

            setMessages((prev) => [...prev, response.data]);
            shouldAutoScrollRef.current = true;

            setContent("");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (error) {
            console.error("Failed to send message", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const handleDownload = async (attachment: Attachment) => {
        try {
            toast.info("Preparing download...");

            const { download_url } = await attachmentService.generateDownloadUrl(attachment.id);
            const blob = await attachmentService.downloadFromS3(download_url, attachment.mime_type, (pct) => {
                console.log(`Downloading: ${pct}%`);
            });

            const blobUrl = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', attachment.filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            toast.success("Download started!");
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download file.");
        }
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

                // console.log('📨 Initial messages loaded:', {
                //     count: messagesData.length,
                //     cursor: response.data.next_cursor,
                //     hasMore: response.data.has_more
                // });

                setMessages(messagesData);
                setCursor(response.data.next_cursor);
                setHasMore(response.data.has_more);
                shouldAutoScrollRef.current = true;
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages().then(r => r);
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
    }, [loadMore, hasMore, loadingMore, cursor]);

    useEffect(() => {
        if (!session?.accessToken || !chat?.id) return;

        const echo = getEcho(session.accessToken);
        if (!echo) return;

        const channelName = `chat.${chat.id}`;

        echo.private(channelName)
            .listen(".message.sent", (response: any) => {
                const newMessage = response.data;

                setMessages((prev) => {
                    if (prev.some(m => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });

                shouldAutoScrollRef.current = true;
            });

        return () => {
            echo.leave(channelName);
        };
    }, [chat?.id, session?.accessToken]);

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-[#F9FAFB]">
                <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full"/>
                    <Skeleton className="h-4 w-32"/>
                </div>
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
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
                <div className="bg-white border-t px-6 py-4 flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded-2xl"/>
                    <Skeleton className="h-10 w-10 rounded-full"/>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#F9FAFB]">
            <div className="bg-white border-b px-6 py-4 font-semibold flex items-center gap-3 text-gray-800">
                <Avatar className="h-8 w-8">
                    {chat.users[0]?.avatar && isValidUrl(chat.users[0].avatar) ? (
                        <Image
                            src={chat.users[0].avatar}
                            alt={chat.name || "Chat Avatar"}
                            fill
                            priority
                            className="rounded-full object-cover"
                            sizes="32px"
                            onError={(e) => {
                                console.error("Image failed to load:", chat.users[0].avatar);
                            }}
                        />
                    ) : (
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                            {chat?.name?.[0] || "U"}
                        </AvatarFallback>
                    )}
                </Avatar>
                <span>{chat.name}</span>
            </div>

            <div ref={scrollRef} className="flex-1 p-6 space-y-5 overflow-y-auto bg-[#E9F2E9]">
                {loadingMore && (
                    <div className="text-center text-[11px] text-gray-400 py-2">
                        Loading more messages...
                    </div>
                )}
                {messages.map((m) => {
                    const isMe = m.sender.id === currentUser?.id;

                    return (
                        <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div className={`ml-12 flex items-center gap-2 mb-1 text-[11px] text-gray-500 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <span className="font-semibold text-gray-700">
                                    {isMe ? "You" : m.sender.name}
                                </span>
                                <span>
                                    {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                </span>
                            </div>

                            <div className={`flex gap-3 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <div className="flex items-end">
                                    <Avatar className="h-9 w-9 shrink-0 shadow-sm border border-white">
                                        {m.sender.avatar && isValidUrl(m.sender.avatar) ? (
                                            <Image
                                                src={m.sender.avatar}
                                                alt={chat.name || "Message Avatar"}
                                                fill
                                                priority
                                                className="rounded-full object-cover"
                                                sizes="32px"
                                                onError={(e) => {
                                                    console.error("Image failed to load:", chat.users[0].avatar);
                                                }}
                                            />
                                        ) : (
                                            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                                {m.sender.name[0]}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                </div>

                                <div className="flex flex-col">
                                    <div className={clsx(
                                        "px-3 py-2 rounded-lg text-xs shadow-sm leading-relaxed",
                                        isMe
                                            ? "bg-[#22C55E] text-white rounded-tr-none"
                                            : "bg-white text-gray-700 rounded-tl-none"
                                    )}>
                                        <p className="whitespace-pre-wrap wrap-break-word">{m.content}</p>
                                        {m.attachment && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={clsx(
                                                    "mt-1 p-2 rounded-lg flex items-center gap-2 text-xs transition-all hover:bg-black/10",
                                                    isMe ? "bg-white/20 text-white border-white/30" : "bg-gray-100 text-gray-700 border-gray-200"
                                                )}
                                                onClick={() => handleDownload(m.attachment as Attachment)}
                                            >
                                                <Icon icon="ph:file-arrow-down" className="w-4 h-4"/>
                                                <span className="truncate font-medium max-w-37.5">
                                                    {m.attachment.filename}
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white border-t px-6 py-4 flex flex-col gap-2">
                {file && (
                    <div className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md flex items-center justify-between">
                        <span>📎 {file.name}</span>
                        <button onClick={() => setFile(null)} className="text-red-500 font-bold">x</button>
                    </div>
                )}

                <div className="flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        disabled={isSending}
                        className="rounded-full focus-visible:ring-emerald-500 focus-visible:ring-2"
                    />

                    <div className="flex items-center gap-2">
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
                            className={`rounded-full shrink-0 ${file ? "border-emerald-500 text-emerald-500" : ""}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Icon icon="ph:paperclip-horizontal" className="w-6 h-6 rotate-90"/>
                        </Button>
                    </div>

                    <Button
                        onClick={handleSendMessage}
                        disabled={isSending || (!content.trim() && !file)}
                        className="rounded-full bg-emerald-500 hover:bg-emerald-600 px-6"
                    >
                        Send
                        <Icon icon="ph:paper-plane-right" className="ml-2 w-4 h-4"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}