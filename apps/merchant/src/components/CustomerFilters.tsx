import { useState, useCallback, useEffect, useRef } from "react";
import { FiX, FiChevronDown, FiSearch } from "react-icons/fi";
import { useCustomerFilters } from "../store/customerFilters";
import { amountSpentOptions, type AmountSpentRange } from "@orafi/customers";
import { useQueryState } from "../hooks/useQueryState";

// Filter option types
interface FilterOption<T> {
  label: string;
  value: T;
}

// Dropdown component
interface DropdownProps<T> {
  label: string;
  value?: T;
  options: FilterOption<T>[];
  onChange: (value?: T) => void;
  placeholder?: string;
}

function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
          value
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <span>{label}:</span>
        <span className={value ? "text-blue-800" : "text-gray-400"}>
          {selectedOption?.label || placeholder}
        </span>
        <FiChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          <button
            onClick={() => {
              onChange(undefined);
              setIsOpen(false);
            }}
            className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${
              !value ? "bg-blue-50 text-blue-700" : "text-gray-600"
            }`}
          >
            All
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${
                value === option.value ? "bg-blue-50 text-blue-700" : "text-gray-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Active filter chip
interface ActiveFilterProps {
  label: string;
  onRemove: () => void;
}

function ActiveFilter({ label, onRemove }: ActiveFilterProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-blue-900">
        <FiX className="w-3 h-3" />
      </button>
    </span>
  );
}

// Main CustomerFilters component
interface CustomerFiltersProps {
  onApply?: () => void;
  onSearch?: (query: string) => void;
  searchLoading?: boolean;
}

export default function CustomerFilters({ onApply, onSearch, searchLoading }: CustomerFiltersProps) {
  const [localSearch, setLocalSearch] = useQueryState("search", "", {
    history: "replace",
    debounceMs: 400,
  });

  const {
    amountSpent,
    setAmountSpent,
    resetFilters,
  } = useCustomerFilters();

  // Debounced search
  useEffect(() => {
    const trimmed = localSearch.trim();
    const timer = setTimeout(() => {
      onSearch?.(trimmed);
    }, 600);
    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  // Count active filters
  const activeFilterCount = [amountSpent].filter(Boolean).length;

  // Get active filter labels for chips
  const getActiveFilters = useCallback(() => {
    const filters: { label: string; onRemove: () => void }[] = [];

    if (amountSpent) {
      const option = amountSpentOptions.find((o: FilterOption<AmountSpentRange>) => o.value === amountSpent);
      filters.push({ label: `Spent: ${option?.label}`, onRemove: () => setAmountSpent(undefined) });
    }

    return filters;
  }, [amountSpent, setAmountSpent]);

  const activeFilters = getActiveFilters();

  return (
    <div className="space-y-3 mb-4">
      {/* Primary Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search by ID or Email */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by ID or email..."
            className="w-full pl-9 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchLoading && (
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-3 w-3 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>

        {/* Primary Filter */}
        <Dropdown label="Amount Spent" value={amountSpent} options={amountSpentOptions} onChange={setAmountSpent} />

        {/* Apply Filters */}
        <button
          onClick={onApply}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>

        {/* Clear All */}
        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              resetFilters();
              onApply?.();
            }}
            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-gray-500 mr-1">Active:</span>
          {activeFilters.map((filter, index) => (
            <ActiveFilter key={index} label={filter.label} onRemove={filter.onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
