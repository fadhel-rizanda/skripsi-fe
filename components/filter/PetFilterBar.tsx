import { useState, useEffect } from "react";
import { AGE_RANGES } from "@/lib/constants/pet";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { SearchInput, FilterSelect, type FilterOption } from ".";

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
  const { options: animalTypes, isLoading: isLoadingTypes } = useFilterOptions("type_of_animal");
  const { options: tagPersonalities, isLoading: isLoadingTags } = useFilterOptions("personality");

  // Convert to FilterOption format
  const animalTypeOptions: FilterOption[] = animalTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  const tagPersonalityOptions: FilterOption[] = tagPersonalities.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

  const ageOptions: FilterOption[] = AGE_RANGES.map((range) => ({
    value: range.value,
    label: range.label,
  }));

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);

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
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg p-2 md:p-2.5 lg:p-3 flex flex-col md:flex-row flex-wrap gap-2 md:gap-2.5 lg:gap-3 items-stretch md:items-center overflow-x-auto overflow-y-hidden shadow-sm border border-gray-200 scrollbar-hide [-webkit-overflow-scrolling:touch]">
      <SearchInput
        name="search"
        value={search}
        onChange={setSearch}
        placeholder="Search by name..."
        className="w-full md:w-auto"
      />
      <div className="flex flex-row flex-nowrap gap-2 md:gap-2.5 lg:gap-3 overflow-x-auto scrollbar-hide md:overflow-visible md:flex-1 md:justify-start">
        <FilterSelect
          name="type_of_animal_id"
          value={typeOfAnimalId}
          onChange={setTypeOfAnimalId}
          options={animalTypeOptions}
          placeholder="Type of Animal"
          isLoading={isLoadingTypes}
        />
        <FilterSelect
          name="age"
          value={age}
          onChange={setAge}
          options={ageOptions}
          placeholder="Any Age"
        />
        <FilterSelect
          name="tag_personality_id"
          value={tagPersonalityId}
          onChange={setTagPersonalityId}
          options={tagPersonalityOptions}
          placeholder="Tags"
          isLoading={isLoadingTags}
        />
      </div>
    </div>
  );
}