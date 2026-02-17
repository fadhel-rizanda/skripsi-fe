"use client";

import { Search, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

                <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger className="w-full md:w-[220px] bg-white border-gray-200 rounded-lg" style={{ height: '48px' }}>
                        <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Animal Type</SelectItem>
                        {animalTypes.map((tag) => (
                            <SelectItem key={tag.id} value={tag.name}>
                                {tag.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end pt-2 w-full max-w-3xl">
                <Button className="bg-[#19E619] hover:bg-green-500 text-black font-semibold rounded-lg px-6 w-full md:w-[188px] h-12 text-[18px]">
                    <PenSquare className="mr-2 h-6 w-6" />
                    Create Post
                </Button>
            </div>
        </div>
    );
}
