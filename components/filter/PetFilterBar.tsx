import { Search } from "lucide-react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useState } from "react";
import { ANIMAL_TYPES, AGE_RANGES, TAG_PERSONALITIES } from "@/lib/constants/pet";

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
  const [filters, setFilters] = useState<FilterState>({});

  // Handler untuk setiap perubahan filter
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg p-1.5 sm:p-2 md:p-2.5 lg:p-2.5 flex flex-nowrap gap-1.5 sm:gap-2 md:gap-3 lg:gap-3 items-center shadow border overflow-x-auto">
      <div className="flex items-center bg-[#F6F8F6] border rounded-md px-1.5 sm:px-2 md:px-2.5 py-1 sm:py-1.5 md:py-1.5 flex-1 min-w-[7rem] sm:min-w-[8rem] md:min-w-[10rem] lg:w-44 flex-shrink-0">
        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 lg:w-5 text-gray-400 mr-1 sm:mr-1.5 md:mr-2" />
        <input
          type="text"
          name="search"
          placeholder="Search by name..."
          className="bg-transparent outline-none border-none w-full text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-700 placeholder:text-gray-400"
          value={filters.search || ""}
          onChange={handleChange}
        />
      </div>
      <NativeSelect
        name="type_of_animal_id"
        className="bg-[#F6F8F6] border rounded-md px-1.5 sm:px-2 md:px-2.5 py-1 sm:py-1.5 md:py-1.5 flex-1 min-w-[7rem] sm:min-w-[8rem] md:min-w-[10rem] lg:w-44 h-7 sm:h-8 md:h-8 lg:h-9 text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-700 focus:outline-none flex-shrink-0"
        value={filters.type_of_animal_id || ""}
        onChange={handleChange}
      >
        <NativeSelectOption value="">Type of Animal</NativeSelectOption>
        {ANIMAL_TYPES.map(animal => (
          <NativeSelectOption key={animal.value} value={animal.value}>
            {animal.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        name="age"
        className="bg-[#F6F8F6] border rounded-md px-1.5 sm:px-2 md:px-2.5 py-1 sm:py-1.5 md:py-1.5 flex-1 min-w-[6rem] sm:min-w-[7rem] md:min-w-[8rem] lg:w-36 h-7 sm:h-8 md:h-8 lg:h-9 text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-700 focus:outline-none flex-shrink-0"
        value={filters.age || ""}
        onChange={handleChange}
      >
        <NativeSelectOption value="">Any Age</NativeSelectOption>
        {AGE_RANGES.map(age => (
          <NativeSelectOption key={age.value} value={age.value}>
            {age.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        name="tag_personality_id"
        className="bg-[#F6F8F6] border rounded-md px-1.5 sm:px-2 md:px-2.5 py-1 sm:py-1.5 md:py-1.5 flex-1 min-w-[5rem] sm:min-w-[6rem] md:min-w-[8rem] lg:w-36 h-7 sm:h-8 md:h-8 lg:h-9 text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-700 focus:outline-none flex-shrink-0"
        value={filters.tag_personality_id || ""}
        onChange={handleChange}
      >
        <NativeSelectOption value="">Tags</NativeSelectOption>
        {TAG_PERSONALITIES.map(tag => (
        <NativeSelectOption key={tag.value} value={tag.value}>
          {tag.label}
        </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}