import { Search } from "lucide-react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useState } from "react";

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

const ANIMAL_TYPES = [
  { value: "019be3ef-c3a0-7367-bffe-20e2c12f34e6", label: "Dog" },
  { value: "019be3ef-c46f-7359-a279-c5511458ff87", label: "Cat" },
  { value: "019be3ef-c62d-72c2-b553-e9946aca7578", label: "Rabbit" },
  { value: "019be3ef-c6da-726d-bed2-8c30c3e9ed81", label: "Hamster" },
  { value: "019be3ef-c782-70d3-8ba4-e0753ba548f0", label: "Bird" },
  { value: "019be3ef-c83e-7339-8f87-c12cc650c1a1", label: "Fish" },
  { value: "019be3ef-c8e3-70d3-9746-8706631266e8", label: "Reptile" },
];

const AGE_RANGES = [
  { value: "baby", label: "Baby" },
  { value: "young", label: "Young" },
  { value: "adult", label: "Adult" },
  { value: "senior", label: "Senior" },
];

const TAG_PERSONALITIES = [
  { value: "019be3ef-ce7b-7155-b125-a796dcfe97de", label: "Friendly" },
  { value: "019be3ef-d00b-7128-9a40-e3bc4f8f34aa", label: "Calm" },
  { value: "019be3ef-d158-7311-8203-6baa26fd8367", label: "Playful" },
  { value: "019be3ef-d205-7398-a15d-7b320902d006", label: "Active" },
  { value: "019be3ef-d2ad-71eb-a55f-bdb28bcc67e0", label: "Lazy" },
  { value: "019be3ef-d37c-7012-862f-526ce4fc98e2", label: "Aggressive" },
  { value: "019be3ef-d428-73f1-ae7e-70a43c6203e3", label: "Shy" },
  { value: "019be3ef-d6ae-71ba-b8b8-ee011bd1c95d", label: "Independent" },
  { value: "019be3ef-d765-7214-9833-e57412e3fee0", label: "Affectionate" },
  { value: "019be3ef-d821-7155-8454-dc1154e06b80", label: "Protective" },
  { value: "019be3ef-d8c6-701d-a3d7-69211bca24a1", label: "Curious" },
  { value: "019be3ef-d9a5-706a-ac90-1f3f0fee8ff1", label: "Trainable" },
];

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
    <div className="w-full max-w-[52rem] mx-auto bg-white rounded-lg p-1.5 md:p-2 lg:p-2.5 flex flex-nowrap gap-1 md:gap-2.5 lg:gap-3 items-center shadow border">
      <div className="flex items-center bg-[#F6F8F6] border rounded-md px-1.5 md:px-2.5 py-1 md:py-1.5 w-28 md:w-48 lg:w-52 flex-shrink-0">
        <Search className="w-3.5 h-3.5 md:w-5 lg:w-5 text-gray-400 mr-1 md:mr-2" />
        <input
          type="text"
          name="search"
          placeholder="Search by name..."
          className="bg-transparent outline-none border-none w-full text-[10px] md:text-sm lg:text-base text-gray-700 placeholder:text-gray-400"
          value={filters.search || ""}
          onChange={handleChange}
        />
      </div>
      <NativeSelect
        name="type_of_animal_id"
        className="bg-[#F6F8F6] border rounded-md px-1.5 md:px-2.5 py-1 md:py-1.5 w-28 md:w-48 lg:w-52 h-7 md:h-8 lg:h-9 text-[10px] md:text-sm lg:text-base text-gray-700 focus:outline-none flex-shrink-0"
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
        className="bg-[#F6F8F6] border rounded-md px-1.5 md:px-2.5 py-1 md:py-1.5 w-22 md:w-40 lg:w-44 h-7 md:h-8 lg:h-9 text-[10px] md:text-sm lg:text-base text-gray-700 focus:outline-none flex-shrink-0"
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
        className="bg-[#F6F8F6] border rounded-md px-1.5 md:px-2.5 py-1 md:py-1.5 w-18 md:w-40 lg:w-44 h-7 md:h-8 lg:h-9 text-[10px] md:text-sm lg:text-base text-gray-700 focus:outline-none flex-shrink-0"
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