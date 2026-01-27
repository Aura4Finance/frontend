import { FiSearch, FiFilter } from "react-icons/fi";
import { Input } from "@orafi/ui";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
}

const FilterBar = ({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filterOptions,
  selectedFilter,
  onFilterChange,
}: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 w-full h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
        />
      </div>
      
      {/* Filter Dropdown */}
      {filterOptions && filterOptions.length > 0 && (
        <div className="relative">
          <FiFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedFilter}
            onChange={(e) => onFilterChange?.(e.target.value)}
            className="pl-8 pr-3 h-9 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:border-blue-500 focus:ring-blue-500 appearance-none cursor-pointer min-w-[130px]"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
