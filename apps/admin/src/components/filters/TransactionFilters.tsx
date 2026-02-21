import { useState, useEffect, useCallback, useRef } from "react";
import { FiFilter, FiX, FiChevronDown, FiCalendar, FiSearch } from "react-icons/fi";
import {
  useTransactionFilters,
  type TransactionType,
  type TransactionStatus,
  type TransactionToken,
  type PaymentMethod,
  type DatePresetInterval,
  type DateFilter,
} from "../../store/transactionFilters";

// Filter option types
interface FilterOption<T> {
  label: string;
  value: T;
}

// Filter options
const typeOptions: FilterOption<TransactionType>[] = [
  { label: "Payment", value: "PAYMENT" },
  { label: "Payout", value: "PAYOUT" },
  { label: "Refund", value: "REFUND" },
];

const statusOptions: FilterOption<TransactionStatus>[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
];

const tokenOptions: FilterOption<TransactionToken>[] = [
  { label: "USDC", value: "USDC" },
  { label: "BTC", value: "BTC" },
  { label: "ETH", value: "ETH" },
  { label: "EUR", value: "EUR" },
  { label: "USD", value: "USD" },
];

const paymentMethodOptions: FilterOption<PaymentMethod>[] = [
  { label: "Payment Link", value: "PAYMENT_LINK" },
  { label: "Hosted Checkout", value: "HOSTED_CHECKOUT" },
];

