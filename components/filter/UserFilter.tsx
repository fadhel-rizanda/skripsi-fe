"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { generalService } from "@/services/generalServices";

export interface UserFilterProps {
    onSearchChange?: (search: string) => void;
    onRoleChange?: (role: string) => void;
}

export function UserFilter({ onSearchChange, onRoleChange }: UserFilterProps) {
    const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>("all");
    const [search, setSearch] = useState("");

    // Debounce pencarian 500ms
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange?.(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search, onSearchChange]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await generalService.getRoles();
                setRoles(response);
            } catch (error) {
                console.error("Failed to fetch roles", error);
            }
        };

        fetchRoles();
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
                    { id: "all", name: "All Roles" },
                    ...roles.map((role) => ({
                        id: role.id,
                        name: role.name.charAt(0).toUpperCase() + role.name.slice(1),
                    })),
                ]}
                selectedValues={selectedRole ? [selectedRole] : []}
                onSelect={(value) => {
                    setSelectedRole(value);
                    onRoleChange?.(value === "all" ? "" : value);
                }}
                placeholder="Role"
                mode="single"
                className="w-full sm:w-[150px] h-11 bg-white border-gray-200 text-gray-600"
            />
        </Card>
    );
}
