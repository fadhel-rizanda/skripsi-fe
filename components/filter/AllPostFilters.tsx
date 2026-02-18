"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PostFiltersProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    filterTag: string;
    setFilterTag: (value: string) => void;
    animalTypes: { id: string; name: string }[];
}

export function PostFilters({
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterTag,
    setFilterTag,
    animalTypes = [],
}: PostFiltersProps) {
    const [tagSearch, setTagSearch] = useState("");

    return (
        <div className="w-full flex flex-col space-y-4 items-center">
            <div className="flex flex-col md:flex-row gap-3 w-full max-w-3xl">
                <div className="relative w-full md:w-[309px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-black" />
                    <Input
                        placeholder="Search by title..."
                        className="pl-9 bg-white border-gray-200 rounded-lg focus-visible:ring-green-500 h-12"

                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[220px] bg-white border-gray-200 rounded-lg" style={{ height: '48px' }}>
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-full md:w-[220px]">
                    <SearchableCombobox
                        options={[
                            { id: "all", name: "All Animals" },
                            ...animalTypes
                        ].filter(type =>
                            type.name.toLowerCase().includes(tagSearch.toLowerCase())
                        )}
                        selectedValues={[filterTag]}
                        onSelect={(id) => setFilterTag(id)}
                        onSearch={setTagSearch}
                        placeholder="Filter by Tag"
                        mode="single"
                        className="w-full bg-white border-gray-200 rounded-lg h-[48px]"
                    />
                </div>
            </div>
        </div>
    );
}
