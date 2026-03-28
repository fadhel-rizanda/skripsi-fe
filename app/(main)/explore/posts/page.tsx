"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

import { PostFilters } from "@/components/filter/AllPostFilters";
import { CommunityPageLayout } from "../layout";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { postService, GetPostsParams } from "@/services/postServices";

import { Card, CardContent } from "@/components/ui/card";
import { PostCard } from "@/components/community/PostCard";
import { Post } from "@/types/post";
import PostFormDialog from "@/components/dialog/PostFormDialog";
import { formatRelativeTime } from "@/lib/utils";

export default function AllPostPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterTag, setFilterTag] = useState("all");
    const [refreshKey, setRefreshKey] = useState(0);
    const { data: session } = useSession();
    const router = useRouter();

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
                const params: GetPostsParams = {
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
                if (filterTag !== "all" && filterTag !== "") {
                    params.tag_id = filterTag;
                }

                const response = await postService.getPosts(params);

                if (!response.error && response.status === "success") {
                    setPosts(response.data);
                    setPagination({
                        current_page: response.current_page,
                        per_page: response.per_page,
                        total: response.total || 0,
                        last_page: response.total ? Math.ceil(response.total / response.per_page) : 1,
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
    }, [searchQuery, sortBy, filterTag, pagination.current_page, pagination.per_page, refreshKey]);

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
                            likes_count: isLiked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1),
                            is_liked: isLiked,
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

    const handleCreatePost = (e: React.MouseEvent) => {
        if (!session?.user?.id) {
            e.preventDefault();
            toast.error("You must be logged in to create a post.");
            router.push("/login?callbackUrl=/explore/posts");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <CommunityPageLayout>
                <PostFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    filterTag={filterTag}
                    setFilterTag={setFilterTag}
                />
                <div className="flex justify-end pt-6 w-full max-w-3xl">
                    <PostFormDialog
                        mode={'create'}
                        trigger={
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 bg-[#19E619] hover:bg-green-500 text-black font-bold text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2.5 rounded-md"
                                onClick={handleCreatePost}
                            >
                                <Icon icon="ph:plus-circle-bold" className="w-4 h-4 sm:w-5 sm:h-5" />
                                Create Post
                            </button>
                        }
                        onSuccessAction={() => {
                            setRefreshKey(prevState => prevState + 1)
                        }}
                    />
                </div>
            </CommunityPageLayout>

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
                                onRefresh={() => {
                                    setRefreshKey(prevState => prevState + 1)
                                }}
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
    );
}
