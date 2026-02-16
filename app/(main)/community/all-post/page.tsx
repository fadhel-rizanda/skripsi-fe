"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    MessageSquare,
    ThumbsUp,
    Pencil,
    Flag,
    Loader2
} from "lucide-react";

import { PostFilters } from "@/components/filter/AllPostFilters";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { postService, Post, PostListParams } from "@/services/postServices";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AllPostPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterTag, setFilterTag] = useState("all");

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    });

    // Fetch posts from API
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build query parameters
                const params: PostListParams = {
                    per_page: pagination.per_page,
                    page: pagination.current_page,
                };

                // Map sortBy to API parameter
                if (sortBy === "newest") {
                    params.sort_by = "created_at";
                } else if (sortBy === "oldest") {
                    params.sort_by = "created_at";
                } else if (sortBy === "popular") {
                    params.sort_by = "created_at"; // You might want to add likes_count sorting in BE
                }

                // Add search query
                if (searchQuery) {
                    params.search = searchQuery;
                }

                // Add tag filter (you'll need to get tag_id from tag name)
                if (filterTag !== "all") {
                    // For now, we'll filter on frontend. Ideally, you'd map tag name to tag_id
                    // params.tag_id = tagId;
                }

                const response = await postService.getPosts(params);

                if (!response.error && response.status === "success") {
                    setPosts(response.data);
                    setPagination({
                        current_page: response.current_page,
                        per_page: response.per_page,
                        total: response.total,
                        last_page: Math.ceil(response.total / response.per_page),
                    });
                } else {
                    setError("Failed to fetch posts");
                }
            } catch (err: any) {
                console.error("Error fetching posts:", err);
                setError(err.response?.data?.message || "Failed to fetch posts");
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchPosts();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, sortBy, filterTag, pagination.current_page, pagination.per_page]);

    // Filter posts by tag on frontend (if tag filter is applied)
    const filteredPosts = filterTag === "all"
        ? posts
        : posts.filter(post => post.tags.some(tag => tag.name === filterTag));

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, current_page: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePerPageChange = (perPage: number) => {
        setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
    };

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

    return (
        <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Card */}
                <Card className="rounded-2xl shadow-sm border-0 bg-white">
                    <CardContent className="pt-8 pb-6 px-6 md:px-10 flex flex-col items-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6 font-sans">Community Hub</h1>

                        {/* Tabs */}
                        <div className="flex w-full justify-center border-b border-gray-100 mb-8 overflow-x-auto">
                            <div className="flex gap-8">
                                <Link
                                    href="/community/all-post"
                                    className="pb-3 border-b-2 border-green-600 text-green-700 font-semibold text-sm whitespace-nowrap"
                                >
                                    All Posts
                                </Link>
                                <Link
                                    href="/community/all-communities"
                                    className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 font-medium text-sm whitespace-nowrap transition-colors"
                                >
                                    All Communities
                                </Link>
                                <Link
                                    href="/community/all-users"
                                    className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 font-medium text-sm whitespace-nowrap transition-colors"
                                >
                                    All Users
                                </Link>
                            </div>
                        </div>

                        <p className="text-gray-500 text-center mb-6 text-sm">
                            Connect with fellow pet lovers, share your stories, and get valuable advice.
                        </p>

                        <PostFilters
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            filterTag={filterTag}
                            setFilterTag={setFilterTag}
                        />
                    </CardContent>
                </Card>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <Card className="rounded-2xl border-0 shadow-sm">
                        <CardContent className="p-8 text-center">
                            <p className="text-red-600 font-medium">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Posts List */}
                {!loading && !error && (
                    <div className="space-y-4">
                        {filteredPosts.length === 0 ? (
                            <Card className="rounded-2xl border-0 shadow-sm">
                                <CardContent className="p-8 text-center">
                                    <p className="text-gray-500">No posts found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredPosts.map((post) => (
                                <Card key={post.id} className="rounded-2xl border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <CardHeader className="p-4 pb-2 md:p-6 md:pb-3 flex flex-row items-start gap-3 space-y-0">
                                        <Avatar className="h-10 w-10 border border-gray-100">
                                            <AvatarImage src={post.created_by.avatar || undefined} alt={post.created_by.name} />
                                            <AvatarFallback>{post.created_by.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-sm md:text-base">{post.created_by.name}</span>
                                                    <span className="text-xs text-gray-500">• {formatRelativeTime(post.created_at)}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1 md:p-6 md:pt-2 space-y-3">
                                        <Link href={`/community/all-post/${post.id}`} className="block hover:opacity-80 transition-opacity">
                                            {post.title && (
                                                <h3 className="font-bold text-gray-900 text-base md:text-lg">{post.title}</h3>
                                            )}
                                            <p className="text-gray-700 leading-relaxed text-sm md:text-base line-clamp-3">
                                                {post.content}
                                            </p>
                                        </Link>
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
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
                                    <CardFooter className="p-3 md:p-4 bg-gray-50/50 flex justify-between items-center border-t border-gray-100">
                                        <div className="flex gap-4 md:gap-6">
                                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600 hover:bg-green-50 gap-1.5 px-2">
                                                <ThumbsUp className="h-4 w-4" />
                                                <span className="text-xs md:text-sm font-medium">{post.likes_count} Likes</span>
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 gap-1.5 px-2">
                                                <MessageSquare className="h-4 w-4" />
                                                <span className="text-xs md:text-sm font-medium">{post.comments_count} Comments</span>
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600 hover:bg-red-50 gap-1.5 px-2">
                                                <Flag className="h-4 w-4" />
                                                <span className="text-xs md:text-sm font-medium">Report</span>
                                            </Button>
                                        </div>
                                        <Link href={`/community/all-post/${post.id}`}>
                                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 font-medium text-xs md:text-sm">
                                                Reply
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && filteredPosts.length > 0 && (
                    <PaginationBar
                        current_page={pagination.current_page}
                        total={pagination.total}
                        per_page={pagination.per_page}
                        onPageChange={handlePageChange}
                        onDataPerPageChange={handlePerPageChange}
                        dataPerPageOptions={[10, 15, 25, 50]}
                    />
                )}
            </div>
        </div>
    );
}
