import { useState, useEffect } from "react";
import { AGE_RANGES } from "@/lib/constants/pet";
import { useDebounce } from "@/hooks/useDebounce";
import {useTagsOptions} from "@/hooks/useFilterOptions";
import { SearchInput } from ".";
import {Button} from "@/components/ui/button";
import {SearchableCombobox} from "@/components/combobox/SearchableCombobox";
import {TAG_TYPE} from "@/constant/tag-type";

// Tambahkan tipe FilterState dan props
type FilterState = {
  search?: string;
  age?: string;
  type_of_animal_id?: string;
  tag_personality_id?: string;
};

type PetFilterBarProps = {
  onFilterChange: (newFilters: FilterState) => void;
};

export function PetFilterBar({ onFilterChange }: PetFilterBarProps) {
  const [search, setSearch] = useState("");
  const [age, setAge] = useState("");
  const [typeOfAnimalId, setTypeOfAnimalId] = useState("");
  const [tagPersonalityId, setTagPersonalityId] = useState("");

  // Fetch options from API
  const {
    options: animalTypes,
    isLoading: isLoadingTypes,
      setSearch: setSearchType,
    loadMore: loadMoreTypes,
    hasMore: hasMoreTypes
  } = useTagsOptions(TAG_TYPE.GENERAL.TYPE_OF_ANIMAL);
  const {
    options: tagPersonalities,
    isLoading: isLoadingTags,
    setSearch: setSearchTagPersonality,
    loadMore: loadMoreTags,
    hasMore: hasMoreTags
} = useTagsOptions(TAG_TYPE.PET.PERSONALITY);

  const ageOptions = AGE_RANGES.map((range) => ({
    id: range.value,
    name: range.label,
  }));

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);

  const handleReset = ()=>{
    setSearch("");
    setAge("");
    setTypeOfAnimalId("");
    setTagPersonalityId("");
  }

  // Trigger onFilterChange when debounced search or other filters change
  useEffect(() => {
    const filters: FilterState = {};
    
    if (debouncedSearch) filters.search = debouncedSearch;
    if (age) filters.age = age;
    if (typeOfAnimalId) filters.type_of_animal_id = typeOfAnimalId;
    if (tagPersonalityId) filters.tag_personality_id = tagPersonalityId;

    onFilterChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, age, typeOfAnimalId, tagPersonalityId]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg p-2 md:p-2.5 lg:p-3 flex flex-col md:flex-row flex-wrap gap-2 md:gap-2.5 lg:gap-3 items-stretch md:items-center shadow-sm border border-gray-200">
      <SearchInput
        name="search"
        value={search}
        onChange={setSearch}
        placeholder="Search by name..."
        className="w-full md:w-[220px] lg:w-[260px] shrink-0"
      />
      <div className="flex flex-row flex-wrap md:flex-nowrap gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 w-full md:flex-1">
        <SearchableCombobox
            options={animalTypes}
            selectedValues={[typeOfAnimalId].filter(Boolean)}
            onSelect={(value) => {
              if (value === typeOfAnimalId) {
                setTypeOfAnimalId("");
              } else {
                setTypeOfAnimalId(value);
              }
            }}
            onSearch={setSearchType}
            onLoadMore={loadMoreTypes}
            isLoading={isLoadingTypes}
            hasMore={hasMoreTypes}
            placeholder="Animal Type"
            emptyMessage="No types found."
            mode="single"
            className="bg-[#F6F8F6] border-gray-300 h-8 px-1.5 sm:px-2.5 py-1.5 flex-1 min-w-0 text-[10px] sm:text-xs md:text-sm"
        />
        <SearchableCombobox
            options={ageOptions}
            selectedValues={[age].filter(Boolean)}
            onSelect={(value) => {
              if (value === age) {
                setAge("");
              } else {
                setAge(value);
              }
            }}
            placeholder="Any Age"
            emptyMessage="No age options found."
            mode="single"
            className="bg-[#F6F8F6] border-gray-300 h-8 px-1.5 sm:px-2.5 py-1.5 flex-1 min-w-0 text-[10px] sm:text-xs md:text-sm"
        />
        <SearchableCombobox
            options={tagPersonalities}
            selectedValues={[tagPersonalityId].filter(Boolean)}
            onSelect={(value) => {
              if (value === tagPersonalityId) {
                setTagPersonalityId("");
              } else {
                setTagPersonalityId(value);
              }
            }}
            onSearch={setSearchTagPersonality}
            onLoadMore={loadMoreTags}
            isLoading={isLoadingTags}
            hasMore={hasMoreTags}
            placeholder="Tags"
            emptyMessage="No tags found."
            mode="single"
            className="bg-[#F6F8F6] border-gray-300 h-8 px-1.5 sm:px-2.5 py-1.5 flex-1 min-w-0 text-[10px] sm:text-xs md:text-sm"
        />
        {(search || age || typeOfAnimalId || tagPersonalityId) && (
            <Button type="button" onClick={handleReset} className="h-8 w-8 shrink-0">x</Button>
        )}
      </div>
    </div>
  );
}