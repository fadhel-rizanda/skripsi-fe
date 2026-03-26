"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { useRolesOptions } from "@/hooks/useFilterOptions";

interface UserFiltersProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    filterRole: string;
    setFilterRole: (value: string) => void;
}

export function UserFilters({
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterRole,
    setFilterRole,
}: UserFiltersProps) {
    const sortOptions = [
        { id: "newest", name: "Newest" },
        { id: "oldest", name: "Oldest" },
    ];

    const {
        options: roles,
        isLoading: isLoadingRoles,
        setSearch: setRoleSearch,
        loadMore: loadMoreRoles,
        hasMore: hasMoreRoles
    } = useRolesOptions();

    return (
        <div className="w-full flex flex-col space-y-3 items-center">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-3xl">
                <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                    <Input
                        placeholder="Search by name..."
                        className="pl-9 bg-white border-gray-200 rounded-lg h-10 sm:h-12 text-xs sm:text-sm focus-visible:ring-0 focus-visible:border-gray-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:w-[190px]">
                        <SearchableCombobox
                            options={sortOptions}
                            selectedValues={sortBy ? [sortBy] : []}
                            onSelect={setSortBy}
                            placeholder="Sort By"
                            emptyMessage="No sorting options."
                            mode="single"
                            className="w-full bg-white border-gray-200 rounded-lg h-10 sm:h-12 text-xs sm:text-sm"
                        />
                    </div>

                    <div className="flex-1 sm:w-[190px]">
                        <SearchableCombobox
                            options={roles}
                            selectedValues={[filterRole].filter(Boolean)}
                            onSelect={(value) => {
                                if (value === filterRole) {
                                    setFilterRole("");
                                } else {
                                    setFilterRole(value);
                                }
                            }}
                            onSearch={setRoleSearch}
                            onLoadMore={loadMoreRoles}
                            isLoading={isLoadingRoles}
                            hasMore={hasMoreRoles}
                            placeholder="Role"
                            emptyMessage="No roles found."
                            mode="single"
                            className="w-full bg-white border-gray-200 rounded-lg h-10 sm:h-[48px] text-xs sm:text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
