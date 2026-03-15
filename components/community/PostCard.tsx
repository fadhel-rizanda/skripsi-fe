import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { Post } from "@/types/post";
import { useSession } from "next-auth/react";
import { ReportDialog } from "@/components/dialog/ReportDialog";
import PostFormDialog from "@/components/dialog/PostFormDialog";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { useState } from "react";
import Image from "next/image";
import { isValidUrl } from "@/lib/utils";
import { postService } from "@/services/postServices";
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
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const safeAttachmentUrl = isValidUrl(post.attachment?.public_url ?? '') ? post.attachment!.public_url : null;

    const handleDelete = async () => {
        await postService.deletePost(post.id);
    };

    return (
        <Card
            className="rounded-2xl border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow p-4 flex flex-col gap-1">
            <div className="flex gap-4">
                {/* Avatar Section */}
                <div className="shrink-0">
                    <Avatar className="h-10 w-10 border border-gray-300">
                        <AvatarImage src={post.created_by.avatar || undefined} alt={post.created_by.name} />
                        <AvatarFallback>{post.created_by.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm md:text-base">{post.created_by.name}</span>
                            <span className="text-base text-gray-500">• {formatRelativeTime(post.created_at)}</span>
                        </div>
                        {post.created_by.id === session?.user.id && (
                            <>
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

                    {/* Body */}
                    <Link href={`/community/all-post/${post.id}`}
                        className="block hover:opacity-80 transition-opacity mb-3">
                        {post.title && (
                            <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1">{post.title}</h3>
                        )}
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base line-clamp-3">
                            {post.content}
                        </p>
                    </Link>

                    {/* Attachment Image */}
                    {safeAttachmentUrl && (
                        <Link href={`/community/all-post/${post.id}`} className="block mb-3 mr-12">
                            <div
                                className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                <Image
                                    src={safeAttachmentUrl}
                                    alt={post.title || "Post attachment"}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </Link>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {post.tags.map(tag => (
                                <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="bg-green-50 text-green-700 hover:bg-green-100 text-base font-normal"
                                    style={{ backgroundColor: tag.color_code ? `${tag.color_code}20` : undefined }}
                                >
                                    #{tag.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap items-center pt-3 border-t border-gray-300">
                <div className="flex flex-wrap gap-4 md:gap-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`text-gray-900 hover:text-green-600 hover:bg-green-50 gap-1.5 px-2 -ml-2 ${post.is_liked ? 'text-green-600 bg-green-50' : ''}`}
                        onClick={() => onLike(post.id)}
                    >
                        <ThumbsUp className="h-6 w-6" />
                        <span className="text-base font-medium">
                            {post.likes_count} {post.likes_count === 1 ? "Like" : "Likes"}
                        </span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-gray-900 hover:text-blue-600 hover:bg-blue-50 gap-1.5 px-2"
                    >
                        <Link href={`/community/all-post/${post.id}?comment=1#comments`}>
                            <MessageSquare className="h-6 w-6" />
                            <span className="text-base font-medium">{post.comments_count} Comments</span>
                        </Link>
                    </Button>
                    <ReportDialog
                        referenceType="post"
                        referenceId={post.id}
                    />
                </div>
            </div>
        </Card>
    );
}