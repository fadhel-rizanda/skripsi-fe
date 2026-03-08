"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ThumbsUp, MessageSquare, Pencil, Trash2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PaginationBar } from "@/components/pagination/PaginationBar";

import { postService } from "@/services/postServices";
import { commentService, Comment } from "@/services/commentService";

type CommentRepliesState = {
    replies: Comment[];
    loading: boolean;
    loaded: boolean;
    expanded: boolean;
    hasMore: boolean;
    page: number;
    total: number;
};
import { Post } from "@/types/post";
import { isValidUrl } from "@/lib/utils";

import PostFormDialog from "@/components/dialog/PostFormDialog";
import CommentFormDialog from "@/components/dialog/CommentFormDialog";
import { ReportDialog } from "@/components/dialog/ReportDialog";
import { ActionDialog } from "@/components/dialog/ActionDialog";

const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

export default function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session } = useSession();

    const [post, setPost] = useState<Post | null>(null);
    const [postLoading, setPostLoading] = useState(true);
    const [postError, setPostError] = useState<string | null>(null);

    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsPagination, setCommentsPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
    });

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [repliesMap, setRepliesMap] = useState<Record<string, CommentRepliesState>>({});

    // Fetch post detail
    const fetchPost = useCallback(async () => {
        try {
            setPostLoading(true);
            setPostError(null);
            const data = await postService.getPostById(id);
            setPost(data);
        } catch (err: any) {
            setPostError(err?.response?.data?.message ?? "Failed to load post.");
        } finally {
            setPostLoading(false);
        }
    }, [id]);

    // Fetch comments
    const fetchComments = useCallback(async (page: number, perPage: number) => {
        try {
            setCommentsLoading(true);
            const data = await commentService.getComments(id, { page, per_page: perPage });
            setComments(data.data);
            setCommentsPagination(prev => ({
                ...prev,
                current_page: data.current_page,
                total: data.total,
            }));
        } catch {
            // silently fail, keep existing comments
        } finally {
            setCommentsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    useEffect(() => {
        fetchComments(commentsPagination.current_page, commentsPagination.per_page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, commentsPagination.current_page, commentsPagination.per_page]);

    const handleLike = async () => {
        if (!post) return;
        try {
            const response: { status: boolean | "success"; message: string } = await postService.likePost(post.id);
            if (response.status === true || response.status === "success") {
                const isLiked =
                    response.message.toLowerCase().includes("liked") &&
                    !response.message.toLowerCase().includes("unliked");
                setPost(prev =>
                    prev
                        ? {
                              ...prev,
                              likes_count: isLiked ? prev.likes_count + 1 : Math.max(0, prev.likes_count - 1),
                              is_liked: isLiked,
                          }
                        : prev
                );
            }
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    const handleDelete = async () => {
        if (!post) return;
        await postService.deletePost(post.id);
    };

    const handleCommentsPageChange = (page: number) => {
        setCommentsPagination(prev => ({ ...prev, current_page: page }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCommentsPerPageChange = (perPage: number) => {
        setCommentsPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
    };

    const loadReplies = useCallback(async (commentId: string, page = 1) => {
        setRepliesMap(prev => ({
            ...prev,
            [commentId]: {
                ...(prev[commentId] ?? { replies: [], loaded: false, hasMore: false, total: 0 }),
                loading: true,
                expanded: true,
                page,
            },
        }));
        try {
            const data = await commentService.getReplies(id, commentId, { page, per_page: 15 });
            const total = data.total ?? (page === 1 ? data.data.length : (repliesMap[commentId]?.total ?? 0));
            setRepliesMap(prev => ({
                ...prev,
                [commentId]: {
                    replies: page === 1 ? data.data : [...(prev[commentId]?.replies ?? []), ...data.data],
                    loading: false,
                    loaded: true,
                    expanded: true,
                    hasMore: data.has_more_pages,
                    page,
                    total,
                },
            }));
            // Keep comments list replies_count in sync
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, replies_count: total } : c
            ));
        } catch {
            setRepliesMap(prev => ({
                ...prev,
                [commentId]: {
                    ...(prev[commentId] ?? { replies: [], loaded: false, hasMore: false, expanded: false, page: 1, total: 0 }),
                    loading: false,
                },
            }));
        }
    }, [id]);

    const toggleReplies = (commentId: string) => {
        const current = repliesMap[commentId];
        if (!current?.loaded) {
            loadReplies(commentId, 1);
        } else {
            setRepliesMap(prev => ({
                ...prev,
                [commentId]: { ...prev[commentId], expanded: !prev[commentId].expanded },
            }));
        }
    };

    const safeAttachmentUrl =
        post && isValidUrl(post.attachment?.public_url ?? "") ? post.attachment!.public_url : null;

    if (postLoading) {
        return (
            <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8">
                <div className="max-w-4xl mx-auto flex justify-center items-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            </div>
        );
    }

    if (postError || !post) {
        return (
            <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/community/all-post" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Community
                    </Link>
                    <Card className="rounded-2xl border-0 shadow-sm p-8 text-center">
                        <p className="text-red-600 font-medium">{postError ?? "Post not found."}</p>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Back link */}
                <Link
                    href="/community/all-post"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Community
                </Link>

                {/* Post Card */}
                <Card className="rounded-2xl border-0 shadow-sm overflow-hidden p-6 flex flex-col gap-3">
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <Avatar className="h-10 w-10 border border-gray-300">
                                <AvatarImage src={post.created_by.avatar || undefined} alt={post.created_by.name} />
                                <AvatarFallback>{post.created_by.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 text-sm md:text-base">
                                        {post.created_by.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        • {formatRelativeTime(post.created_at)}
                                    </span>
                                </div>
                                {post.created_by.id === session?.user?.id && (
                                    <>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-600 hover:text-gray-900"
                                                onClick={() => setEditOpen(true)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setDeleteOpen(true)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <PostFormDialog
                                            mode="edit"
                                            postId={post.id}
                                            open={editOpen}
                                            onOpenChangeAction={setEditOpen}
                                            onSuccessAction={() => {
                                                setEditOpen(false);
                                                fetchPost();
                                            }}
                                        />
                                        <ActionDialog
                                            open={deleteOpen}
                                            onOpenChange={setDeleteOpen}
                                            onConfirm={handleDelete}
                                            onContinue={() => router.push("/community/all-post")}
                                            confirmVariant="destructive"
                                            title="Delete Post"
                                            description="Are you sure you want to delete this post? This action cannot be undone."
                                            successTitle="Post Deleted"
                                            successDescription="Your post has been deleted successfully."
                                        />
                                    </>
                                )}
                            </div>

                            {/* Title & Body */}
                            {post.title && (
                                <h1 className="font-bold text-gray-900 text-xl md:text-2xl mb-2">{post.title}</h1>
                            )}
                            <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
                                {post.content}
                            </p>

                            {/* Attachment Image */}
                            {safeAttachmentUrl && (
                                <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mt-4">
                                    <Image
                                        src={safeAttachmentUrl}
                                        alt={post.title || "Post attachment"}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            )}

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex gap-2 mt-4 flex-wrap">
                                    {post.tags.map(tag => (
                                        <Badge
                                            key={tag.id}
                                            variant="secondary"
                                            className="bg-green-50 text-green-700 hover:bg-green-100 text-sm font-normal"
                                            style={{
                                                backgroundColor: tag.color_code ? `${tag.color_code}20` : undefined,
                                            }}
                                        >
                                            #{tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-300">
                        <div className="flex flex-wrap gap-4 md:gap-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`text-gray-900 hover:text-green-600 hover:bg-green-50 gap-1.5 px-2 -ml-2 ${
                                    post.is_liked ? "text-green-600 bg-green-50" : ""
                                }`}
                                onClick={handleLike}
                            >
                                <ThumbsUp className="h-5 w-5" />
                                <span className="text-base font-medium">
                                    {post.likes_count} {post.likes_count === 1 ? "Like" : "Likes"}
                                </span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-900 gap-1.5 px-2 cursor-default"
                            >
                                <MessageSquare className="h-5 w-5" />
                                <span className="text-base font-medium">
                                    {commentsPagination.total} Comments
                                </span>
                            </Button>
                            <ReportDialog referenceType="post" referenceId={post.id} />
                        </div>
                    </div>
                </Card>

                {/* Comments Section */}
                <Card className="bg-transparent shadow-none border-0 !important">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Comments ({commentsPagination.total})
                    </h2>

                    {/* Add Comment */}
                    <CommentFormDialog
                        postId={post.id}
                        onSuccessAction={() => {
                            setCommentsPagination(prev => ({ ...prev, current_page: 1 }));
                            fetchComments(1, commentsPagination.per_page);
                            fetchPost();
                        }}
                        trigger={
                            <div className="flex gap-3 mb-6 cursor-pointer">
                                <Avatar className="h-9 w-9 border border-gray-300 shrink-0 mt-1">
                                    <AvatarImage src={session?.user?.avatar || undefined} alt={session?.user?.name || ""} />
                                    <AvatarFallback>
                                        {session?.user?.name?.substring(0, 2).toUpperCase() ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors">
                                    <div className="px-4 pt-3 pb-2">
                                        <p className="text-gray-400 text-sm min-h-12">Add a comment...</p>
                                    </div>
                                    <div className="flex justify-end px-4 pb-3 border-t border-gray-100 pt-2">
                                        <span className="text-sm font-bold text-gray-800">Comment</span>
                                    </div>
                                </div>
                            </div>
                        }
                    />

                    {/* Comments List */}
                    {commentsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">
                            No comments yet. Be the first to comment!
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {comments.map(comment => {
                                const repState = repliesMap[comment.id];
                                const hasReplies = (comment.replies_count ?? 0) > 0 || (repState?.replies.length ?? 0) > 0;
                                return (
                                    <div key={comment.id} className="space-y-2">
                                        {/* Comment row */}
                                        <div className="flex gap-3">
                                            <Avatar className="h-9 w-9 border border-gray-300 shrink-0">
                                                <AvatarImage
                                                    src={comment.created_by.avatar || undefined}
                                                    alt={comment.created_by.name}
                                                />
                                                <AvatarFallback>
                                                    {comment.created_by.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900 text-sm">
                                                        {comment.created_by.name}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        • {formatRelativeTime(comment.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                                    {comment.content}
                                                </p>
                                                <div className="mt-2 flex items-center gap-3">
                                                    <CommentFormDialog
                                                        postId={post.id}
                                                        parentId={comment.id}
                                                        userName={comment.created_by.name}
                                                        onSuccessAction={() => {
                                                            // Optimistically bump the count before re-fetch
                                                            setComments(prev => prev.map(c =>
                                                                c.id === comment.id
                                                                    ? { ...c, replies_count: (c.replies_count ?? 0) + 1 }
                                                                    : c
                                                            ));
                                                            loadReplies(comment.id, 1);
                                                            fetchPost();
                                                        }}
                                                    />
                                                    {hasReplies && (
                                                        <button
                                                            onClick={() => toggleReplies(comment.id)}
                                                            className="text-xs text-green-700 font-medium hover:underline"
                                                        >
                                                            {repState?.expanded
                                                                ? "Hide replies"
                                                                : (() => {
                                                                    const count = repState?.total ?? comment.replies_count ?? repState?.replies.length ?? 0;
                                                                    return `View ${count} ${count === 1 ? "reply" : "replies"}`;
                                                                })()}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nested replies */}
                                        {repState?.expanded && (
                                            <div className="ml-12 space-y-2">
                                                {repState.loading && repState.replies.length === 0 && (
                                                    <div className="flex justify-center py-3">
                                                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                                    </div>
                                                )}
                                                {repState.replies.map(reply => (
                                                    <div key={reply.id} className="flex gap-3">
                                                        <Avatar className="h-8 w-8 border border-gray-300 shrink-0">
                                                            <AvatarImage
                                                                src={reply.created_by.avatar || undefined}
                                                                alt={reply.created_by.name}
                                                            />
                                                            <AvatarFallback>
                                                                {reply.created_by.name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold text-gray-900 text-sm">
                                                                    {reply.created_by.name}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    • {formatRelativeTime(reply.created_at)}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                                                {reply.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {repState.hasMore && (
                                                    <button
                                                        onClick={() => loadReplies(comment.id, repState.page + 1)}
                                                        className="flex items-center gap-1.5 text-xs text-green-700 font-medium hover:underline pl-1"
                                                        disabled={repState.loading}
                                                    >
                                                        {repState.loading
                                                            ? <><Loader2 className="h-3 w-3 animate-spin" /> Loading...</>
                                                            : "Load more replies"}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Comments Pagination */}
                    {commentsPagination.total > 0 && (
                        <div className="mt-6">
                            <PaginationBar
                                current_page={commentsPagination.current_page}
                                total={commentsPagination.total}
                                per_page={commentsPagination.per_page}
                                onPageChange={handleCommentsPageChange}
                                onDataPerPageChange={handleCommentsPerPageChange}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
