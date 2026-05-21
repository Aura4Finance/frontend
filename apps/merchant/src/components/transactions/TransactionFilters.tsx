import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FiCalendar, FiChevronDown, FiFilter, FiSearch, FiX } from "react-icons/fi";
import {
  datePresetOptions,
  paymentMethodOptions,
  transactionStatusOptions,
  transactionTypeOptions,
  type DateFilter,
  type DatePresetInterval,
  type FilterOption,
  type PaymentMethod,
  type TransactionCurrency,
  type TransactionNetwork,
  type TransactionStatus,
  type TransactionToken,
  type TransactionType,
} from "@orafi/transactions";
import { useGetSupoortedNetworks, type SupportedNetwork } from "../../hooks/mutations/useTransactions";
import { getSupportedCurrencies, type SupportedCurrency } from "../../hooks/mutations/useSettings";
import { useTransactionFilters } from "../../store/transactionFilters";
import { useQueryState } from "../../hooks/useQueryState";

type VisualFilterOption<T extends string> = FilterOption<T> & {
  iconUrl?: string;
  searchText?: string;
};

interface DropdownProps<T extends string> {
  label: string;
  value?: T;
  options: VisualFilterOption<T>[];
  onChange: (value?: T) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
  searchable = false,
  searchPlaceholder,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    if (!searchable) {
      return options;
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return options;
    }

    return options.filter((option) => {
      const haystack = [option.label, option.value, option.searchText].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [options, searchQuery, searchable]);

  const dropdownWidthClass = searchable
    ? "w-[min(18rem,calc(100vw-1rem))]"
    : "w-[min(14rem,calc(100vw-1rem))]";

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
        <span className={`inline-flex items-center gap-1.5 ${value ? "text-blue-800" : "text-gray-400"}`}>
          {selectedOption?.iconUrl && (
            <img
              src={selectedOption.iconUrl}
              alt={selectedOption.label}
              className="h-3.5 w-3.5 rounded-full object-cover"
            />
          )}
          <span>{selectedOption?.label || placeholder}</span>
        </span>
        <FiChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 max-h-72 max-w-[calc(100vw-1rem)] overflow-x-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg ${dropdownWidthClass}`}>
          {searchable && (
            <div className="border-b border-gray-100 p-2">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={searchPlaceholder || `Search ${label.toLowerCase()}...`}
                  className="w-full rounded-md border border-gray-200 py-1.5 pl-7 pr-2 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          )}
          <button
            onClick={() => {
              onChange(undefined);
              setSearchQuery("");
              setIsOpen(false);
            }}
            className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${
              !value ? "bg-blue-50 text-blue-700" : "text-gray-600"
            }`}
          >
            All
          </button>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setSearchQuery("");
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${
                value === option.value ? "bg-blue-50 text-blue-700" : "text-gray-600"
              }`}
            >
              {option.iconUrl && (
                <img
                  src={option.iconUrl}
                  alt={option.label}
                  className="h-4 w-4 flex-shrink-0 rounded-full object-cover"
                />
              )}
              {option.label}
            </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-gray-400">
              {searchable && searchQuery.trim() ? "No matching options" : "No options available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
      return datePresetOptions.find((option) => option.value === date.interval)?.label || "All Time";
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
    if (!startDate || !endDate) {
      return;
    }

    onChange({ type: "range", startDate, endDate });
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
        <div className="absolute z-50 mt-1 w-[min(16rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className="mb-3 flex gap-1">
            <button
              onClick={() => setActiveTab("preset")}
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                activeTab === "preset"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Preset
            </button>
            <button
              onClick={() => setActiveTab("range")}
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
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
                className={`w-full rounded px-2 py-1.5 text-left text-xs hover:bg-gray-50 ${
                  !date ? "bg-blue-50 text-blue-700" : "text-gray-600"
                }`}
              >
                All Time
              </button>
              {datePresetOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePresetSelect(option.value)}
                  className={`w-full rounded px-2 py-1.5 text-left text-xs hover:bg-gray-50 ${
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
            </div>
          )}
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

interface TransactionFiltersProps {
  onApply?: () => void;
  onSearch?: (id: string) => void;
  searchLoading?: boolean;
}

