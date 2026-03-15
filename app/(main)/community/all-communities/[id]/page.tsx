"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

import { communityService } from "@/services/communityService";
import { postService, GetPostsParams } from "@/services/postServices";
import { Community } from "@/types/community";
import { Post } from "@/types/post";
import { TAG_TYPE } from "@/constant/tag-type";
import { useTagsOptions } from "@/hooks/useFilterOptions";
import { formatRelativeTime, isValidUrl } from "@/lib/utils";

import { ActionDialog } from "@/components/dialog/ActionDialog";
import CommunityFormDialog from "@/components/dialog/CommunityFormDialog";
import PostFormDialog from "@/components/dialog/PostFormDialog";
import { ReportDialog } from "@/components/dialog/ReportDialog";
import { PostCard } from "@/components/community/PostCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [community, setCommunity] = useState<Community | null>(null);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityError, setCommunityError] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterTag, setFilterTag] = useState("");

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    options: tags,
    isLoading: isLoadingTags,
    setSearch: setTagSearch,
    loadMore: loadMoreTags,
    hasMore: hasMoreTags,
  } = useTagsOptions(TAG_TYPE.POST);

  const fetchCommunity = useCallback(async () => {
    try {
      setCommunityLoading(true);
      setCommunityError(null);
      const response = await communityService.getCommunityById(id);
      setCommunity(response);
    } catch (error: any) {
      console.error("Failed to fetch community detail:", error);
      setCommunityError(
        error?.response?.data?.message ?? "Failed to load community details.",
      );
    } finally {
      setCommunityLoading(false);
    }
  }, [id]);

  const fetchCommunityPosts = useCallback(async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);

      const params: GetPostsParams = {
        community_id: id,
        page: pagination.current_page,
        per_page: pagination.per_page,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (sortBy === "newest") {
        params.sort_by = "created_at";
        params.sort_direction = "desc";
      } else if (sortBy === "oldest") {
        params.sort_by = "created_at";
        params.sort_direction = "asc";
      } else {
        params.sort_by = "popular";
        params.sort_direction = "desc";
      }

      if (filterTag) {
        params.tag_id = filterTag;
      }

      const response = await postService.getPosts(params);

      if (!response.error && response.status === "success") {
        setPosts(response.data);
        setPagination((prev) => ({
          ...prev,
          current_page: response.current_page,
          per_page: response.per_page,
          total: response.total || 0,
        }));
      } else {
        setPostsError("Failed to fetch posts.");
      }
    } catch (error: any) {
      console.error("Failed to fetch community posts:", error);
      setPostsError(error?.response?.data?.message ?? "Failed to load posts.");
    } finally {
      setPostsLoading(false);
    }
  }, [id, pagination.current_page, pagination.per_page, searchQuery, sortBy, filterTag]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity, refreshKey]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCommunityPosts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchCommunityPosts, refreshKey]);

  const handleJoinToggle = async () => {
    if (!session) {
      toast.error("You must be logged in to join a community.");
      router.push(`/login?callbackUrl=/community/all-communities/${id}`);
      return;
    }

    if (!community) return;

    try {
      setJoining(true);
      const response = await communityService.followCommunity(community.id);
      const message = String(response?.message ?? "").toLowerCase();
      const isJoinAction = message.includes("followed") && !message.includes("unfollowed");

      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              is_member: isJoinAction,
              members_count: isJoinAction
                ? prev.members_count + 1
                : Math.max(0, prev.members_count - 1),
            }
          : prev,
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to update membership.");
    } finally {
      setJoining(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!community) return;
    await communityService.deleteCommunity(community.id);
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response: { status: boolean | "success"; message: string } =
        await postService.likePost(postId);
      if (response.status === true || response.status === "success") {
        const isLiked =
          response.message.toLowerCase().includes("liked") &&
          !response.message.toLowerCase().includes("unliked");
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes_count: isLiked
                    ? post.likes_count + 1
                    : Math.max(0, post.likes_count - 1),
                  is_liked: isLiked,
                }
              : post,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePerPageChange = (perPage: number) => {
    setPagination((prev) => ({ ...prev, per_page: perPage, current_page: 1 }));
  };

  const safeCommunityImageUrl =
    community && isValidUrl(community.image_url || community.attachment?.public_url || "")
      ? community.image_url || community.attachment?.public_url
      : undefined;

  const joinButtonText = useMemo(() => {
    if (!community) return "Join Community";
    if (community.is_admin) return "You are Admin";
    if (community.is_member) return "Following";
    return "Follow";
  }, [community]);

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8">
        <div className="max-w-8xl mx-auto flex justify-center items-center py-24">
          <Icon
            icon="lucide:loader-2"
            className="h-8 w-8 animate-spin text-green-600"
          />
        </div>
      </div>
    );
  }

  if (communityError || !community) {
    return (
      <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8">
        <div className="max-w-8xl mx-auto space-y-4">
          <Link
            href="/community/all-communities"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-semibold"
          >
            <Icon icon="lucide:arrow-left" className="h-4 w-4" />
            Back to Communities
          </Link>
          <Card className="rounded-2xl border-0 shadow-sm p-8 text-center">
            <p className="text-red-600 font-medium">
              {communityError ?? "Community not found."}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const communityProfileCard = (
    <Card className="rounded-2xl border-0 shadow-sm p-6">
      <div className="flex justify-end min-h-8">
        {community.is_admin && (
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
                Update community
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Icon icon="lucide:trash-2" className="h-4 w-4 mr-2" />
                Delete community
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex flex-col items-center text-center -mt-2">
        <Avatar className="h-28 w-28 border-2 border-gray-200">
          {safeCommunityImageUrl ? (
            <AvatarImage src={safeCommunityImageUrl} alt={community.name} />
          ) : null}
          <AvatarFallback className="text-2xl font-semibold">
            {community.name.substring(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h2 className="text-xl font-bold text-gray-900 mt-4">{community.name}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {community.members_count.toLocaleString()} Members
        </p>

        <p className="text-sm text-gray-600 mt-4 leading-relaxed">
          {community.description}
        </p>

        {community.website && (
          <a
            href={
              community.website.startsWith("http")
                ? community.website
                : `https://${community.website}`
            }
            target="_blank"
            rel="noreferrer"
            className="text-xs text-green-700 hover:underline mt-3"
          >
            Visit website
          </a>
        )}

        <Button
          className="w-full mt-5 bg-[#19E619] hover:bg-green-500 text-black font-semibold"
          onClick={handleJoinToggle}
          disabled={joining || community.is_admin}
        >
          <Icon icon="lucide:link" className="h-4 w-4" />
          {joining ? "Updating..." : joinButtonText}
        </Button>

        {!community.is_admin && (
          <ReportDialog
            referenceType="community"
            referenceId={community.id}
            trigger={
              <Button
                variant="outline"
                className="w-full mt-3 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-600 font-semibold"
              >
                <Icon icon="lucide:flag" className="h-4 w-4" />
                Report Community
              </Button>
            }
          />
        )}

        {(community.is_member || community.is_admin) && (
          <PostFormDialog
            mode="create"
            communityId={community.id}
            onSuccessAction={() => setRefreshKey((prev) => prev + 1)}
            trigger={
              <Button className="w-full mt-3 bg-[#19E619] hover:bg-green-500 text-black font-bold gap-2">
                <Icon icon="ph:plus-circle-bold" className="w-5 h-5" />
                Create Post
              </Button>
            }
          />
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8">
      <div className="max-w-8xl mx-auto space-y-5">
        <Link
          href="/community/all-communities"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-semibold"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Back to Communities
        </Link>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{community.name}</h1>
          <p className="text-gray-600 mt-1">{community.description}</p>
        </div>

        <div className="xl:grid xl:grid-cols-[minmax(0,1.4fr)_17.5rem] xl:gap-6 xl:items-start">
          <div className="min-w-0 w-full space-y-4">
            <Card className="rounded-xl border-0 shadow-sm p-4 bg-[#f4f7f4]">
              <div className="grid grid-cols-1 md:grid-cols-[1.6fr_0.9fr_0.9fr] gap-3">
                <div className="relative">
                  <Icon
                    icon="lucide:search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="pl-9 bg-white border-gray-200 h-11"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger size="lg" className="w-full bg-white border-gray-200">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
                <SearchableCombobox
                  options={tags}
                  selectedValues={[filterTag].filter(Boolean)}
                  onSelect={(value) => {
                    if (value === filterTag) {
                      setFilterTag("");
                      return;
                    }
                    setFilterTag(value);
                  }}
                  onSearch={setTagSearch}
                  onLoadMore={loadMoreTags}
                  isLoading={isLoadingTags}
                  hasMore={hasMoreTags}
                  placeholder="Tags"
                  emptyMessage="No tags found."
                  mode="single"
                  className="bg-white border-gray-200 h-11"
                />
              </div>
            </Card>

            <div className="space-y-4">
            {postsLoading ? (
              <Card className="rounded-2xl border-0 shadow-sm p-8 flex justify-center">
                <Icon
                  icon="lucide:loader-2"
                  className="h-7 w-7 animate-spin text-green-600"
                />
              </Card>
            ) : postsError ? (
              <Card className="rounded-2xl border-0 shadow-sm p-8 text-center">
                <p className="text-red-600 font-medium">{postsError}</p>
              </Card>
            ) : posts.length === 0 ? (
              <Card className="rounded-2xl border-0 shadow-sm p-8 text-center">
                <p className="text-gray-500">No posts found for this community.</p>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  onRefresh={() => setRefreshKey((prev) => prev + 1)}
                  formatRelativeTime={formatRelativeTime}
                />
              ))
            )}
            </div>

            {!postsLoading && !postsError && posts.length > 0 && (
              <div className="pt-2">
                <PaginationBar
                  current_page={pagination.current_page}
                  total={pagination.total}
                  per_page={pagination.per_page}
                  onPageChange={handlePageChange}
                  onDataPerPageChange={handlePerPageChange}
                  dataPerPageOptions={[10, 15, 25]}
                />
              </div>
            )}
          </div>

          <div className="hidden xl:block">
            <div className="sticky top-24">{communityProfileCard}</div>
          </div>
        </div>

        <div className="xl:hidden">{communityProfileCard}</div>
      </div>

      <ActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteCommunity}
        onContinue={() => router.push("/community/all-communities")}
        confirmVariant="destructive"
        title="Delete Community"
        description="Are you sure you want to delete this community? This action cannot be undone."
        successTitle="Community Deleted"
        successDescription="The community has been deleted successfully."
      />
      <CommunityFormDialog
        mode="edit"
        communityId={community.id}
        open={editOpen}
        onOpenChangeAction={(open) => {
          setEditOpen(open);
          if (!open) {
            setRefreshKey((prev) => prev + 1);
          }
        }}
      />
    </div>
  );
}
