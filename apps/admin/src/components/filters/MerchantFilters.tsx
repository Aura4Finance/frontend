import { useState, useEffect, useCallback, useRef } from "react";
import { FiFilter, FiX, FiChevronDown, FiSearch } from "react-icons/fi";
import { useMerchantFilters } from "../../store/merchantFilters";

// Filter option types
interface FilterOption<T> {
  label: string;
  value: T;
}

// Status options (disabled = true/false)
const statusOptions: FilterOption<string>[] = [
  { label: "Active", value: "active" },
  { label: "Disabled", value: "disabled" },
];

// Onboarded options
const onboardedOptions: FilterOption<string>[] = [
  { label: "Onboarded", value: "true" },
  { label: "Not Onboarded", value: "false" },
];

// Sort options
const sortByOptions: FilterOption<"businessName" | "createdAt">[] = [
  { label: "Business Name", value: "businessName" },
  { label: "Date Created", value: "createdAt" },
];

const sortOrderOptions: FilterOption<"asc" | "desc">[] = [
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
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

// Main MerchantFilters component
interface MerchantFiltersProps {
  onApply?: () => void;
  onSearch?: (query: string) => void;
  searchLoading?: boolean;
}

export default function MerchantFilters({ onApply, onSearch, searchLoading }: MerchantFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const {
    disabled,
    onboarded,
    country,
    businessSector,
    businessName,
    sortBy,
    sortOrder,
    setDisabled,
    setOnboarded,
    setCountry,
    setBusinessSector,
    setBusinessName,
    setSortBy,
    setSortOrder,
    resetFilters,
  } = useMerchantFilters();

  // Convert disabled boolean to string for dropdown
  const statusValue = disabled === true ? "disabled" : disabled === false ? "active" : undefined;
  const handleStatusChange = (val?: string) => {
    if (val === "active") setDisabled(false);
    else if (val === "disabled") setDisabled(true);
    else setDisabled(undefined);
  };

  // Convert onboarded boolean to string for dropdown
  const onboardedValue = onboarded === true ? "true" : onboarded === false ? "false" : undefined;
  const handleOnboardedChange = (val?: string) => {
    if (val === "true") setOnboarded(true);
    else if (val === "false") setOnboarded(false);
    else setOnboarded(undefined);
  };

  // Debounced search - looks up merchant by ID or email
  useEffect(() => {
    const trimmed = localSearch.trim();
    const timer = setTimeout(() => {
      onSearch?.(trimmed);
    }, 600);
    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  // Count active filters
  const activeFilterCount = [disabled !== undefined ? "y" : undefined, onboarded !== undefined ? "y" : undefined, country, businessSector, businessName, sortBy].filter(Boolean).length;

  // Get active filter labels for chips
  const getActiveFilters = useCallback(() => {
    const filters: { label: string; onRemove: () => void }[] = [];

    if (disabled !== undefined) {
      filters.push({
        label: `Status: ${disabled ? "Disabled" : "Active"}`,
        onRemove: () => setDisabled(undefined),
      });
    }
    if (onboarded !== undefined) {
      filters.push({
        label: `Onboarded: ${onboarded ? "Yes" : "No"}`,
        onRemove: () => setOnboarded(undefined),
      });
    }
    if (country) {
      filters.push({ label: `Country: ${country}`, onRemove: () => setCountry(undefined) });
    }
    if (businessSector) {
      filters.push({ label: `Sector: ${businessSector}`, onRemove: () => setBusinessSector(undefined) });
    }
    if (businessName) {
      filters.push({ label: `Name: ${businessName.slice(0, 12)}...`, onRemove: () => setBusinessName(undefined) });
    }
    if (sortBy) {
      const opt = sortByOptions.find((o) => o.value === sortBy);
      filters.push({ label: `Sort: ${opt?.label} ${sortOrder || ""}`, onRemove: () => { setSortBy(undefined); setSortOrder(undefined); } });
    }

    return filters;
  }, [disabled, onboarded, country, businessSector, businessName, sortBy, sortOrder, setDisabled, setOnboarded, setCountry, setBusinessSector, setBusinessName, setSortBy, setSortOrder]);

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
            placeholder="Search by merchant ID or email..."
            className="w-full pl-9 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchLoading && (
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-3 w-3 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>

        {/* Primary Filters */}
        <Dropdown label="Status" value={statusValue} options={statusOptions} onChange={handleStatusChange} />
        <Dropdown label="Onboarded" value={onboardedValue} options={onboardedOptions} onChange={handleOnboardedChange} />

        {/* More Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            showAdvanced || activeFilterCount > 2
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FiFilter className="w-3 h-3" />
          More Filters
          {activeFilterCount > 2 && (
            <span className="w-4 h-4 flex items-center justify-center bg-blue-600 text-white text-[9px] rounded-full">
              {activeFilterCount - 2}
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
          {/* Country */}
          <div className="relative">
            <input
              type="text"
              value={country || ""}
              onChange={(e) => setCountry(e.target.value || undefined)}
              placeholder="Country"
              className="w-36 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Business Sector */}
          <div className="relative">
            <input
              type="text"
              value={businessSector || ""}
              onChange={(e) => setBusinessSector(e.target.value || undefined)}
              placeholder="Business Sector"
              className="w-36 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Business Name */}
          <div className="relative">
            <input
              type="text"
              value={businessName || ""}
              onChange={(e) => setBusinessName(e.target.value || undefined)}
              placeholder="Business Name"
              className="w-36 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort By */}
          <Dropdown label="Sort By" value={sortBy} options={sortByOptions} onChange={setSortBy} />

          {/* Sort Order */}
          <Dropdown label="Order" value={sortOrder} options={sortOrderOptions} onChange={setSortOrder} />
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
