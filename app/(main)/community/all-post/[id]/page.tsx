"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    ThumbsUp,
    MessageSquare,
    Flag,
    Loader2,
    Send
} from "lucide-react";

import { postService, Post, Comment } from "@/services/postServices";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function PostDetailPage() {
    const params = useParams();
    const postId = params.id as string;

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    // Fetch post detail and comments
    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                setLoading(true);
                setError(null);

                const postData = await postService.getPostById(postId);
                setPost(postData);

                // Fetch comments
                const commentsData = await postService.getComments(postId);
                setComments(commentsData);
            } catch (err: any) {
                console.error("Error fetching post detail:", err);
                setError(err.response?.data?.message || "Failed to fetch post detail");
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPostDetail();
        }
    }, [postId]);

    // Format date to relative time
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

    // Handle comment submission
    const handleSubmitComment = async () => {
        if (!commentText.trim()) return;

        try {
            setSubmittingComment(true);
            await postService.createComment(postId, { content: commentText });
            setCommentText("");

            // Refresh comments
            const updatedComments = await postService.getComments(postId);
            setComments(updatedComments);

            // Also refresh post to update comment count
            const updatedPost = await postService.getPostById(postId);
            setPost(updatedPost);
        } catch (err) {
            console.error("Error submitting comment:", err);
        } finally {
            setSubmittingComment(false);
        }
    };

    // Handle like post
    const handleLikePost = async () => {
        try {
            await postService.likePost(postId);
            // Refresh post data to update like count
            const updatedPost = await postService.getPostById(postId);
            setPost(updatedPost);
        } catch (err) {
            console.error("Error liking post:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8 font-sans flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8 font-sans">
                <div className="max-w-6xl mx-auto">
                    <Card className="rounded-2xl border-0 shadow-sm">
                        <CardContent className="p-8 text-center">
                            <p className="text-red-600 font-medium">{error || "Post not found"}</p>
                            <Link href="/community/all-post">
                                <Button className="mt-4 bg-[#19E619] hover:bg-green-500 text-black">
                                    Back to Community
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Back Button */}
                <Link href="/community/all-post">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Community
                    </Button>
                </Link>

                {/* Post Detail Card */}
                <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
                    <CardHeader className="p-4 md:p-6 flex flex-row items-start gap-3 space-y-0">
                        <Avatar className="h-12 w-12 border border-gray-100">
                            <AvatarImage src={post.created_by.avatar || undefined} alt={post.created_by.name} />
                            <AvatarFallback>{post.created_by.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-gray-900 text-base">{post.created_by.name}</span>
                                    <span className="text-sm text-gray-500 ml-2">• {formatRelativeTime(post.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                        {post.title && (
                            <h1 className="font-bold text-gray-900 text-xl md:text-2xl">{post.title}</h1>
                        )}
                        <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                            {post.content}
                        </p>
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
                    </CardContent>
                    <CardFooter className="p-4 md:p-6 bg-gray-50/50 flex justify-between items-center border-t border-gray-100">
                        <div className="flex gap-4 md:gap-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-green-600 hover:bg-green-50 gap-1.5 px-2"
                                onClick={handleLikePost}
                            >
                                <ThumbsUp className="h-4 w-4" />
                                <span className="text-sm font-medium">{post.likes_count} Likes</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 gap-1.5 px-2">
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-sm font-medium">{post.comments_count} Comments</span>
                            </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600 hover:bg-red-50 gap-1.5 px-2">
                            <Flag className="h-4 w-4" />
                            <span className="text-sm font-medium">Report</span>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Comments Section */}
                <Card className="rounded-2xl border-0 shadow-sm">
                    <CardHeader className="p-4 md:p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Comments ({comments.length})</h2>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4">
                        {/* Add Comment */}
                        <div className="flex gap-3">
                            <Avatar className="h-10 w-10 border border-gray-100">
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Textarea
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="min-h-[80px] resize-none border-gray-200 focus-visible:ring-green-500"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSubmitComment}
                                        disabled={!commentText.trim() || submittingComment}
                                        className="bg-[#19E619] hover:bg-green-500 text-black font-semibold"
                                    >
                                        {submittingComment ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Comment
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        {comments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No comments yet. Be the first to comment!
                            </div>
                        ) : (
                            <div className="space-y-4 mt-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                                        <Avatar className="h-10 w-10 border border-gray-100">
                                            <AvatarImage src={comment.created_by.avatar || undefined} alt={comment.created_by.name} />
                                            <AvatarFallback>{comment.created_by.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900 text-sm">{comment.created_by.name}</span>
                                                <span className="text-xs text-gray-500">• {formatRelativeTime(comment.created_at)}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
