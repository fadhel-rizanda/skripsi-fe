import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  name?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  name,
  isLoading = false,
  disabled = false,
  className = "",
}: FilterSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled || isLoading}
      name={name}
    >
      <SelectTrigger
        size="sm"
        className={`bg-[#F6F8F6] border-gray-300 h-auto px-2 py-1.5 sm:px-2.5 sm:py-1.5 w-auto min-w-[130px] sm:min-w-[160px] text-xs sm:text-sm ${className}`}
      >
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
