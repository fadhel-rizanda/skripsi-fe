"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { generalService } from "@/services/generalServices";

export interface CommunityFilterProps {
    onSearchChange?: (search: string) => void;
    onTagChange?: (tagId: string) => void;
}

export function CommunityFilter({ onSearchChange, onTagChange }: CommunityFilterProps) {
    const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange?.(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, onSearchChange]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await generalService.getTags("community");
                setTags(response);
            } catch (error) {
                console.error("Failed to fetch community tags:", error);
            }
        };
        fetchTags();
    }, []);

    return (
        <Card className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-none shadow-sm rounded-xl bg-white">
            <InputGroup className="w-full flex-1 h-11 bg-white border-gray-200">
                <InputGroupAddon>
                    <Search className="size-5 text-gray-400" />
                </InputGroupAddon>
                <InputGroupInput
                    placeholder="Search by name..."
                    className="text-base h-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </InputGroup>

            <SearchableCombobox
                options={[
                    { id: "all", name: "All Tags" },
                    ...tags.map((tag) => ({
                        id: tag.id,
                        name: tag.name.charAt(0).toUpperCase() + tag.name.slice(1),
                    })),
                ]}
                selectedValues={selectedTag ? [selectedTag] : []}
                onSelect={(value) => {
                    setSelectedTag(value);
                    onTagChange?.(value === "all" ? "" : value);
                }}
                placeholder="Tag"
                mode="single"
                className="w-full sm:w-[150px] h-11 bg-white border-gray-200 text-gray-600"
            />
        </Card>
    );
}