import { useState, useEffect, useCallback, useRef } from "react";
import { FiCalendar, FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { useWebhookFilters } from "../../store/webhookFilters";

interface DropdownProps<T extends string> {
  label: string;
  value?: T;
  options: { label: string; value: T }[];
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

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          value
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        <span>{label}:</span>
        <span className={value ? "text-blue-800" : "text-gray-400"}>{selectedOption?.label || placeholder}</span>
        <FiChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
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

interface DatePickerProps {
  date?: { startDate: string; endDate: string };
  onChange: (date?: { startDate: string; endDate: string }) => void;
}

function DatePicker({ date, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    if (date.startDate && date.endDate) {
      return `${date.startDate} - ${date.endDate}`;
    }
    return "All Time";
  };

  const handleRangeApply = () => {
    if (!startDate || !endDate) {
      return;
    }

    onChange({ startDate, endDate });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          date
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        <FiCalendar className="h-3 w-3" />
        <span>{getDisplayText()}</span>
        <FiChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-gray-500">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-gray-500">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleRangeApply}
              disabled={!startDate || !endDate}
              className="w-full rounded bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply Range
            </button>
            <button
              onClick={() => {
                onChange(undefined);
                setStartDate("");
                setEndDate("");
                setIsOpen(false);
              }}
              className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ActiveFilterProps {
  label: string;
  onRemove: () => void;
}

function ActiveFilter({ label, onRemove }: ActiveFilterProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
      {label}
      <button onClick={onRemove} className="hover:text-blue-900">
        <FiX className="h-3 w-3" />
      </button>
    </span>
  );
}

interface WebhookFiltersProps {
  onApply?: () => void;
}

const statusOptions = [
  { label: "Success", value: "payment.success" },
  { label: "Failed", value: "payment.failed" }
];

const eventOptions = [
  { label: "Payment Success", value: "payment.success" as const },
  { label: "Payment Failed", value: "payment.failed" as const },
];

export default function WebhookFilters({ onApply }: WebhookFiltersProps) {
  const [localSearchId, setLocalSearchId] = useState("");

  const {
    status,
    transactionId,
    event,
    date,
    setStatus,
    setTransactionId,
    setEvent,
    setDate,
    resetFilters,
  } = useWebhookFilters();

  useEffect(() => {
    const trimmed = localSearchId.trim();
    const timer = setTimeout(() => {
      setTransactionId(trimmed || undefined);
    }, 600);

    return () => clearTimeout(timer);
  }, [localSearchId, setTransactionId]);

  const activeFilterCount = [status, transactionId, event, date].filter(Boolean).length;

  const getActiveFilters = useCallback(() => {
    const filters: { label: string; onRemove: () => void }[] = [];

    if (status) {
      const option = statusOptions.find((value) => value.value === status);
      filters.push({ label: `Status: ${option?.label}`, onRemove: () => setStatus(undefined) });
    }
    if (transactionId) {
      filters.push({ label: `Transaction: ${transactionId.slice(0, 8)}...`, onRemove: () => setTransactionId(undefined) });
    }
    if (event) {
      const option = eventOptions.find((value) => value.value === event);
      filters.push({ label: `Event: ${option?.label}`, onRemove: () => setEvent(undefined) });
    }
    if (date) {
      filters.push({ label: `Date: ${date.startDate} - ${date.endDate}`, onRemove: () => setDate(undefined) });
    }

    return filters;
  }, [status, transactionId, event, date, setStatus, setTransactionId, setEvent, setDate]);

  const activeFilters = getActiveFilters();

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] max-w-[300px] flex-1">
          <FiSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localSearchId}
            onChange={(event) => setLocalSearchId(event.target.value)}
            placeholder="Search by transaction ID..."
            className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Dropdown label="Event" value={event as "payment.success" | "payment.failed" | undefined} options={eventOptions} onChange={setEvent} />
        <DatePicker date={date} onChange={setDate} />

        <button
          onClick={onApply}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        >
          Apply Filters
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              resetFilters();
              setLocalSearchId("");
              onApply?.();
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Clear All
          </button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <ActiveFilter key={index} label={filter.label} onRemove={filter.onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
