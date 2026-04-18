"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTagsOptions } from "@/hooks/useFilterOptions";
import { SearchInput } from ".";
import { Button } from "@/components/ui/button";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { TAG_TYPE } from "@/constant/tag-type";

const MODEL_OPTIONS = [
    { id: "user", name: "User" },
    { id: "post", name: "Post" },
    { id: "community", name: "Community" },
    { id: "pets", name: "Pets" },
];

type ReportFilterBarProps = {
    onSearchChange: (search: string) => void;
    onModelChange: (model: string) => void;
    onTagChange: (tagId: string) => void;
};

export function ReportFilterBar({ onSearchChange, onModelChange, onTagChange }: ReportFilterBarProps) {
    const [search, setSearch] = useState("");
    const [model, setModel] = useState("");
    const [tagId, setTagId] = useState("");
    const [resetKey, setResetKey] = useState(0);

    const {
        options: tags,
        isLoading: isLoadingTags,
        setSearch: setSearchTag,
        loadMore: loadMoreTags,
        hasMore: hasMoreTags,
    } = useTagsOptions(TAG_TYPE.REPORT);

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        onSearchChange(debouncedSearch);
    }, [debouncedSearch, onSearchChange]);

    useEffect(() => {
        onModelChange(model);
    }, [model, onModelChange]);

    useEffect(() => {
        onTagChange(tagId);
    }, [tagId, onTagChange]);

    const handleReset = () => {
        setSearch("");
        setModel("");
        setTagId("");
        setResetKey((k) => k + 1);
    };

    const hasActiveFilters = search || model || tagId;

    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-lg p-2 md:p-2.5 lg:p-3 flex flex-col md:flex-row flex-wrap gap-2 md:gap-2.5 lg:gap-3 items-stretch md:items-center overflow-x-auto overflow-y-hidden shadow-sm border border-gray-200 scrollbar-hide [-webkit-overflow-scrolling:touch]">
            <SearchInput
                name="search"
                value={search}
                onChange={setSearch}
                placeholder="Search by reference ID..."
                className="w-full md:w-auto bg-[#F6F8F6] border-gray-300 h-8 px-2.5 py-1.5 text-xs md:text-sm flex-1 shrink-0"
            />
            <div className="flex flex-row flex-nowrap gap-2 md:gap-2.5 lg:gap-3 overflow-x-auto scrollbar-hide md:overflow-visible md:flex-1 md:justify-start">
                <SearchableCombobox
                    key={`model-${resetKey}`}
                    options={MODEL_OPTIONS}
                    selectedValues={[model].filter(Boolean)}
                    onSelect={(value) => {
                        setModel(value === model ? "" : value);
                    }}
                    placeholder="All Models"
                    emptyMessage="No models found."
                    mode="single"
                    className="bg-[#F6F8F6] border-gray-300 h-8 px-2.5 py-1.5 w-37.5 md:w-50 text-xs md:text-sm shrink-0"
                />
                <SearchableCombobox
                    key={`tag-${resetKey}`}
                    options={tags}
                    selectedValues={[tagId].filter(Boolean)}
                    onSelect={(value) => {
                        setTagId(value === tagId ? "" : value);
                    }}
                    onSearch={setSearchTag}
                    onLoadMore={loadMoreTags}
                    isLoading={isLoadingTags}
                    hasMore={hasMoreTags}
                    placeholder="Tag"
                    emptyMessage="No tags found."
                    mode="single"
                    className="bg-[#F6F8F6] border-gray-300 h-8 px-2.5 py-1.5 w-37.5 md:w-50 text-xs md:text-sm shrink-0"
                />
                {hasActiveFilters && (
                    <Button type="button" onClick={handleReset} className="h-8 w-8">x</Button>
                )}
            </div>
        </div>
    );
}