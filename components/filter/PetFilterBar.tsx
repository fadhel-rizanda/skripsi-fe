import { Search } from "lucide-react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export function PetFilterBar() {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg p-2 flex gap-4 items-center shadow border">
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
        <NativeSelectOption value="Dog">Dog</NativeSelectOption>
        <NativeSelectOption value="Cat">Cat</NativeSelectOption>
        <NativeSelectOption value="Rabbit">Rabbit</NativeSelectOption>
        <NativeSelectOption value="Hamster">Hamster</NativeSelectOption>
        <NativeSelectOption value="Bird">Bird</NativeSelectOption>
        <NativeSelectOption value="Fish">Fish</NativeSelectOption>
        <NativeSelectOption value="Reptile">Reptile</NativeSelectOption>
      </NativeSelect>
      <NativeSelect className="bg-[#F6F8F6] border rounded-md px-3 py-2 w-40 text-gray-700 focus:outline-none">
        <NativeSelectOption value="">Any Age</NativeSelectOption>
        <NativeSelectOption value="Baby">Baby</NativeSelectOption>
        <NativeSelectOption value="Young">Young</NativeSelectOption>
        <NativeSelectOption value="Adult">Adult</NativeSelectOption>
        <NativeSelectOption value="Senior">Senior</NativeSelectOption>
      </NativeSelect>
      <NativeSelect className="bg-[#F6F8F6] border rounded-md px-3 py-2 w-40 text-gray-700 focus:outline-none">
        <NativeSelectOption value="">Tags</NativeSelectOption>
        <NativeSelectOption value="Friendly">Friendly</NativeSelectOption>
        <NativeSelectOption value="Calm">Calm</NativeSelectOption>
        <NativeSelectOption value="Playful">Playful</NativeSelectOption>
        <NativeSelectOption value="Active">Active</NativeSelectOption>
        <NativeSelectOption value="Lazy">Lazy</NativeSelectOption>
        <NativeSelectOption value="Aggressive">Aggressive</NativeSelectOption>
        <NativeSelectOption value="Shy">Shy</NativeSelectOption>
        <NativeSelectOption value="Independent">Independent</NativeSelectOption>
        <NativeSelectOption value="Affectionate">Affectionate</NativeSelectOption>
        <NativeSelectOption value="Protective">Protective</NativeSelectOption>
        <NativeSelectOption value="Curious">Curious</NativeSelectOption>
        <NativeSelectOption value="Trainable">Trainable</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
