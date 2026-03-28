"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
type DeleteTarget =
  | { type: "comment"; commentId: string }
  | { type: "reply"; commentId: string; replyId: string }
  | null;
import { Post } from "@/types/post";
import { formatRelativeTime, isValidUrl } from "@/lib/utils";

import PostFormDialog from "@/components/dialog/PostFormDialog";
import CommentFormDialog from "@/components/dialog/CommentFormDialog";
import { ReportDialog } from "@/components/dialog/ReportDialog";
import { ActionDialog } from "@/components/dialog/ActionDialog";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const postDetailPath = `/explore/posts/${id}`;
  const commentTargetPath = `${postDetailPath}?comment=1#comments`;

  const redirectToLogin = (callbackUrl?: string) => {
    const targetUrl = callbackUrl ?? postDetailPath;
    router.push(`/login?callbackUrl=${encodeURIComponent(targetUrl)}`);
  };

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
  const [addCommentOpen, setAddCommentOpen] = useState(false);
  const [commentIntentHandled, setCommentIntentHandled] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [repliesMap, setRepliesMap] = useState<
    Record<string, CommentRepliesState>
  >({});
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const shouldOpenComment = searchParams.get("comment") === "1";

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
  const fetchComments = useCallback(
    async (page: number, perPage: number) => {
      try {
        setCommentsLoading(true);
        const data = await commentService.getComments(id, {
          page,
          per_page: perPage,
        });
        setComments(data.data);
        setCommentsPagination((prev) => ({
          ...prev,
          current_page: data.current_page,
          total: data.total,
        }));
      } catch {
        // silently fail, keep existing comments
      } finally {
        setCommentsLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    setCommentIntentHandled(false);
  }, [id]);

    useEffect(() => {
    fetchComments(commentsPagination.current_page, commentsPagination.per_page);
  }, [fetchComments, commentsPagination.current_page, commentsPagination.per_page]);

  useEffect(() => {
    if (postLoading || !shouldOpenComment || commentIntentHandled) return;

    if (!session?.user?.id) {
      setCommentIntentHandled(true);
      redirectToLogin(commentTargetPath);
      return;
    }

    setCommentIntentHandled(true);
    setAddCommentOpen(true);
    requestAnimationFrame(() => {
      commentsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [
    postLoading,
    shouldOpenComment,
    commentIntentHandled,
    session?.user?.id,
    commentTargetPath,
  ]);

  const handleAddCommentClick = () => {
    if (!session?.user?.id) {
      redirectToLogin(commentTargetPath);
      return;
    }

    setAddCommentOpen(true);
  };

  const handleReportClick = () => {
    if (!session?.user?.id) {
      redirectToLogin(postDetailPath);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    if (!session?.user?.id) {
      redirectToLogin(postDetailPath);
      return;
    }

    try {
      const response: { status: boolean | "success"; message: string } =
        await postService.likePost(post.id);
      if (response.status === true || response.status === "success") {
        const isLiked =
          response.message.toLowerCase().includes("liked") &&
          !response.message.toLowerCase().includes("unliked");
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likes_count: isLiked
                  ? prev.likes_count + 1
                  : Math.max(0, prev.likes_count - 1),
                is_liked: isLiked,
              }
            : prev,
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

  const handleDeleteComment = async (commentId: string) => {
    if (!post) throw new Error("Post not found");
    await commentService.deleteComment(post.id, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentsPagination((prev) => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
    }));
    setRepliesMap((prev) => {
      const next = { ...prev };
      delete next[commentId];
      return next;
    });
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!post) return;
    try {
      await commentService.deleteComment(post.id, replyId);
      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          replies: prev[commentId].replies.filter((r) => r.id !== replyId),
          total: Math.max(0, prev[commentId].total - 1),
        },
      }));
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies_count: Math.max(0, (c.replies_count ?? 0) - 1) }
            : c,
        ),
      );
    } catch (error) {
      console.error("Failed to delete reply:", error);
    }
  };

  const handleCommentsPageChange = (page: number) => {
    setCommentsPagination((prev) => ({ ...prev, current_page: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCommentsPerPageChange = (perPage: number) => {
    setCommentsPagination((prev) => ({
      ...prev,
      per_page: perPage,
      current_page: 1,
    }));
  };

  const loadReplies = useCallback(
    async (commentId: string, page = 1) => {
      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: {
          ...(prev[commentId] ?? {
            replies: [],
            loaded: false,
            hasMore: false,
            total: 0,
          }),
          loading: true,
          expanded: true,
          page,
        },
      }));
      try {
        const data = await commentService.getReplies(id, commentId, {
          page,
          per_page: 15,
        });
        const total =
          data.total ??
          (page === 1 ? data.data.length : (repliesMap[commentId]?.total ?? 0));
        setRepliesMap((prev) => ({
          ...prev,
          [commentId]: {
            replies:
              page === 1
                ? data.data
                : [...(prev[commentId]?.replies ?? []), ...data.data],
            loading: false,
            loaded: true,
            expanded: true,
            hasMore: data.has_more_pages,
            page,
            total,
          },
        }));
        // Keep comments list replies_count in sync
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, replies_count: total } : c,
          ),
        );
      } catch {
        setRepliesMap((prev) => ({
          ...prev,
          [commentId]: {
            ...(prev[commentId] ?? {
              replies: [],
              loaded: false,
              hasMore: false,
              expanded: false,
              page: 1,
              total: 0,
            }),
            loading: false,
          },
        }));
      }
    },
    [id],
  );

  const toggleReplies = (commentId: string) => {
    const current = repliesMap[commentId];
    if (!current?.loaded) {
      loadReplies(commentId, 1);
    } else {
      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          expanded: !prev[commentId].expanded,
        },
      }));
    }
  };

  const renderDeleteMenu = (
    label: string,
    onDelete: () => void,
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-500 hover:text-gray-900"
        >
          <Icon icon="lucide:ellipsis-vertical" className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 text-sm"
          onClick={onDelete}
        >
          <Icon icon="lucide:trash-2" className="h-4 w-4 mr-2 text-black" />
          {label}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const deleteDialogLabel =
    deleteTarget?.type === "reply" ? "Reply" : "Comment";

  const safeAttachmentUrl =
    post && isValidUrl(post.attachment?.public_url ?? "")
      ? post.attachment!.public_url
      : null;

  if (postLoading) {
    return (
      <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex justify-center items-center py-24">
          <Icon
            icon="lucide:loader-2"
            className="h-8 w-8 animate-spin text-green-600"
          />
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/explore/posts"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium"
          >
            <Icon icon="lucide:arrow-left" className="h-4 w-4" />
            Back to Community
          </Link>
          <Card className="rounded-2xl border-0 shadow-sm p-8 text-center">
            <p className="text-red-600 font-medium">
              {postError ?? "Post not found."}
            </p>
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
          href="/explore/posts"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-md font-semibold w-fit"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Back to Community
        </Link>

        {/* Post Card */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden p-6 flex flex-col gap-3">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              <Link
                href={`/profile/${post.created_by.id}`}
                className="group block rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
              >
                <Avatar className="h-10 w-10 border border-gray-300 transition-shadow duration-200 group-hover:ring-2 group-hover:ring-green-200 group-hover:ring-offset-1">
                  <AvatarImage
                    src={post.created_by.avatar || undefined}
                    alt={post.created_by.name}
                  />
                  <AvatarFallback>
                    {post.created_by.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${post.created_by.id}`}
                    className="font-bold text-gray-900 text-sm md:text-base hover:underline"
                  >
                    {post.created_by.name}
                  </Link>
                  <span className="text-sm text-gray-500">
                    • {formatRelativeTime(post.created_at)}
                  </span>
                </div>
                {post.created_by.id === session?.user?.id && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        >
                          <Icon
                            icon="lucide:ellipsis-vertical"
                            className="h-4 w-4"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                          <Icon icon="lucide:pencil" className="h-4 w-4 mr-2" />
                          Update post
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteOpen(true)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Icon
                            icon="lucide:trash-2"
                            className="h-4 w-4 mr-2 text-black"
                          />
                          Delete post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                      onContinue={() => router.push("/explore/posts")}
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
                <h1 className="font-bold text-gray-900 text-xl md:text-2xl mb-2">
                  {post.title}
                </h1>
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
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="bg-green-50 text-green-700 hover:bg-green-100 text-sm font-normal"
                      style={{
                        backgroundColor: tag.color_code
                          ? `${tag.color_code}20`
                          : undefined,
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
                <Icon icon="lucide:thumbs-up" className="h-5 w-5" />
                <span className="text-base font-medium">
                  {post.likes_count} {post.likes_count === 1 ? "Like" : "Likes"}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-900 gap-1.5 px-2 cursor-pointer hover:text-green-600 hover:bg-green-50"
                onClick={handleAddCommentClick}
              >
                <Icon icon="lucide:message-square" className="h-5 w-5" />
                <span className="text-base font-medium">
                  {commentsPagination.total} Comments
                </span>
              </Button>
              {session?.user?.id ? (
                <ReportDialog referenceType="post" referenceId={post.id} />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 gap-1.5 px-2"
                  onClick={handleReportClick}
                >
                  <Icon icon="lucide:flag" className="h-5 w-5" />
                  <span className="text-base font-medium">Report</span>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <Card
          id="comments"
          ref={commentsSectionRef}
          className="bg-transparent shadow-none border-0"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Comments ({commentsPagination.total})
            </h2>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white text-md font-semibold rounded-xl p-6"
              onClick={handleAddCommentClick}
            >
              <Icon icon="lucide:plus" className="h-4 w-4" />
              Add a comment
            </Button>
          </div>

          {/* Add Comment */}
          <CommentFormDialog
            postId={post.id}
            open={addCommentOpen}
            onOpenChange={setAddCommentOpen}
            autoFocus={shouldOpenComment}
            onSuccessAction={() => {
              setCommentsPagination((prev) => ({ ...prev, current_page: 1 }));
              fetchComments(1, commentsPagination.per_page);
              fetchPost();
            }}
          />
          <ActionDialog
            open={!!deleteTarget}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            onConfirm={async () => {
              if (!deleteTarget) return;
              if (deleteTarget.type === "comment") {
                await handleDeleteComment(deleteTarget.commentId);
                return;
              }
              await handleDeleteReply(
                deleteTarget.commentId,
                deleteTarget.replyId,
              );
            }}
            confirmVariant="destructive"
            title={`Delete ${deleteDialogLabel}`}
            description={`Are you sure you want to delete this ${deleteDialogLabel.toLowerCase()}? This action cannot be undone.`}
            successTitle={`${deleteDialogLabel} Deleted`}
            successDescription={`Your ${deleteDialogLabel.toLowerCase()} has been deleted successfully.`}
          />

          {/* Comments List */}
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Icon
                icon="lucide:loader-2"
                className="h-6 w-6 animate-spin text-green-600"
              />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const repState = repliesMap[comment.id];
                const hasReplies =
                  (comment.replies_count ?? 0) > 0 ||
                  (repState?.replies.length ?? 0) > 0;
                return (
                  <div key={comment.id} className="space-y-2">
                    {/* Comment row */}
                    <div className="flex gap-3">
                      <Link
                        href={`/profile/${comment.created_by.id}`}
                        className="group shrink-0 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                      >
                        <Avatar className="h-9 w-9 border border-gray-300 shrink-0 transition-shadow duration-200 group-hover:ring-2 group-hover:ring-green-200 group-hover:ring-offset-1">
                          <AvatarImage
                            src={comment.created_by.avatar || undefined}
                            alt={comment.created_by.name}
                          />
                          <AvatarFallback>
                            {comment.created_by.name
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profile/${comment.created_by.id}`}
                              className="font-semibold text-gray-900 text-sm hover:underline"
                            >
                              {comment.created_by.name}
                            </Link>
                            <span className="text-xs text-gray-400">
                              • {formatRelativeTime(comment.created_at)}
                            </span>
                          </div>
                          {comment.created_by.id === session?.user?.id && (
                            renderDeleteMenu("Delete comment", () => {
                              setDeleteTarget({
                                type: "comment",
                                commentId: comment.id,
                              });
                            })
                          )}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {comment.content}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          {session?.user?.id ? (
                            <CommentFormDialog
                              postId={post.id}
                              parentId={comment.id}
                              userName={comment.created_by.name}
                              onSuccessAction={() => {
                                // Optimistically bump the count before re-fetch
                                setComments((prev) =>
                                  prev.map((c) =>
                                    c.id === comment.id
                                      ? {
                                          ...c,
                                          replies_count:
                                            (c.replies_count ?? 0) + 1,
                                        }
                                      : c,
                                  ),
                                );
                                loadReplies(comment.id, 1);
                                fetchPost();
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => redirectToLogin(commentTargetPath)}
                              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#19E619] transition-colors"
                            >
                              <Icon icon="lucide:message-square-reply" className="h-4 w-4" />
                              Reply
                            </button>
                          )}
                          {hasReplies && (
                            <button
                              onClick={() => toggleReplies(comment.id)}
                              className="text-xs text-green-700 font-medium hover:underline"
                            >
                              {repState?.expanded
                                ? "Hide replies"
                                : (() => {
                                    const count =
                                      repState?.total ??
                                      comment.replies_count ??
                                      repState?.replies.length ??
                                      0;
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
                            <Icon
                              icon="lucide:loader-2"
                              className="h-4 w-4 animate-spin text-green-600"
                            />
                          </div>
                        )}
                        {repState.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Link
                              href={`/profile/${reply.created_by.id}`}
                              className="group shrink-0 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                            >
                              <Avatar className="h-8 w-8 border border-gray-300 shrink-0 transition-shadow duration-200 group-hover:ring-2 group-hover:ring-green-200 group-hover:ring-offset-1">
                                <AvatarImage
                                  src={reply.created_by.avatar || undefined}
                                  alt={reply.created_by.name}
                                />
                                <AvatarFallback>
                                  {reply.created_by.name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/profile/${reply.created_by.id}`}
                                    className="font-semibold text-gray-900 text-sm hover:underline"
                                  >
                                    {reply.created_by.name}
                                  </Link>
                                  <span className="text-xs text-gray-400">
                                    • {formatRelativeTime(reply.created_at)}
                                  </span>
                                </div>
                                {reply.created_by.id === session?.user?.id && (
                                  renderDeleteMenu("Delete reply", () => {
                                    setDeleteTarget({
                                      type: "reply",
                                      commentId: comment.id,
                                      replyId: reply.id,
                                    });
                                  })
                                )}
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                        {repState.hasMore && (
                          <button
                            onClick={() =>
                              loadReplies(comment.id, repState.page + 1)
                            }
                            className="flex items-center gap-1.5 text-xs text-green-700 font-medium hover:underline pl-1"
                            disabled={repState.loading}
                          >
                            {repState.loading ? (
                              <>
                                <Icon
                                  icon="lucide:loader-2"
                                  className="h-3 w-3 animate-spin"
                                />{" "}
                                Loading...
                              </>
                            ) : (
                              "Load more replies"
                            )}
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
