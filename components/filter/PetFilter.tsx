"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { generalService } from "@/services/generalServices";

export interface PetFilterProps {
    onSearchChange?: (search: string) => void;
    onTypeChange?: (typeId: string) => void;
}

export function PetFilter({ onSearchChange, onTypeChange }: PetFilterProps) {
    const [animalTypes, setAnimalTypes] = useState<{ id: string; name: string }[]>([]);
    const [selectedType, setSelectedType] = useState<string>("all");
    const [search, setSearch] = useState("");

    // Debounce search 500ms
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange?.(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search, onSearchChange]);

    useEffect(() => {
        const fetchAnimalTypes = async () => {
            try {
                const response = await generalService.getTags("type_of_animal");
                setAnimalTypes(response);
            } catch (error) {
                console.error("Failed to fetch animal types:", error);
            }
        };

        fetchAnimalTypes();
    }, []);

    return (
        <Card className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-none shadow-sm rounded-xl bg-white">
            <InputGroup className="w-full flex-1 h-9 sm:h-11 bg-white border-gray-200">
                <InputGroupAddon>
                    <Search className="size-5 text-gray-400" />
                </InputGroupAddon>
                <InputGroupInput
                    placeholder="Search by name..."
                    className="text-sm sm:text-base h-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </InputGroup>

            <SearchableCombobox
                options={[
                    { id: "all", name: "All Types" },
                    ...animalTypes.map((type) => ({
                        id: type.id,
                        name: type.name.charAt(0).toUpperCase() + type.name.slice(1),
                    })),
                ]}
                selectedValues={selectedType ? [selectedType] : []}
                onSelect={(value) => {
                    setSelectedType(value);
                    onTypeChange?.(value === "all" ? "" : value);
                }}
                placeholder="Animal Type"
                mode="single"
                className="w-full sm:w-37.5 h-9 sm:h-11 bg-white border-gray-200 text-gray-600 text-sm sm:text-base"
            />
        </Card>
    );
}