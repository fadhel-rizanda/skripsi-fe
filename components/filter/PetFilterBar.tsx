import { Search } from "lucide-react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function PetFilterBar() {
  return (
    <div className="w-full bg-white rounded-lg p-2 flex gap-4 items-center shadow border">
      <div className="flex items-center bg-[#F6F8F6] border rounded-md px-3 py-2 w-64">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search by name..."
          className="bg-transparent outline-none border-none w-full text-gray-700 placeholder:text-gray-400"
        />
      </div>
      <NativeSelect className="bg-[#F6F8F6] border rounded-md px-3 py-2 w-48 text-gray-700 focus:outline-none">
        <NativeSelectOption value="">Type of Animal</NativeSelectOption>
        <NativeSelectOption value="dog">Dog</NativeSelectOption>
        <NativeSelectOption value="cat">Cat</NativeSelectOption>
        <NativeSelectOption value="rabbit">Rabbit</NativeSelectOption>
        <NativeSelectOption value="other">Other</NativeSelectOption>
      </NativeSelect>
      <NativeSelect className="bg-[#F6F8F6] border rounded-md px-3 py-2 w-40 text-gray-700 focus:outline-none">
        <NativeSelectOption value="">Any Age</NativeSelectOption>
        <NativeSelectOption value="puppy">Puppy/Kitten</NativeSelectOption>
        <NativeSelectOption value="young">Young</NativeSelectOption>
        <NativeSelectOption value="adult">Adult</NativeSelectOption>
        <NativeSelectOption value="senior">Senior</NativeSelectOption>
      </NativeSelect>
      <NativeSelect className="bg-[#F6F8F6] border rounded-md px-3 py-2 w-40 text-gray-700 focus:outline-none">
        <NativeSelectOption value="">Tags</NativeSelectOption>
        <NativeSelectOption value="vaccinated">Vaccinated</NativeSelectOption>
        <NativeSelectOption value="neutered">Neutered</NativeSelectOption>
        <NativeSelectOption value="special-needs">Special Needs</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
