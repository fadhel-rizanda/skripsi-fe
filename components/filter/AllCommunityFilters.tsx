"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTagsOptions } from "@/hooks/useFilterOptions";

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
    const {
        options: tags,
        isLoading: isLoadingTags,
        setSearch: setTagSearch,
        loadMore: loadMoreTags,
        hasMore: hasMoreTags
    } = useTagsOptions("physique");

    return (
        <div className="w-full flex flex-col space-y-4 items-center">
            <div className="flex flex-col md:flex-row gap-3 w-full max-w-3xl">
                <div className="relative w-full md:w-[309px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-black" />
                    <Input
                        placeholder="Search by community name..."
                        className="pl-9 bg-white border-gray-200 rounded-lg focus-visible:ring-green-500 h-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[220px] bg-white border-gray-200 rounded-lg h-12">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="members">Most Members</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-full md:w-[220px]">
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
                        className="w-full bg-white border-gray-200 rounded-lg h-[48px]"
                    />
                </div>
            </div>
        </div>
    );
}
