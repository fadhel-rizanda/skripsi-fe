import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchInput } from "./SearchInput";
import { FilterSelect, FilterOption } from "./FilterSelect";

type PostFilterState = {
  search?: string;
  category?: string;
  sort?: string;
};

type PostFilterBarProps = {
  onFilterChange: (newFilters: PostFilterState) => void;
};

// Example filter for Community/Post pages
export function PostFilterBar({ onFilterChange }: PostFilterBarProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  // Static options (you can also fetch from API)
  const categoryOptions: FilterOption[] = [
    { value: "discussion", label: "Discussion" },
    { value: "question", label: "Question" },
    { value: "story", label: "Story" },
    { value: "tip", label: "Tip" },
  ];

  const sortOptions: FilterOption[] = [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most Popular" },
    { value: "trending", label: "Trending" },
  ];

  // Trigger onFilterChange when filters change
  useEffect(() => {
    const filters: PostFilterState = {};
    
    if (debouncedSearch) filters.search = debouncedSearch;
    if (category) filters.category = category;
    if (sort) filters.sort = sort;

    onFilterChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, sort]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg p-3 flex flex-wrap gap-2 items-center shadow-sm border border-gray-200">
      <SearchInput
        name="search"
        value={search}
        onChange={setSearch}
        placeholder="Search posts..."
      />
      
      <FilterSelect
        name="category"
        value={category}
        onChange={setCategory}
        options={categoryOptions}
        placeholder="Category"
      />
      
      <FilterSelect
        name="sort"
        value={sort}
        onChange={setSort}
        options={sortOptions}
        placeholder="Sort By"
      />
    </div>
  );
}
