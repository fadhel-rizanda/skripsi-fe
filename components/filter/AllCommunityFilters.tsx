"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { useTagsOptions } from "@/hooks/useFilterOptions";
import {TAG_TYPE} from "@/constant/tag-type";

interface CommunityFiltersProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    filterTag: string;
    setFilterTag: (value: string) => void;
}

export function CommunityFilters({
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterTag,
    setFilterTag,
}: CommunityFiltersProps) {
    const sortOptions = [
        { id: "newest", name: "Newest" },
        { id: "oldest", name: "Oldest" },
        { id: "members", name: "Most Members" },
    ];

    const {
        options: tags,
        isLoading: isLoadingTags,
        setSearch: setTagSearch,
        loadMore: loadMoreTags,
        hasMore: hasMoreTags
    } = useTagsOptions(TAG_TYPE.PET.PHYSIQUE);

    return (
        <div className="w-full flex flex-col space-y-3 items-center">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-3xl">
                <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                    <Input
                        placeholder="Search by community name..."
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
                            options={tags}
                            selectedValues={[filterTag].filter(Boolean)}
                            onSelect={(value) => {
                                if (value === filterTag) {
                                    setFilterTag("");
                                } else {
                                    setFilterTag(value);
                                }
                            }}
                            onSearch={setTagSearch}
                            onLoadMore={loadMoreTags}
                            isLoading={isLoadingTags}
                            hasMore={hasMoreTags}
                            placeholder="Filter by Tag"
                            emptyMessage="No tags found."
                            mode="single"
                            className="w-full bg-white border-gray-200 rounded-lg h-10 sm:h-12 text-xs sm:text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