export default function TransactionFilters({ onApply, onSearch, searchLoading }: TransactionFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useQueryState("txSearch", "", {
    history: "replace",
    debounceMs: 400,
  });
  const { data: supportedNetworks = [], isLoading: supportedNetworksLoading } = useGetSupoortedNetworks();
  const { data: supportedCurrencies = [], isLoading: supportedCurrenciesLoading } = getSupportedCurrencies();

  const storeFilters = useTransactionFilters();
  const {
    type,
    status,
    token,
    currency,
    network,
    date,
    paymentMethod,
    customerId,
    paymentLinkId,
    subscriptionId,
    userId,
    setType,
    setStatus,
    setToken,
    setCurrency,
    setNetwork,
    setDate,
    setPaymentMethod,
    setCustomerId,
    setPaymentLinkId,
    setSubscriptionId,
    setUserId,
    resetFilters,
  } = storeFilters;

  const networkOptions = useMemo<VisualFilterOption<TransactionNetwork>[]>(
    () =>
      supportedNetworks.map((supportedNetwork: SupportedNetwork) => ({
        label: supportedNetwork.name,
        value: supportedNetwork.symbol as TransactionNetwork,
        iconUrl: supportedNetwork.logoUrl,
      })),
    [supportedNetworks]
  );

  const allTokenOptions = useMemo<VisualFilterOption<TransactionToken>[]>(() => {
    const tokenMap = new Map<string, VisualFilterOption<TransactionToken>>();

    supportedNetworks.forEach((supportedNetwork: SupportedNetwork) => {
      supportedNetwork.supportedTokens.forEach((token) => {
        if (!tokenMap.has(token.symbol)) {
          tokenMap.set(token.symbol, {
            label: token.name ? `${token.name} (${token.symbol})` : token.symbol,
            value: token.symbol as TransactionToken,
            iconUrl: token.logoUrl,
            searchText: `${token.name} ${token.symbol}`,
          });
        }
      });
    });

    return Array.from(tokenMap.values());
  }, [supportedNetworks]);

  const selectedSupportedNetwork = useMemo(
    () => supportedNetworks.find((supportedNetwork) => supportedNetwork.symbol === network),
    [supportedNetworks, network]
  );

  const tokenOptions = useMemo<VisualFilterOption<TransactionToken>[]>(() => {
    if (selectedSupportedNetwork) {
      return selectedSupportedNetwork.supportedTokens.map((token) => ({
        label: token.name ? `${token.name} (${token.symbol})` : token.symbol,
        value: token.symbol as TransactionToken,
        iconUrl: token.logoUrl,
        searchText: `${token.name} ${token.symbol}`,
      }));
    }

    return allTokenOptions;
  }, [allTokenOptions, selectedSupportedNetwork]);

  const currencyOptions = useMemo<VisualFilterOption<TransactionCurrency>[]>(
    () =>
      supportedCurrencies
        .filter((supportedCurrency: SupportedCurrency) => supportedCurrency.isActive)
        .map((supportedCurrency: SupportedCurrency) => ({
          label: `${supportedCurrency.name} (${supportedCurrency.symbol})`,
          value: supportedCurrency.symbol as TransactionCurrency,
          searchText: `${supportedCurrency.name} ${supportedCurrency.symbol} ${supportedCurrency.sign}`,
        })),
    [supportedCurrencies]
  );

  useEffect(() => {
    if (supportedNetworksLoading || !token) {
      return;
    }

    const tokenIsAvailable = tokenOptions.some((option) => option.value === token);
    if (!tokenIsAvailable) {
      setToken(undefined);
    }
  }, [supportedNetworksLoading, setToken, token, tokenOptions]);

  useEffect(() => {
    const trimmed = localSearch.trim();
    const timer = setTimeout(() => {
      onSearch?.(trimmed);
    }, 600);

    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  // Count active filters from store (applied filters)
  const activeFilterCount = [type, status, token, currency, network, date, paymentMethod, customerId, paymentLinkId, subscriptionId, userId].filter(Boolean).length;

  const getActiveFilters = useCallback(() => {
    const filters: { label: string; onRemove: () => void }[] = [];

    if (type) {
      const option = transactionTypeOptions.find((value) => value.value === type);
      filters.push({ label: `Type: ${option?.label}`, onRemove: () => setType(undefined) });
    }
    if (status) {
      const option = transactionStatusOptions.find((value) => value.value === status);
      filters.push({ label: `Status: ${option?.label}`, onRemove: () => setStatus(undefined) });
    }
    if (token) {
      const option = allTokenOptions.find((value) => value.value === token);
      filters.push({ label: `Token: ${option?.label || token}`, onRemove: () => setToken(undefined) });
    }
    if (currency) {
      const option = currencyOptions.find((value) => value.value === currency);
      filters.push({ label: `Currency: ${option?.label || currency}`, onRemove: () => setCurrency(undefined) });
    }
    if (network) {
      const option = networkOptions.find((value) => value.value === network);
      filters.push({ label: `Network: ${option?.label}`, onRemove: () => setNetwork(undefined) });
    }
    if (date) {
      const label =
        date.type === "preset"
          ? datePresetOptions.find((value) => value.value === date.interval)?.label
          : `${date.startDate} - ${date.endDate}`;
      filters.push({ label: `Date: ${label}`, onRemove: () => setDate(undefined) });
    }
    if (paymentMethod) {
      const option = paymentMethodOptions.find((value) => value.value === paymentMethod);
      filters.push({ label: `Method: ${option?.label}`, onRemove: () => setPaymentMethod(undefined) });
    }
    if (customerId) {
      filters.push({ label: `Customer: ${customerId.slice(0, 8)}...`, onRemove: () => setCustomerId(undefined) });
    }
    if (paymentLinkId) {
      filters.push({ label: `Paylink: ${paymentLinkId.slice(0, 8)}...`, onRemove: () => setPaymentLinkId(undefined) });
    }
    if (subscriptionId) {
      filters.push({ label: `Subscription: ${subscriptionId.slice(0, 8)}...`, onRemove: () => setSubscriptionId(undefined) });
    }
    if (userId) {
      filters.push({ label: `User: ${userId.slice(0, 8)}...`, onRemove: () => setUserId(undefined) });
    }

    return filters;
  }, [
    type,
    status,
    token,
    currency,
    network,
    date,
    paymentMethod,
    customerId,
    paymentLinkId,
    subscriptionId,
    userId,
    setType,
    setStatus,
    setToken,
    setCurrency,
    setNetwork,
    setDate,
    setPaymentMethod,
    setCustomerId,
    setPaymentLinkId,
    setSubscriptionId,
    setUserId,
  ]);

  const activeFilters = getActiveFilters();

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] max-w-[300px] flex-1">
          <FiSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
            placeholder="Search by transaction ID..."
            className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchLoading && (
            <svg
              className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-blue-500"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>

        <Dropdown label="Type" value={type as TransactionType | undefined} options={transactionTypeOptions} onChange={setType} />
        <Dropdown label="Status" value={status as TransactionStatus | undefined} options={transactionStatusOptions} onChange={setStatus} />
        <Dropdown
          label="Token"
          value={token as TransactionToken | undefined}
          options={tokenOptions}
          onChange={setToken}
          placeholder={supportedNetworksLoading ? "Loading..." : "All"}
          searchable
          searchPlaceholder="Search tokens..."
        />
        <Dropdown
          label="Currency"
          value={currency as TransactionCurrency | undefined}
          options={currencyOptions}
          onChange={setCurrency}
          placeholder={supportedCurrenciesLoading ? "Loading..." : "All"}
          searchable
          searchPlaceholder="Search currencies..."
        />
        <Dropdown
          label="Network"
          value={network as TransactionNetwork | undefined}
          options={networkOptions}
          onChange={setNetwork}
          placeholder={supportedNetworksLoading ? "Loading..." : "All"}
        />
        <DatePicker date={date} onChange={setDate} />

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            showAdvanced || activeFilterCount > 4
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FiFilter className="h-3 w-3" />
          More Filters
          {activeFilterCount > 4 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] text-white">
              {activeFilterCount - 4}
            </span>
          )}
        </button>

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
              onApply?.();
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Clear All
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
          <Dropdown
            label="Payment Method"
            value={paymentMethod as PaymentMethod | undefined}
            options={paymentMethodOptions}
            onChange={setPaymentMethod}
          />

          <div className="relative">
            <input
              type="text"
              value={customerId || ""}
              onChange={(event) => setCustomerId(event.target.value || undefined)}
              placeholder="Customer ID"
              className="w-36 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <input
              type="text"
              value={paymentLinkId || ""}
              onChange={(event) => setPaymentLinkId(event.target.value || undefined)}
              placeholder="Payment Link ID"
              className="w-36 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <input
              type="text"
              value={subscriptionId || ""}
              onChange={(event) => setSubscriptionId(event.target.value || undefined)}
              placeholder="Subscription ID"
              className="w-36 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <input
              type="text"
              value={userId || ""}
              onChange={(event) => setUserId(event.target.value || undefined)}
              placeholder="User ID"
              className="w-36 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-medium text-gray-500">Active:</span>
          {activeFilters.map((filter, index) => (
            <ActiveFilter key={index} label={filter.label} onRemove={filter.onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
