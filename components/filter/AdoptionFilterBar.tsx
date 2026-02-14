import {useState, useEffect} from "react";
import {useDebounce} from "@/hooks/useDebounce";
import {SearchInput} from ".";
import {useStatusesOptions, useTagsOptions} from "@/hooks/useFilterOptions";
import {AdoptionFilterState} from "@/types";
import {Button} from "@/components/ui/button";
import {SearchableCombobox} from "@/components/combobox/SearchableCombobox";


type AdoptionFilterBarProps = {
    onFilterChange: (newFilters: AdoptionFilterState) => void;
};

export function AdoptionFilterBar({onFilterChange}: AdoptionFilterBarProps) {
    const [search, setSearch] = useState("");
    const [statusId, setStatusId] = useState("");
    const [stageTagId, setStageTagId] = useState("");

    // Fetch options from API
    const {
        options: statuses,
        isLoading: isLoadingStatuses,
        setSearch: setStatusSearch,
        loadMore: loadMoreStatus,
        hasMore: hasMoreStatus
    } = useStatusesOptions("adoption");
    const {
        options: stageTags,
        isLoading: isLoadingStageTags,
        setSearch: setStageSearch,
        loadMore: loadMoreStage,
        hasMore: hasMoreStage
    } = useTagsOptions("adoption.stage");

    // Debounce search input to avoid excessive API calls
    const debouncedSearch = useDebounce(search, 500);

    const handleReset = () => {
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
        <div
            className="w-full max-w-4xl mx-auto bg-white rounded-lg p-2 md:p-2.5 lg:p-3 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-2 md:gap-2.5 lg:gap-3 items-stretch md:items-center">
                {/* Search Input */}
                <SearchInput
                    name="search"
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name..."
                    className="w-full md:flex-1"
                />

                {/* Filter Selects Container */}
                <div className="flex flex-row gap-2 md:gap-2.5 lg:gap-3 md:shrink-0">
                    <SearchableCombobox
                        options={stageTags}
                        selectedValues={[stageTagId].filter(Boolean)}
                        onSelect={(value) => {
                            if (value === stageTagId) {
                                setStageTagId("");
                            } else {
                                setStageTagId(value);
                            }
                        }}
                        onSearch={setStageSearch}
                        onLoadMore={loadMoreStage}
                        isLoading={isLoadingStageTags}
                        hasMore={hasMoreStage}
                        placeholder="Stage"
                        emptyMessage="No stages found."
                        mode="single"
                        className="bg-[#F6F8F6] border-gray-300 h-8 px-2.5 py-1.5 w-37.5 md:w-40 text-xs md:text-sm shrink-0"
                    />

                    <SearchableCombobox
                        options={statuses}
                        selectedValues={[statusId].filter(Boolean)}
                        onSelect={(value) => {
                            if (value === statusId) {
                                setStatusId("");
                            } else {
                                setStatusId(value);
                            }
                        }}
                        onSearch={setStatusSearch}
                        onLoadMore={loadMoreStatus}
                        isLoading={isLoadingStatuses}
                        hasMore={hasMoreStatus}
                        placeholder="Status"
                        emptyMessage="No status found."
                        mode="single"
                        className="bg-[#F6F8F6] border-gray-300 h-8 px-2.5 py-1.5 w-37.5 md:w-40 text-xs md:text-sm shrink-0"
                    />
                </div>

                {/* Reset Button */}
                {(search || statusId || stageTagId) && (
                    <Button type="button" onClick={handleReset} className="h-8 w-8 shrink-0">X</Button>
                )}
            </div>
        </div>
    );
}