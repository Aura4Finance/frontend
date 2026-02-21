import { useState, useEffect, useCallback, useRef } from "react";
import { FiFilter, FiX, FiChevronDown, FiSearch } from "react-icons/fi";
import {
  useCustomerFilters,
  type AmountSpentRange,
} from "../../store/customerFilters";

// Filter option types
interface FilterOption<T> {
  label: string;
  value: T;
}

// Amount spent options
const amountSpentOptions: FilterOption<AmountSpentRange>[] = [
  { label: "Below $10", value: "BELOW10USDT" },
  { label: "$10 - $30", value: "FROM10TO30USDT" },
  { label: "$30 - $100", value: "FROM30TO100USDT" },
  { label: "$100 - $200", value: "FROM100TO200USDT" },
  { label: "$200 - $500", value: "FROM200TO500USDT" },
  { label: "Above $500", value: "ABOVE500USDT" },
];

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const {
    amountSpent,
    userId,
    setAmountSpent,
    setUserId,
    resetFilters,
  } = useCustomerFilters();

  // Debounced search - looks up customer by ID or email
  useEffect(() => {
    const trimmed = localSearch.trim();
    const timer = setTimeout(() => {
      onSearch?.(trimmed);
    }, 600);
    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  // Count active filters
  const activeFilterCount = [amountSpent, userId].filter(Boolean).length;

  // Get active filter labels for chips
  const getActiveFilters = useCallback(() => {
    const filters: { label: string; onRemove: () => void }[] = [];

    if (amountSpent) {
      const option = amountSpentOptions.find((o) => o.value === amountSpent);
      filters.push({ label: `Spent: ${option?.label}`, onRemove: () => setAmountSpent(undefined) });
    }
    if (userId) {
      filters.push({ label: `User: ${userId.slice(0, 8)}...`, onRemove: () => setUserId(undefined) });
    }

    return filters;
  }, [amountSpent, userId, setAmountSpent, setUserId]);

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
            placeholder="Search by customer ID or email..."
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

        {/* More Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            showAdvanced || activeFilterCount > 1
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FiFilter className="w-3 h-3" />
          More Filters
          {activeFilterCount > 1 && (
            <span className="w-4 h-4 flex items-center justify-center bg-blue-600 text-white text-[9px] rounded-full">
              {activeFilterCount - 1}
            </span>
          )}
        </button>

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

      {/* Advanced Filters (Collapsible) */}
      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
          {/* User ID */}
          <div className="relative">
            <input
              type="text"
              value={userId || ""}
              onChange={(e) => setUserId(e.target.value || undefined)}
              placeholder="User ID"
              className="w-44 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

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
