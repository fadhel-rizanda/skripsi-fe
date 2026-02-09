import { useState, useEffect } from "react";
import { AGE_RANGES } from "@/lib/constants/pet";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { SearchInput } from "./SearchInput";
import { FilterSelect, FilterOption } from "./FilterSelect";

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
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg p-2.5 sm:p-3 flex flex-row flex-nowrap gap-2.5 sm:gap-3 items-center overflow-x-auto scrollbar-thin shadow-sm border border-gray-200">
      <SearchInput
        name="search"
        value={search}
        onChange={setSearch}
        placeholder="Search by name..."
        className="min-w-[140px] max-w-[180px]"
      />
      <FilterSelect
        name="type_of_animal_id"
        value={typeOfAnimalId}
        onChange={setTypeOfAnimalId}
        options={animalTypeOptions}
        placeholder="Type of Animal"
        isLoading={isLoadingTypes}
        className="min-w-[120px] max-w-[160px]"
      />
      <FilterSelect
        name="age"
        value={age}
        onChange={setAge}
        options={ageOptions}
        placeholder="Any Age"
        className="min-w-[100px] max-w-[140px]"
      />
      <FilterSelect
        name="tag_personality_id"
        value={tagPersonalityId}
        onChange={setTagPersonalityId}
        options={tagPersonalityOptions}
        placeholder="Tags"
        isLoading={isLoadingTags}
        className="min-w-[100px] max-w-[140px]"
      />
    </div>
  );
}