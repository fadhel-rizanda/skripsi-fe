import {useState, useEffect} from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchInput, FilterSelect, type FilterOption } from ".";
import {useStatusesOptions, useTagsOptions} from "@/hooks/useFilterOptions";
import {AdoptionFilterState} from "@/types";
import {Button} from "@/components/ui/button";


type AdoptionFilterBarProps = {
    onFilterChange: (newFilters: AdoptionFilterState) => void;
};

export function AdoptionFilterBar({ onFilterChange }: AdoptionFilterBarProps) {
    const [search, setSearch] = useState("");
    const [statusId, setStatusId] = useState("");
    const [stageTagId, setStageTagId] = useState("");

    // Fetch options from API
    const { options: statuses, isLoading: isLoadingStatuses } = useStatusesOptions("adoption");
    const { options: stageTags, isLoading: isLoadingStageTags } = useTagsOptions("adoption.stage");

    // Convert to FilterOption format
    const statusOptions: FilterOption[] = statuses.map((type) => ({
        value: type.id,
        label: type.name,
    }));

    const stageTagOptions: FilterOption[] = stageTags.map((tag) => ({
        value: tag.id,
        label: tag.name,
    }));

    // Debounce search input to avoid excessive API calls
    const debouncedSearch = useDebounce(search, 500);

    const handleStatusChange = (value: string) => {
        setStatusId((prev) => (prev === value ? "" : value));
    };
    const handleStageChange = (value: string) => {
        setStageTagId((prev) => (prev === value ? "" : value));
    };

    const handleReset = ()=>{
        setSearch("");
        setStatusId("");
        setStageTagId("");
    }


    // Trigger onFilterChange when debounced search or other filters change
    useEffect(() => {
        const filters: AdoptionFilterState = {};

        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusId) filters.status_id = statusId;
        if (stageTagId) filters.stage_tag_id = stageTagId;

        onFilterChange(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, statusId, stageTagId]);

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg p-2 md:p-2.5 lg:p-3 flex flex-col md:flex-row flex-wrap gap-2 md:gap-2.5 lg:gap-3 items-stretch md:items-center overflow-x-auto overflow-y-hidden shadow-sm border border-gray-200 scrollbar-hide [-webkit-overflow-scrolling:touch]">
            <SearchInput
                name="search"
                value={search}
                onChange={setSearch}
                placeholder="Search by name..."
                className="w-full md:w-auto"
            />
            <div className="flex flex-row flex-nowrap gap-2 md:gap-2.5 lg:gap-3 overflow-x-auto scrollbar-hide md:overflow-visible md:flex-1 md:justify-start">
                <FilterSelect
                    name="tag_personality_id"
                    value={stageTagId}
                    onChange={handleStageChange}
                    options={stageTagOptions}
                    placeholder="Stage Tag"
                    isLoading={isLoadingStageTags}
                />
                <FilterSelect
                    name="type_of_animal_id"
                    value={statusId}
                    onChange={handleStatusChange}
                    options={statusOptions}
                    placeholder="Status"
                    isLoading={isLoadingStatuses}
                />
            </div>
            {(search || statusId || stageTagId) && (
                <Button type="button" onClick={handleReset} className="h-8 w-8">x</Button>
            )}
        </div>
    );
}