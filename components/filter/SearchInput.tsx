import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  className?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...",
  name = "search",
  className = ""
}: SearchInputProps) {
  return (
    <div className={`flex items-center bg-[#F6F8F6] border border-gray-300 rounded-md px-2 py-1.5 sm:px-2.5 sm:py-1.5 w-auto min-w-[160px] sm:min-w-[220px] text-xs sm:text-sm ${className}`}>
      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mr-2 flex-shrink-0" />
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className="bg-transparent outline-none border-none w-full text-xs sm:text-sm text-gray-700 placeholder:text-gray-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
