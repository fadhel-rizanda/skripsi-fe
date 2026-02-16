import { useState, useEffect } from "react";
import { AGE_RANGES } from "@/lib/constants/pet";
import { useDebounce } from "@/hooks/useDebounce";
import { useTagsOptions } from "@/hooks/useFilterOptions";
import { SearchInput, FilterSelect, type FilterOption } from ".";
import { Button } from "@/components/ui/button";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";

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
  } = useTagsOptions("type_of_animal");
  const {
    options: tagPersonalities,
    isLoading: isLoadingTags,
    setSearch: setSearchTagPersonality,
    loadMore: loadMoreTags,
    hasMore: hasMoreTags
  } = useTagsOptions("personality");

  const ageOptions: FilterOption[] = AGE_RANGES.map((range) => ({
    value: range.value,
    label: range.label,
  }));

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);

  const handleReset = () => {
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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg p-2 md:p-2.5 lg:p-3 flex flex-col md:flex-row flex-wrap gap-2 md:gap-2.5 lg:gap-3 items-stretch md:items-center overflow-x-auto overflow-y-hidden shadow-sm border border-gray-200 scrollbar-hide [-webkit-overflow-scrolling:touch]">
      <SearchInput
        name="search"
        value={search}
        onChange={setSearch}
        placeholder="Search by name..."
        className="w-full md:w-auto"
      />
      <div className="flex flex-row flex-nowrap gap-2 md:gap-2.5 lg:gap-3 overflow-x-auto scrollbar-hide md:overflow-visible md:flex-1 md:justify-start">
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
          placeholder="Type of Animal"
          emptyMessage="No types found."
          mode="single"
          className="bg-[#F6F8F6] border-gray-300 h-8 px-2.5 py-1.5 w-37.5 md:w-50 text-xs md:text-sm shrink-0"
        />
        <FilterSelect
          name="age"
          value={age}
          onChange={setAge}
          options={ageOptions}
          placeholder="Any Age"
          className="text-black"
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
          className="bg-[#F6F8F6] border-gray-300 h-8 px-2.5 py-1.5 w-37.5 md:w-50 text-xs md:text-sm shrink-0"
        />
        {(search || age || typeOfAnimalId || tagPersonalityId) && (
          <Button type="button" onClick={handleReset} className="h-8 w-8">x</Button>
        )}
      </div>
    </div>
  );
}