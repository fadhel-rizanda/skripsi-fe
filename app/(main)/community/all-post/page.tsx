"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PostFilters } from "@/components/filter/AllPostFilters";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { postService, Post, PostListParams } from "@/services/postServices";
import { generalService, Tag } from "@/services/generalServices";

import { Card, CardContent } from "@/components/ui/card";
import { PostCard } from "@/components/community/PostCard";

export default function AllPostPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterTag, setFilterTag] = useState("all");
    const [animalTypes, setAnimalTypes] = useState<Tag[]>([]);

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    });

    // Fetch animal types
    useEffect(() => {
        const fetchAnimalTypes = async () => {
            try {
                const types = await generalService.getAnimalTypes();
                setAnimalTypes(types);
            } catch (error) {
                console.error("Failed to load animal tags:", error);
            }
        };
        fetchAnimalTypes();
    }, []);

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
                    params.sort_direction = "desc";
                } else if (sortBy === "oldest") {
                    params.sort_by = "created_at";
                    params.sort_direction = "asc";
                } else if (sortBy === "popular") {
                    params.sort_by = "popular";
                    params.sort_direction = "desc";
                }

                // Add search query
                if (searchQuery) {
                    params.search = searchQuery;
                }

                // Add tag filter
                if (filterTag !== "all") {
                    const selectedTag = animalTypes.find(t => t.name === filterTag);
                    if (selectedTag) {
                        params.tag_id = selectedTag.id;
                    }
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
    }, [searchQuery, sortBy, filterTag, pagination.current_page, pagination.per_page, animalTypes]);

    const handleLikePost = async (postId: string) => {
        try {
            const response: { status: boolean | 'success'; message: string } = await postService.likePost(postId);
            if (response.status === true || response.status === 'success') {
                setPosts(currentPosts => currentPosts.map(post => {
                    if (post.id === postId) {
                        // Check message to determine if liked or unliked
                        // Backend returns "Post liked successfully." or "Post unliked successfully."
                        const isLiked = response.message.toLowerCase().includes('liked') && !response.message.toLowerCase().includes('unliked');
                        return {
                            ...post,
                            likes_count: isLiked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1)
                        };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    // Use posts directly since filtering is now done on backend
    const filteredPosts = posts;

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
        <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8 font-[family-name:var(--font-manrope)]">
            <div className="max-w-4xl mx-auto space-y-6">

                <CommunityHeader>
                    <PostFilters
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        filterTag={filterTag}
                        setFilterTag={setFilterTag}
                        animalTypes={animalTypes}
                    />
                </CommunityHeader>

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
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onLike={handleLikePost}
                                    formatRelativeTime={formatRelativeTime}
                                />
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
