import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { FiCalendar, FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { useWebhookFilters } from "../../store/webhookFilters";
import type { Event, FilterOptions } from "../../hooks/mutations/useWehbooks";
import { useQueryState } from "../../hooks/useQueryState";

interface DropdownProps<T extends string> {
  label: string;
  value?: T;
  isLoading: boolean;
  options: { label: string; value: T }[];
  onChange: (value?: T) => void;
  placeholder?: string;
}

function Dropdown<T extends string>({
  label,
  value,
  isLoading,
  options,
  onChange,
  placeholder = "All",
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          value
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        <span>{label}:</span>
        <span className={value ? "text-blue-800" : "text-gray-400"}>{isLoading ? "loading..." : selectedOption?.label || placeholder}</span>
        <FiChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && buttonRef.current && typeof document !== "undefined"
        ? createPortal(
            <FloatingMenu anchor={buttonRef.current} onClose={() => setIsOpen(false)}>
              <div className="w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
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
                      onChange(option.value as T);
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
            </FloatingMenu>,
            document.body
          )
        : null}
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
  const buttonRef = useRef<HTMLButtonElement | null>(null);

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
        ref={buttonRef}
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

      {isOpen && buttonRef.current && typeof document !== "undefined"
        ? createPortal(
            <FloatingMenu anchor={buttonRef.current} onClose={() => setIsOpen(false)}>
              <div className="w-64 rounded-lg border border-gray-200 bg-white p-3">
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
            </FloatingMenu>,
            document.body
          )
        : null}
    </div>
  );
}

function FloatingMenu({
  anchor,
  children,
  onClose,
}: {
  anchor: HTMLElement;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const menuRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const update = () => {
      const rect = anchor.getBoundingClientRect();
      setStyle({
        position: "fixed",
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY + 6,
        zIndex: 9999,
        /* don't force minWidth to the trigger's width — that caused the menu to match the stretched button */
        maxWidth: "80vw",
        width: "auto",
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideAnchor = anchor.contains(target);
      const clickedInsideMenu = (menuRef.current && menuRef.current.contains(target)) || false;
      if (!clickedInsideAnchor && !clickedInsideMenu) onClose();
    };
    document.addEventListener("mousedown", onDocClick);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [anchor, onClose]);

  return (
    <div style={style} ref={(el) => (menuRef.current = el) as any}>
      {children}
    </div>
  );
}

interface ActiveFilterProps {
  label: string;
  onRemove: () => void;
}

function ActiveFilter({ 
  label, 
  onRemove 
}: ActiveFilterProps) {
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
  eventOptions: FilterOptions<Event>,
  isLoading: boolean,
  onApply?: () => void;
}

export default function WebhookFilters({ 
  eventOptions,
  isLoading,
  onApply 
}: WebhookFiltersProps) {
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

  const [localSearchId, setLocalSearchId] = useQueryState("transactionId", transactionId || "", {
    history: "replace",
    debounceMs: 400,
  });
  
  useEffect(() => {
    setLocalSearchId(transactionId || "");
  }, [transactionId, setLocalSearchId]);

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
        <Dropdown label="Event" isLoading={isLoading} value={event as Event | undefined} options={eventOptions} onChange={setEvent} />
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
