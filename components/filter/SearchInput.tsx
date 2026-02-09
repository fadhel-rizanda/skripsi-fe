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
    <div className={`flex items-center bg-[#F6F8F6] border border-gray-300 rounded-md px-1.5 py-1 sm:px-2.5 sm:py-1.5 w-auto min-w-0 sm:min-w-[220px] h-[28px] sm:h-[32px] ${className}`}>
      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className="bg-transparent outline-none border-none w-full text-[10px] sm:text-xs text-gray-700 placeholder:text-gray-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
