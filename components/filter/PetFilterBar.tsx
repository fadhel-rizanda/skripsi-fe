import { Search } from "lucide-react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useState } from "react";

// Tambahkan tipe FilterState dan props
type FilterState = {
  name?: string;
  age?: string;
  type_of_animal_id?: string;
  personality_tag_id?: string;
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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg p-2 flex gap-4 items-center shadow border">
      <div className="flex items-center bg-[#F6F8F6] border rounded-md px-3 py-2 w-64">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          name="name"
          placeholder="Search by name..."
          className="bg-transparent outline-none border-none w-full text-gray-700 placeholder:text-gray-400"
          value={filters.name || ""}
          onChange={handleChange}
        />
      </div>
      <NativeSelect
        name="type_of_animal_id"
        className="bg-[#F6F8F6] border rounded-md px-3 py-2 w-56 text-gray-700 focus:outline-none"
        value={filters.type_of_animal_id || ""}
        onChange={handleChange}
      >
        <NativeSelectOption value="">Type of Animal</NativeSelectOption>
        <NativeSelectOption value="019be3ef-c3a0-7367-bffe-20e2c12f34e6">Dog</NativeSelectOption>
        <NativeSelectOption value="019be3ef-c46f-7359-a279-c5511458ff87">Cat</NativeSelectOption>
        <NativeSelectOption value="019be3ef-c62d-72c2-b553-e9946aca7578">Rabbit</NativeSelectOption>
        <NativeSelectOption value="019be3ef-c6da-726d-bed2-8c30c3e9ed81">Hamster</NativeSelectOption>
        <NativeSelectOption value="019be3ef-c782-70d3-8ba4-e0753ba548f0">Bird</NativeSelectOption>
        <NativeSelectOption value="019be3ef-c83e-7339-8f87-c12cc650c1a1">Fish</NativeSelectOption>
        <NativeSelectOption value="019be3ef-c8e3-70d3-9746-8706631266e8">Reptile</NativeSelectOption>
      </NativeSelect>
      <NativeSelect
        name="age"
        className="bg-[#F6F8F6] border rounded-md px-3 py-2 w-48 text-gray-700 focus:outline-none"
        value={filters.age || ""}
        onChange={handleChange}
      >
        <NativeSelectOption value="">Any Age</NativeSelectOption>
        <NativeSelectOption value="baby">Baby</NativeSelectOption>
        <NativeSelectOption value="young">Young</NativeSelectOption>
        <NativeSelectOption value="adult">Adult</NativeSelectOption>
        <NativeSelectOption value="senior">Senior</NativeSelectOption>
      </NativeSelect>
      <NativeSelect
        name="personality_tag_id"
        className="bg-[#F6F8F6] border rounded-md px-3 py-2 w-48 text-gray-700 focus:outline-none"
        value={filters.personality_tag_id || ""}
        onChange={handleChange}
      >
        <NativeSelectOption value="">Tags</NativeSelectOption>
        <NativeSelectOption value="019be3ef-ce7b-7155-b125-a796dcfe97de">Friendly</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d00b-7128-9a40-e3bc4f8f34aa">Calm</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d158-7311-8203-6baa26fd8367">Playful</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d205-7398-a15d-7b320902d006">Active</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d2ad-71eb-a55f-bdb28bcc67e0">Lazy</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d37c-7012-862f-526ce4fc98e2">Aggressive</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d428-73f1-ae7e-70a43c6203e3">Shy</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d6ae-71ba-b8b8-ee011bd1c95d">Independent</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d765-7214-9833-e57412e3fee0">Affectionate</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d821-7155-8454-dc1154e06b80">Protective</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d8c6-701d-a3d7-69211bca24a1">Curious</NativeSelectOption>
        <NativeSelectOption value="019be3ef-d9a5-706a-ac90-1f3f0fee8ff1">Trainable</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}