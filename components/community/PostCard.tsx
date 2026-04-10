import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ThumbsUp, MessageSquare, X } from "lucide-react";
import { Post } from "@/types/post";
import { useSession } from "next-auth/react";
import { ReportDialog } from "@/components/dialog/ReportDialog";
import PostFormDialog from "@/components/dialog/PostFormDialog";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { useState } from "react";
import Image from "next/image";
import { isValidUrl } from "@/lib/utils";
import { postService } from "@/services/postServices";
import { usePathname, useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";

interface PostCardProps {
    post: Post;
    onLike: (postId: string) => void;
    onRefresh?: () => void;
    formatRelativeTime: (dateString: string) => string;
}

export function PostCard({ post, onLike, onRefresh, formatRelativeTime }: PostCardProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const safeAttachmentUrl = isValidUrl(post.attachment?.public_url ?? '') ? post.attachment!.public_url : null;
    const authorProfileHref = `/profile/${post.created_by.id}`;
    const postCommentHref = `/explore/posts/${post.id}?comment=1#comments`;

    const redirectToLogin = (callbackUrl?: string) => {
        const targetUrl = callbackUrl ?? pathname ?? "/explore/posts";
        router.push(`/login?callbackUrl=${encodeURIComponent(targetUrl)}`);
    };

    const withAuth = (callback: () => void, callbackUrl?: string) => {
        return () => {
            if (!session?.user?.id) {
                redirectToLogin(callbackUrl);
                return;
            }
            callback();
        };
    };

    const handleLikeClick = withAuth(() => onLike(post.id));
    const handleCommentClick = withAuth(() => router.push(postCommentHref), postCommentHref);
    const handleReportClick = withAuth(
        () => redirectToLogin(`/explore/posts/${post.id}`),
        `/explore/posts/${post.id}`
    );

    const handleDelete = async () => {
        await postService.deletePost(post.id);
    };

    return (
        <>
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow px-4 pt-4 pb-3 flex flex-col gap-3">

                {/* ── Profile Row ── full width, avatar sejajar dengan nama & waktu */}
                <div className="flex items-center justify-between gap-2">
                    <Link
                        href={authorProfileHref}
                        className="flex items-center gap-2.5 group min-w-0"
                    >
                        <Avatar className="h-9 w-9 shrink-0 border border-gray-200 transition-shadow duration-200 group-hover:ring-2 group-hover:ring-green-200 group-hover:ring-offset-1">
                            <AvatarImage src={post.created_by.avatar || undefined} alt={post.created_by.name} />
                            <AvatarFallback>{post.created_by.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight truncate group-hover:underline">
                                {post.created_by.name}
                            </span>
                            <span className="text-[11px] text-gray-400 leading-tight">
                                {formatRelativeTime(post.created_at)}
                            </span>
                        </div>
                    </Link>

                    {post.created_by.id === session?.user.id && (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-gray-700 shrink-0"
                                    >
                                        <Icon icon="lucide:ellipsis-vertical" className="h-4 w-4" />
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
                                        <Icon icon="lucide:trash-2" className="h-4 w-4 mr-2" />
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
                                    onRefresh?.();
                                }}
                            />
                            <ActionDialog
                                open={deleteOpen}
                                onOpenChange={setDeleteOpen}
                                onConfirm={handleDelete}
                                onContinue={() => onRefresh?.()}
                                confirmVariant="destructive"
                                title="Delete Post"
                                description="Are you sure you want to delete this post? This action cannot be undone."
                                successTitle="Post Deleted"
                                successDescription="Your post has been deleted successfully."
                            />
                        </>
                    )}
                </div>

                {/* ── Post Body ── full width, sejajar dengan batas kiri card */}
                <Link href={`/explore/posts/${post.id}`} className="block hover:opacity-80 transition-opacity">
                    {post.title && (
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-1 break-words whitespace-normal leading-snug">
                            {post.title}
                        </h3>
                    )}
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm line-clamp-3 break-words whitespace-normal">
                        {post.content}
                    </p>
                </Link>

                {/* ── Attachment Image ── full width, tidak terpotong */}
                {safeAttachmentUrl && (
                    <div
                        className="w-full rounded-xl border border-gray-100 bg-gray-50 cursor-zoom-in overflow-hidden flex items-center justify-center"
                        onClick={() => setLightboxOpen(true)}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={safeAttachmentUrl}
                            alt={post.title || "Post attachment"}
                            className="w-full max-h-72 object-contain hover:scale-[1.02] transition-transform duration-300"
                        />
                    </div>
                )}

                {/* ── Tags ── */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {post.tags.map(tag => (
                            <Badge
                                key={tag.id}
                                variant="secondary"
                                className="bg-green-50 text-green-700 hover:bg-green-100 text-xs font-normal"
                                style={{ backgroundColor: tag.color_code ? `${tag.color_code}20` : undefined }}
                            >
                                #{tag.name}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* ── Action Bar ── */}
                <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`text-gray-600 hover:text-green-600 hover:bg-green-50 gap-1.5 px-2 -ml-2 h-8 ${post.is_liked ? 'text-green-600 bg-green-50' : ''}`}
                        onClick={handleLikeClick}
                    >
                        <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-xs font-medium">
                            {post.likes_count} {post.likes_count === 1 ? "Like" : "Likes"}
                        </span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 gap-1.5 px-2 h-8"
                        onClick={handleCommentClick}
                    >
                        <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-xs font-medium">{post.comments_count} Comments</span>
                    </Button>
                    {session?.user?.id ? (
                        <ReportDialog 
                            referenceType="post" 
                            referenceId={post.id} 
                            trigger={
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600 hover:bg-red-50 gap-1.5 px-2 h-8">
                                    <Icon icon="lucide:flag" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="text-xs font-medium">Report</span>
                                </Button>
                            }
                        />
                    ) : (
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600 hover:bg-red-50 gap-1.5 px-2 h-8" onClick={handleReportClick}>
                            <Icon icon="lucide:flag" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="text-xs font-medium">Report</span>
                        </Button>
                    )}
                </div>
            </Card>

            {/* ── Lightbox ── */}
            {lightboxOpen && safeAttachmentUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                        aria-label="Close image"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div
                        className="relative max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={safeAttachmentUrl}
                            alt={post.title || "Post attachment"}
                            width={1200}
                            height={900}
                            className="w-full h-auto object-contain max-h-[85vh] rounded-xl"
                            priority
                        />
                    </div>
                </div>
            )}
        </>
    );
}