"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";

export interface AdoptionFilterProps {
    onSearchChange?: (search: string) => void;
    onStatusChange?: (status: string) => void;
    onProcessChange?: (process: string) => void;
}

const STATUS_OPTIONS = [
    { id: "all", name: "All Status" },
    { id: "pending_review", name: "Pending Review" },
    { id: "approved", name: "Approved" },
    { id: "handover_in_progress", name: "Handover in Progress" },
    { id: "completed", name: "Completed" },
    { id: "rejected", name: "Rejected" },
];

const PROCESS_OPTIONS = [
    { id: "all", name: "All Process" },
    { id: "application_submitted", name: "Application Submitted" },
    { id: "application_reviewed", name: "Application Reviewed" },
    { id: "meet_greet_scheduling", name: "Meet & Greet Scheduling" },
    { id: "handover_day", name: "Handover Day" },
];

export function AdoptionFilter({ onSearchChange, onStatusChange, onProcessChange }: AdoptionFilterProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedProcess, setSelectedProcess] = useState<string>("all");
    const [search, setSearch] = useState("");

    // Debounce search 500ms
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange?.(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, onSearchChange]);

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

            <div className="flex gap-2 w-full sm:w-auto">
                <SearchableCombobox
                    options={STATUS_OPTIONS}
                    selectedValues={selectedStatus ? [selectedStatus] : []}
                    onSelect={(value) => {
                        setSelectedStatus(value);
                        onStatusChange?.(value === "all" ? "" : value);
                    }}
                    placeholder="Status"
                    mode="single"
                    className="w-full sm:w-37.5 h-11 bg-white border-gray-200 text-gray-600"
                />

                <SearchableCombobox
                    options={PROCESS_OPTIONS}
                    selectedValues={selectedProcess ? [selectedProcess] : []}
                    onSelect={(value) => {
                        setSelectedProcess(value);
                        onProcessChange?.(value === "all" ? "" : value);
                    }}
                    placeholder="Process"
                    mode="single"
                    className="w-full sm:w-40 h-11 bg-white border-gray-200 text-gray-600"
                />
            </div>
        </Card>
    );
}