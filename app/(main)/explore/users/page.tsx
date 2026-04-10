"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { UserFilters } from "@/components/filter/AllUserFilters";
import { CommunityPageLayout } from "../layout";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { userService, GetUsersParams } from "@/services/userServices";

import { Card, CardContent } from "@/components/ui/card";
import { UserCard } from "@/components/community/UserCard";
import { UserProfile } from "@/types/user";

export default function AllUserPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterRole, setFilterRole] = useState("");

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    });

    // Fetch users from API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build query parameters
                const params: GetUsersParams = {
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
                }

                // Add search query
                if (searchQuery) {
                    params.search = searchQuery;
                }

                // Add role filter
                if (filterRole && filterRole !== "all") {
                    params.role_id = filterRole;
                }

                const response = await userService.getUsers(params);

                if (!response.error && response.status === "success") {
                    setUsers(response.data);
                    setPagination({
                        current_page: response.current_page,
                        per_page: response.per_page,
                        total: response.total || 0,
                        last_page: response.total ? Math.ceil(response.total / response.per_page) : 1,
                    });
                } else {
                    setError("Failed to fetch users");
                }
            } catch (err: any) {
                console.error("Error fetching users:", err);
                setError(err.response?.data?.message || "Failed to fetch users");
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, sortBy, filterRole, pagination.current_page, pagination.per_page]);

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, current_page: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePerPageChange = (perPage: number) => {
        setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <CommunityPageLayout>
                <UserFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    filterRole={filterRole}
                    setFilterRole={setFilterRole}
                />
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

            {/* Users List */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
                    {users.length === 0 ? (
                        <Card className="rounded-2xl border-0 shadow-sm md:col-span-2">
                            <CardContent className="p-8 text-center">
                                <p className="text-gray-500">No users found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        users.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && users.length > 0 && (
                <div className="mt-8">
                    <PaginationBar
                        current_page={pagination.current_page}
                        total={pagination.total}
                        per_page={pagination.per_page}
                        onPageChange={handlePageChange}
                        onDataPerPageChange={handlePerPageChange}
                        dataPerPageOptions={[10, 15, 25, 50]}
                        itemLabel="Users"
                    />
                </div>
            )}
        </div>
    );
}
