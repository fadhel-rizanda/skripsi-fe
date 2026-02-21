"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

import { CommunityFilters } from "@/components/filter/AllCommunityFilters";
import { Button } from "@/components/ui/button";
import { CommunityPageLayout } from "../layout";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { communityService } from "@/services/communityService";
import { CommunityCard } from "@/components/community/CommunityCard";
import CommunityFormDialog from "@/components/dialog/CommunityFormDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Community } from "@/types/community";
import { GetAllParams } from "@/types/api";

export default function AllCommunityPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterTag, setFilterTag] = useState("");

    const { data: session } = useSession();
    const router = useRouter();

    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    });

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                setLoading(true);
                setError(null);

                const params: GetAllParams & { tag_id?: string } = {
                    per_page: pagination.per_page,
                    page: pagination.current_page,
                    search: searchQuery || undefined,
                    sort_by: sortBy === "members" ? "members_count" : "created_at",
                    order_by: sortBy === "oldest" ? "asc" : "desc",
                } as any;

                if (filterTag) {
                    params.tag_id = filterTag;
                }

                const response = await communityService.getCommunities(params);

                if (!response.error && response.status === "success") {
                    setCommunities(response.data);
                    setPagination({
                        current_page: response.current_page,
                        per_page: response.per_page,
                        total: response.total || 0,
                        last_page: response.total ? Math.ceil(response.total / response.per_page) : 1,
                    });
                } else {
                    setError("Failed to fetch communities");
                }
            } catch (err: any) {
                console.error("Error fetching communities:", err);
                setError(err.response?.data?.message || "Failed to fetch communities");
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchCommunities();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, sortBy, filterTag, pagination.current_page, pagination.per_page]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, current_page: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePerPageChange = (perPage: number) => {
        setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
    };

    const handleCreateCommunity = (e: React.MouseEvent) => {
        if (!session) {
            e.preventDefault();
            toast.error("You must be logged in to create a community.");
            router.push("/login?callbackUrl=/community/all-communities");
        }
    };

    return (
        <>
            <CommunityPageLayout>
                <CommunityFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    filterTag={filterTag}
                    setFilterTag={setFilterTag}
                />
                <div className="flex justify-end pt-6 w-full max-w-3xl">
                    <CommunityFormDialog mode="create" trigger={
                        <Button
                            className="bg-[#19E619] hover:bg-green-500 text-black p-5! font-bold"
                            onClick={handleCreateCommunity}
                        >
                            <Icon icon="ph:users-three" /> Create Community
                        </Button>
                    } />
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

            {/* Communities List */}
            {!loading && !error && (
                communities.length === 0 ? (
                    <Card className="rounded-2xl border-0 shadow-sm">
                        <CardContent className="p-8 text-center">
                            <p className="text-gray-500 text-lg">No communities found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {communities.map((community) => (
                            <CommunityCard
                                key={community.id}
                                community={community}
                            />
                        ))}
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && !error && communities.length > 0 && (
                <div className="mt-8">
                    <PaginationBar
                        current_page={pagination.current_page}
                        total={pagination.total}
                        per_page={pagination.per_page}
                        onPageChange={handlePageChange}
                        onDataPerPageChange={handlePerPageChange}
                        dataPerPageOptions={[10, 20, 50]}
                    />
                </div>
            )}
        </>
    );
}