const datePresetOptions: FilterOption<DatePresetInterval>[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7days" },
  { label: "Last 30 Days", value: "last30days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
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
        <div className="absolute z-50 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
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

// Date picker component
interface DatePickerProps {
  date?: DateFilter;
  onChange: (date?: DateFilter) => void;
}

function DatePicker({ date, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"preset" | "range">(date?.type || "preset");
  const [startDate, setStartDate] = useState(date?.startDate || "");
  const [endDate, setEndDate] = useState(date?.endDate || "");
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

  const getDisplayText = () => {
    if (!date) return "All Time";
    if (date.type === "preset" && date.interval) {
      return datePresetOptions.find((opt) => opt.value === date.interval)?.label || "All Time";
    }
    if (date.type === "range" && date.startDate && date.endDate) {
      return `${date.startDate} - ${date.endDate}`;
    }
    return "All Time";
  };

  const handlePresetSelect = (interval: DatePresetInterval) => {
    onChange({ type: "preset", interval });
    setIsOpen(false);
  };

  const handleRangeApply = () => {
    if (startDate && endDate) {
      onChange({ type: "range", startDate, endDate });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
          date
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <FiCalendar className="w-3 h-3" />
        <span>{getDisplayText()}</span>
        <FiChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setActiveTab("preset")}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "preset"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Preset
            </button>
            <button
              onClick={() => setActiveTab("range")}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "range"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Custom Range
            </button>
          </div>

          {activeTab === "preset" ? (
            <div className="space-y-1">
              <button
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
                className={`w-full px-2 py-1.5 text-left text-xs rounded hover:bg-gray-50 ${
                  !date ? "bg-blue-50 text-blue-700" : "text-gray-600"
                }`}
              >
                All Time
              </button>
              {datePresetOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePresetSelect(option.value)}
                  className={`w-full px-2 py-1.5 text-left text-xs rounded hover:bg-gray-50 ${
                    date?.type === "preset" && date.interval === option.value
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleRangeApply}
                disabled={!startDate || !endDate}
                className="w-full py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Range
              </button>
            </div>
          )}
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

// Main TransactionFilters component
interface TransactionFiltersProps {
  onApply?: () => void;
  onSearch?: (id: string) => void;
  searchLoading?: boolean;
}

export default function TransactionFilters({ onApply, onSearch, searchLoading }: TransactionFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const {
    type,
    status,
    token,
    date,
    paymentMethod,
    customerId,
    paymentLinkId,
    userId,
    setType,
    setStatus,
    setToken,
    setDate,
    setPaymentMethod,
    setCustomerId,
    setPaymentLinkId,
    setUserId,
    setSearchQuery,
    resetFilters,
  } = useTransactionFilters();

  // Debounced search - looks up transaction by ID
  useEffect(() => {
    const trimmed = localSearch.trim();
    const timer = setTimeout(() => {
      onSearch?.(trimmed);
    }, 600);
    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  // Count active filters
  const activeFilterCount = [type, status, token, date, paymentMethod, customerId, paymentLinkId, userId].filter(Boolean).length;

  // Get active filter labels for chips
  const getActiveFilters = useCallback(() => {
    const filters: { label: string; onRemove: () => void }[] = [];

    if (type) {
      const option = typeOptions.find((o) => o.value === type);
      filters.push({ label: `Type: ${option?.label}`, onRemove: () => setType(undefined) });
    }
    if (status) {
      const option = statusOptions.find((o) => o.value === status);
      filters.push({ label: `Status: ${option?.label}`, onRemove: () => setStatus(undefined) });
    }
    if (token) {
      filters.push({ label: `Token: ${token}`, onRemove: () => setToken(undefined) });
    }
    if (date) {
      const label = date.type === "preset" 
        ? datePresetOptions.find((o) => o.value === date.interval)?.label 
        : `${date.startDate} - ${date.endDate}`;
      filters.push({ label: `Date: ${label}`, onRemove: () => setDate(undefined) });
    }
    if (paymentMethod) {
      const option = paymentMethodOptions.find((o) => o.value === paymentMethod);
      filters.push({ label: `Method: ${option?.label}`, onRemove: () => setPaymentMethod(undefined) });
    }
    if (customerId) {
      filters.push({ label: `Customer: ${customerId.slice(0, 8)}...`, onRemove: () => setCustomerId(undefined) });
    }
    if (paymentLinkId) {
      filters.push({ label: `Paylink: ${paymentLinkId.slice(0, 8)}...`, onRemove: () => setPaymentLinkId(undefined) });
    }
    if (userId) {
      filters.push({ label: `User: ${userId.slice(0, 8)}...`, onRemove: () => setUserId(undefined) });
    }

    return filters;
  }, [type, status, token, date, paymentMethod, customerId, paymentLinkId, userId, setType, setStatus, setToken, setDate, setPaymentMethod, setCustomerId, setPaymentLinkId, setUserId]);

  const activeFilters = getActiveFilters();

  return (
    <div className="space-y-3 mb-4">
      {/* Primary Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search by Transaction ID */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by transaction ID..."
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
        <Dropdown label="Type" value={type} options={typeOptions} onChange={setType} />
        <Dropdown label="Status" value={status} options={statusOptions} onChange={setStatus} />
        <Dropdown label="Token" value={token} options={tokenOptions} onChange={setToken} />
        <DatePicker date={date} onChange={setDate} />

        {/* More Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            showAdvanced || activeFilterCount > 4
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FiFilter className="w-3 h-3" />
          More Filters
          {activeFilterCount > 4 && (
            <span className="w-4 h-4 flex items-center justify-center bg-blue-600 text-white text-[9px] rounded-full">
              {activeFilterCount - 4}
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
          <Dropdown
            label="Payment Method"
            value={paymentMethod}
            options={paymentMethodOptions}
            onChange={setPaymentMethod}
          />

          {/* Customer ID */}
          <div className="relative">
            <input
              type="text"
              value={customerId || ""}
              onChange={(e) => setCustomerId(e.target.value || undefined)}
              placeholder="Customer ID"
              className="w-36 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Link ID */}
          <div className="relative">
            <input
              type="text"
              value={paymentLinkId || ""}
              onChange={(e) => setPaymentLinkId(e.target.value || undefined)}
              placeholder="Payment Link ID"
              className="w-36 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User ID */}
          <div className="relative">
            <input
              type="text"
              value={userId || ""}
              onChange={(e) => setUserId(e.target.value || undefined)}
              placeholder="User ID"
              className="w-36 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
