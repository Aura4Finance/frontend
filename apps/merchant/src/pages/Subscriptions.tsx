import { 
  useEffect, 
  useMemo, 
  useRef, 
  useState, 
  useCallback, 
  useLayoutEffect, 
  type CSSProperties 
} from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { 
  FiActivity, 
  FiArrowRight, 
  FiChevronDown, 
  FiChevronUp, 
  FiEdit2, 
  FiEye, 
  FiFilter, 
  FiGlobe, 
  FiLayers, 
  FiPlus, 
  FiSearch, 
  FiTrash2, 
  FiUserPlus, 
  FiUsers 
} from "react-icons/fi";
import DashboardWrapper from "@/components/DashboardWrapper";
import Modal from "@/components/utils/Modal";
import CopyButton from "@/components/utils/CopyButton";
import ErrorState from "@/components/utils/ErrorState";
import { useActiveTabStore } from "../store/activeTab";
import { useQueryState } from "../hooks/useQueryState";
import { useCustomers, useCustomer } from "../hooks/mutations/useCustomers";
import { createPortal } from "react-dom";
import { getSupportedCurrencies, 
  useSupportedNetworks 
} from "@/hooks/mutations/useSettings";
import {
  formatSubscriptionStatus,
  normalizeSubscriptionStatus,
  subscriptionStatusOptions,
  type CreateSubscriptionPlanRequest,
  type CreateSubscriptionRequest,
  type Subscription,
  type SubscriptionPlan,
  type SubscriptionStatus,
  type SubscriptionDuration,
  type UpdateSubscriptionPlanRequest,
} from "@orafi/subscriptions";
import {
  useCancelSubscription,
  useCreateSubscription,
  useCreateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useSubscriptionPlan,
  useSubscriptionPlans,
  useUpdateSubscriptionPlan,
} from "@/hooks/mutations/useSubscriptions";
import { Helmet } from "react-helmet-async";

type PlanFormState = {
  name: string;
  amount: string;
  currency: string;
  trialDays: string;
  duration: SubscriptionDuration | "";
};

type CustomerOption = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
};

type NetworkOption = {
  code: string;
  name: string;
  symbol: string;
  logoUrl?: string | null;
};

type PlanOption = SubscriptionPlan;

type SubscriptionDraftState = {
  planId: string;
  customerId: string;
  network: string;
};

const defaultPlanFormState: PlanFormState = {
  name: "",
  amount: "",
  currency: "USD",
  trialDays: "",
  duration: "",
};

const subscriptionDurationOptions: Array<{
  value: SubscriptionDuration;
  label: string;
  description: string;
  cadence: string;
}> = [
  {
    value: "WEEKLY",
    label: "Weekly",
    description: "A short billing cycle for trials, weekly access, or high-frequency plans.",
    cadence: "Bills every 7 days",
  },
  {
    value: "MONTHLY",
    label: "Monthly",
    description: "The common subscription cadence for recurring services and memberships.",
    cadence: "Bills every 30 days",
  },
  {
    value: "SIX_MONTHS",
    label: "Every 6 months",
    description: "A longer commitment with fewer renewals and a lower admin overhead.",
    cadence: "Bills twice a year",
  },
  {
    value: "YEARLY",
    label: "Yearly",
    description: "Best for annual plans, premium tiers, and customers who prefer one payment.",
    cadence: "Bills once a year",
  },
];

const getDurationOption = (duration?: string | null) =>
  subscriptionDurationOptions.find((option) => option.value === duration);

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const shortenId = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

function usePortalDropdownStyle(
  isOpen: boolean,
  anchorRef: { current: HTMLDivElement | null },
  preferredWidth: number,
  preferredHeight: number,
  zIndex = 110
) {
  const [menuStyle, setMenuStyle] = useState<CSSProperties | undefined>(undefined);

  const updatePosition = useCallback(() => {
    const anchorElement = anchorRef.current;
    if (!anchorElement || typeof window === "undefined") {
      return;
    }

    const rect = anchorElement.getBoundingClientRect();
    const viewportPadding = 8;
    const offset = 4;
    const width = Math.min(preferredWidth, window.innerWidth - viewportPadding * 2);
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, window.innerWidth - viewportPadding - width)
    );
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const openUpward = spaceBelow < Math.min(preferredHeight, 160) && spaceAbove > spaceBelow;
    const availableHeight = openUpward ? spaceAbove : spaceBelow;
    const maxHeight = Math.min(preferredHeight, Math.max(0, availableHeight));
    const top = openUpward ? Math.max(viewportPadding, rect.top - offset - maxHeight) : rect.bottom + offset;

    setMenuStyle({ position: "fixed", top, left, width, maxHeight, zIndex });
  }, [anchorRef, preferredHeight, preferredWidth, zIndex]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuStyle(undefined);
      return;
    }

    updatePosition();
    const handlePositionUpdate = () => updatePosition();

    document.addEventListener("scroll", handlePositionUpdate, true);
    window.addEventListener("resize", handlePositionUpdate);

    return () => {
      document.removeEventListener("scroll", handlePositionUpdate, true);
      window.removeEventListener("resize", handlePositionUpdate);
    };
  }, [isOpen, updatePosition]);

  return menuStyle;
}

// Using typed `SubscriptionPlan` / `Subscription` fields directly with simple fallbacks.

type CustomerPickerProps = {
  value: CustomerOption | null;
  onChange: (customer: CustomerOption | null) => void;
  placeholder?: string;
};

const CustomerPicker = ({ value, onChange, placeholder = "Select a customer" }: CustomerPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: customerResponse, isLoading } = useCustomers({
    search: debouncedSearch || undefined,
    limit: 25,
    sortOrder: "desc",
  });

  const customers = customerResponse?.customers ?? [];

  const menuStyle = usePortalDropdownStyle(isOpen, containerRef, 360, 320);

  useEffect(() => {
    if (!value) {
      setSearchInput("");
      return;
    }

    const fullName = [value.firstname, value.lastname].filter(Boolean).join(" ").trim();
    setSearchInput(fullName || value.email || value.id || "");
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 200);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  // Detect pasted/typed customer id and fetch it
  const [queryCustomerId, setQueryCustomerId] = useState<string | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      if (!trimmed) return;
      if (trimmed.length > 8 || /[-_]/.test(trimmed)) setQueryCustomerId(trimmed);
      else setQueryCustomerId(null);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: fetchedCustomer } = useCustomer(queryCustomerId || "", Boolean(queryCustomerId));
  useEffect(() => {
    if (fetchedCustomer && fetchedCustomer.id) {
      const mapped: CustomerOption = {
        id: fetchedCustomer.id,
        firstname: fetchedCustomer.firstname ?? "",
        lastname: fetchedCustomer.lastname ?? "",
        email: fetchedCustomer.email || "",
      };
      onChange(mapped);
      const fullName = [mapped.firstname, mapped.lastname].filter(Boolean).join(" ").trim();
      setSearchInput(fullName || mapped.email || mapped.id || "");
      setDebouncedSearch("");
      setIsOpen(false);
    }
  }, [fetchedCustomer, onChange]);

  useEffect(() => {
    if (!debouncedSearch) return;
    const exact = customers.find((c) => c.id === debouncedSearch);
    if (exact) {
      const mapped: CustomerOption = {
        id: exact.id,
        firstname: exact.firstname ?? "",
        lastname: exact.lastname ?? "",
        email: exact.email || "",
      };
      onChange(mapped);
      setIsOpen(false);
    }
  }, [debouncedSearch, customers, onChange]);

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setIsOpen((c) => !c)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span className={`min-w-0 flex-1 truncate ${value ? "text-gray-900" : "text-gray-400"}`}>{value ? ([value.firstname, value.lastname].filter(Boolean).join(" ").trim() || value.email || value.id) : placeholder}</span>
        <FiChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && menuStyle && createPortal(
        <div ref={menuRef} style={menuStyle} className="overflow-y-auto overflow-x-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name, email, or id" className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="max-h-64 p-2">
            <button type="button" onClick={() => { onChange(null); setSearchInput(""); setDebouncedSearch(""); setIsOpen(false); }} className="mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-gray-50">Clear selection</button>

            {isLoading ? (
              <div className="px-3 py-4 text-sm text-gray-500">Loading customers...</div>
            ) : customers.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500">No customers found.</div>
            ) : (
              <div className="space-y-1 overflow-y-auto">
                {customers.map((customer) => {
                  const selected = value?.id === customer.id;
                  const customerName = ([ customer.firstname, customer.lastname ].filter(Boolean).join(" ").trim()) as string;
                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        const mapped: CustomerOption = {
                          id: customer.id,
                          firstname: customer.firstname ?? "",
                          lastname: customer.lastname ?? "",
                          email: customer.email || "",
                        };
                        onChange(mapped);
                        setSearchInput(customerName);
                        setDebouncedSearch(customerName);
                        setIsOpen(false);
                      }}
                      className={`flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors ${selected ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50"}`}>
                      <span className="text-sm font-medium text-gray-900">{customerName}</span>
                      <span className="text-xs text-gray-500">{customer.email || "No email"}</span>
                      <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">{shortenId(customer.id)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

type NetworkPickerProps = {
  value: string;
  onChange: (network: string) => void;
  options: NetworkOption[];
  placeholder?: string;
};

const NetworkPicker = ({ value, onChange, options, placeholder = "Select network" }: NetworkPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuStyle = usePortalDropdownStyle(isOpen, containerRef, 360, 320);
  const selectedNetwork = options.find((network) => network.symbol === value);

  useEffect(() => {
    setSearchInput(selectedNetwork ? `${selectedNetwork.name} - ${selectedNetwork.symbol}` : value || "");
  }, [selectedNetwork, value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 200);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const filteredOptions = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    if (!query) {
      return options;
    }

    return options.filter((network) => {
      const haystack = [network.name, network.symbol, network.code].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [debouncedSearch, options]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex min-w-0 items-center gap-2">
          <FiGlobe className="h-4 w-4 shrink-0 text-gray-400" />
          {selectedNetwork ? (
            <>
              {selectedNetwork.logoUrl ? (
                <img src={selectedNetwork.logoUrl} alt={selectedNetwork.symbol} className="h-4 w-4 shrink-0 rounded-full object-contain" />
              ) : null}
              <span className="truncate text-gray-900">{selectedNetwork.name} ({selectedNetwork.symbol})</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <FiChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && menuStyle && createPortal(
        <div ref={menuRef} style={menuStyle} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Choose a network</p>
            <p className="mt-1 text-xs text-gray-600">Select the blockchain network for this subscription.</p>
          </div>

          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search network"
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500">No networks found.</div>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((network) => {
                  const isSelected = network.symbol === value;

                  return (
                    <button
                      key={network.code}
                      type="button"
                      onClick={() => {
                        onChange(network.symbol);
                        setSearchInput(`${network.name} - ${network.symbol}`);
                        setDebouncedSearch("");
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all ${
                        isSelected ? "border-blue-200 bg-blue-50 shadow-sm" : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                          {network.logoUrl ? (
                            <img src={network.logoUrl} alt={network.symbol} className="h-5 w-5 rounded-full object-contain" />
                          ) : (
                            <FiGlobe className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-gray-900">{network.name}</div>
                          <div className="text-xs text-gray-500">{network.symbol}</div>
                        </div>
                      </div>
                      {isSelected ? <span className="text-xs font-semibold text-blue-700">Selected</span> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

type PlanPickerProps = {
  value: string;
  onChange: (planId: string) => void;
  options: PlanOption[];
  placeholder?: string;
};

const PlanPicker = ({ value, onChange, options, placeholder = "Select a plan" }: PlanPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuStyle = usePortalDropdownStyle(isOpen, containerRef, 420, 340);
  const selectedPlan = options.find((plan) => plan.id === value);

  useEffect(() => {
    setSearchInput(selectedPlan ? `${selectedPlan.name || selectedPlan.id} - ${shortenId(selectedPlan.id)}` : value || "");
  }, [selectedPlan, value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 200);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const filteredOptions = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    if (!query) {
      return options;
    }

    return options.filter((plan) => {
      const haystack = [plan.name, plan.id, plan.currency, String(plan.amount), plan.duration, String(plan.trialDays)].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [debouncedSearch, options]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex min-w-0 items-center gap-2">
          <FiLayers className="h-4 w-4 shrink-0 text-gray-400" />
          {selectedPlan ? (
            <span className="truncate text-gray-900">
              {selectedPlan.name || selectedPlan.id} ({shortenId(selectedPlan.id)})
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <FiChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && menuStyle && createPortal(
        <div ref={menuRef} style={menuStyle} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Choose a plan</p>
            <p className="mt-1 text-xs text-gray-600">Pick the subscription plan for this customer.</p>
          </div>

          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search plan"
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500">No plans found.</div>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((plan) => {
                  const isSelected = plan.id === value;
                  const amount = typeof plan.amount === "number" ? plan.amount : Number(plan.amount as any);

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        onChange(plan.id);
                        setSearchInput(`${plan.name || plan.id} - ${shortenId(plan.id)}`);
                        setDebouncedSearch("");
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all ${
                        isSelected ? "border-blue-200 bg-blue-50 shadow-sm" : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-gray-900">{plan.name || plan.id}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>{plan.currency || "—"} {Number.isNaN(amount) ? "—" : amount.toLocaleString()}</span>
                          <span>•</span>
                          <span>{plan.duration || "—"}</span>
                          <span>•</span>
                          <span>{shortenId(plan.id)}</span>
                        </div>
                      </div>
                      {isSelected ? <span className="text-xs font-semibold text-blue-700">Selected</span> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

type CurrencyPickerProps = {
  value: string;
  onChange: (currency: string) => void;
  placeholder?: string;
};

const CurrencyPicker = ({ value, onChange, placeholder = "Select currency" }: CurrencyPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: supportedCurrencies = [] } = getSupportedCurrencies();
  const menuStyle = usePortalDropdownStyle(isOpen, containerRef, 360, 320);

  useEffect(() => {
    const selectedCurrency = supportedCurrencies.find((currency) => currency.symbol === value);
    setSearchInput(selectedCurrency ? `${selectedCurrency.name} - ${selectedCurrency.symbol}` : value || "");
  }, [supportedCurrencies, value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 200);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const filteredCurrencies = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    if (!query) {
      return supportedCurrencies;
    }

    return supportedCurrencies.filter((currency) => {
      const haystack = [currency.name, currency.symbol, currency.sign, currency.id].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [debouncedSearch, supportedCurrencies]);

  const selectedCurrency = supportedCurrencies.find((currency) => currency.symbol === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={`min-w-0 flex-1 truncate ${value ? "text-gray-900" : "text-gray-400"}`}>
          {selectedCurrency ? `${selectedCurrency.name} - ${selectedCurrency.symbol} (${selectedCurrency.sign})` : value || placeholder}
        </span>
        <FiChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && menuStyle &&
        createPortal(
          <div ref={menuRef} style={menuStyle} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 p-3">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search currency"
                  className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
              {filteredCurrencies.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500">No currencies found.</div>
              ) : (
                <div className="space-y-1">
                  {filteredCurrencies.map((currency) => {
                    const isSelected = currency.symbol === value;
                    return (
                      <button
                        key={currency.id}
                        type="button"
                        onClick={() => {
                          onChange(currency.symbol);
                          setSearchInput(`${currency.name} - ${currency.symbol}`);
                          setDebouncedSearch("");
                          setIsOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                          isSelected ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {currency.name} - {currency.symbol}
                          </div>
                          <div className="text-xs text-gray-500">{currency.sign}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

type DurationPickerProps = {
  value: SubscriptionDuration | "";
  onChange: (duration: SubscriptionDuration) => void;
  placeholder?: string;
};

const DurationPicker = ({ value, onChange, placeholder = "Select duration" }: DurationPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuStyle = usePortalDropdownStyle(isOpen, containerRef, 420, 340);
  const selectedOption = getDurationOption(value);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={`min-w-0 flex-1 truncate ${selectedOption ? "text-gray-900" : "text-gray-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && menuStyle &&
        createPortal(
          <div ref={menuRef} style={menuStyle} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">Choose a billing rhythm</p>
              <p className="mt-1 text-xs text-gray-600">Pick the cadence that best matches how often customers should renew.</p>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              <div className="space-y-1">
                {subscriptionDurationOptions.map((durationOption: (typeof subscriptionDurationOptions)[number]) => {
                  const isSelected = durationOption.value === value;

                  return (
                    <button
                      key={String(durationOption.value)}
                      type="button"
                      onClick={() => {
                        onChange(durationOption.value);
                        setIsOpen(false);
                      }}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                        isSelected
                          ? "border-blue-200 bg-blue-50 shadow-sm"
                          : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{durationOption.label}</span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 ring-1 ring-gray-200">
                              {durationOption.cadence}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-gray-600">{durationOption.description}</p>
                        </div>
                        {isSelected ? <span className="mt-0.5 text-xs font-semibold text-blue-700">Selected</span> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const getPlanTone = (_plan?: SubscriptionPlan | null) => {
  // SubscriptionPlan model doesn't include a status field — treat plans as active by default
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
};

const getSubscriptionTone = (status?: string | null) => {
  const normalized = normalizeSubscriptionStatus(status);

  switch (normalized) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 border-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "TRIALING":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-600 border-gray-200";
    case "PAST_DUE":
      return "bg-red-100 text-red-700 border-red-200";
    case "ABANDONED":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const SubscriptionStatusDropdown = ({
  value,
  onChange,
}: {
  value: SubscriptionStatus | "";
  onChange: (status: SubscriptionStatus | "") => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuStyle = usePortalDropdownStyle(isOpen, containerRef, 320, 320, 120);
  const selectedOption = subscriptionStatusOptions.find((option) => option.value === value);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          value
            ? "border-blue-200 bg-white text-gray-700 hover:border-blue-300 hover:shadow"
            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-white"
        }`}
      >
        <FiFilter className={`h-3.5 w-3.5 ${value ? "text-blue-600" : "text-gray-500"}`} />
        <span>Status</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${getSubscriptionTone(value || null)}`}>
          {selectedOption?.label || "All"}
        </span>
        <FiChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && menuStyle &&
        createPortal(
          <div ref={menuRef} style={menuStyle} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5">
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">Filter by status</p>
              <p className="mt-1 text-xs text-gray-600">Pick one to narrow the plan's subscriptions.</p>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  !value ? "bg-blue-50 text-blue-800" : "hover:bg-gray-50"
                }`}
              >
                <span className="font-medium">All statuses</span>
                {!value ? <span className="text-xs font-semibold text-blue-700">Selected</span> : null}
              </button>

              <div className="space-y-1">
                {subscriptionStatusOptions.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all ${
                        isSelected ? "border-blue-200 bg-blue-50 shadow-sm" : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${getSubscriptionTone(option.value).split(" ")[0]}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.value.replace(/_/g, " ").toLowerCase()}</div>
                        </div>
                      </div>
                      {isSelected ? <span className="text-xs font-semibold text-blue-700">Selected</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const emptyPlanForm = () => ({ ...defaultPlanFormState });
const emptySubscriptionForm = (): SubscriptionDraftState => ({
  planId: "",
  customerId: "",
  network: "",
});

const Subscriptions = () => {
  const [, setLocation] = useLocation();
  const { setActiveTab } = useActiveTabStore();
  const [planSearch, setPlanSearch] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useQueryState("planId", "", {
    history: "push",
  });
  const [subscriptionStatus, setSubscriptionStatus] = useQueryState<SubscriptionStatus | "">(
    "subscriptionStatus",
    "",
    {
      history: "replace",
      parse: (raw) => {
        if (!raw.trim()) {
          return "";
        }

        const normalized = normalizeSubscriptionStatus(raw);
        if (normalized) {
          return normalized;
        }

        throw new Error("Invalid subscription status");
      },
    }
  );

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planModalMode, setPlanModalMode] = useState<"create" | "edit">("create");
  const [planForm, setPlanForm] = useState<PlanFormState>(emptyPlanForm());
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionDraftState>(emptySubscriptionForm());
  const [selectedSubscriptionCustomer, setSelectedSubscriptionCustomer] = useState<CustomerOption | null>(null);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<Subscription | null>(null);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  const { data: plans = [], isLoading: plansLoading, error: plansError, refetch: refetchPlans } = useSubscriptionPlans();
  const { data: supportedNetworks = [] } = useSupportedNetworks();
  const {
    data: selectedPlanDetail,
    isLoading: planLoading,
    error: planError,
    refetch: refetchPlan,
  } = useSubscriptionPlan(selectedPlanId);

  const { mutate: createPlan, isPending: isCreatingPlan } = useCreateSubscriptionPlan();
  const { mutate: updatePlan, isPending: isUpdatingPlan } = useUpdateSubscriptionPlan();
  const { mutate: deletePlan, isPending: isDeletingPlan } = useDeleteSubscriptionPlan();
  const { mutate: createSubscription, isPending: isCreatingSubscription } = useCreateSubscription();
  const { mutate: cancelSubscription, isPending: isCancelingSubscription } = useCancelSubscription();

  const activeNetworks = useMemo(() => supportedNetworks.filter((network) => network.isActive), [supportedNetworks]);
  const defaultSubscriptionNetwork = activeNetworks[0]?.symbol || "";

  useEffect(() => {
    setActiveTab("Subscriptions");
  }, [setActiveTab]);

  useEffect(() => {
    if (!plans.length) {
      if (selectedPlanId) {
        setSelectedPlanId("");
      }
      return;
    }

    const selectedExists = plans.some((plan) => plan.id === selectedPlanId);
    if (!selectedPlanId || !selectedExists) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId, setSelectedPlanId]);

  useEffect(() => {
    if (!showSubscriptionModal || subscriptionForm.network || !defaultSubscriptionNetwork) {
      return;
    }

    setSubscriptionForm((current) => ({
      ...current,
      network: defaultSubscriptionNetwork,
    }));
  }, [defaultSubscriptionNetwork, showSubscriptionModal, subscriptionForm.network]);

  const selectedPlan = selectedPlanDetail ?? plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const planSubscriptions = selectedPlan?.subscriptions ?? [];

  const filteredPlans = useMemo(() => {
    const query = planSearch.trim().toLowerCase();
    if (!query) {
      return plans;
    }

    return plans.filter((plan) => {
      const haystack = [
        plan?.name || plan?.id,
        plan.id,
        plan?.currency || "USDC",
        plan?.duration || "",
        String(plan?.amount ?? ""),
        String(plan?.trialDays ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [plans, planSearch]);

  const filteredSubscriptions = useMemo(() => {
    const normalizedStatus = subscriptionStatus ? normalizeSubscriptionStatus(subscriptionStatus) : undefined;

    return [...planSubscriptions]
      .filter((subscription) => {
        if (!normalizedStatus) {
          return true;
        }

        return normalizeSubscriptionStatus(subscription.status) === normalizedStatus;
      })
      .sort((left, right) => {
        const leftDate = new Date(left.createdAt || left.startsAt || 0).getTime();
        const rightDate = new Date(right.createdAt || right.startsAt || 0).getTime();
        return rightDate - leftDate;
      });
  }, [planSubscriptions, subscriptionStatus]);

  const activeSubscriptions = useMemo(() => {
    return planSubscriptions.filter((subscription) => normalizeSubscriptionStatus(subscription.status) === "ACTIVE").length;
  }, [planSubscriptions]);

  const planCount = plans.length;
  const selectedPlanSubscriptionCount = selectedPlan?.subscriptions?.length ?? planSubscriptions.length;
  const filteredSubscriptionCount = filteredSubscriptions.length;
  const selectedPlanDuration = selectedPlan?.duration;

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setSubscriptionStatus("");
    setExpandedSubscriptionId(null);
  };

  const handleOpenCreatePlan = () => {
    setPlanModalMode("create");
    setPlanForm(emptyPlanForm());
    setShowPlanModal(true);
  };

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setPlanModalMode("edit");
    setPlanForm({
      name: plan?.name || "",
      amount: String(plan?.amount ?? ""),
      currency: plan?.currency || "USDC",
      trialDays: String(plan?.trialDays ?? ""),
      duration: (plan?.duration as SubscriptionDuration | undefined) || "",
    });
    setShowPlanModal(true);
  };

  const handlePlanFormChange = <K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) => {
    setPlanForm((current) => ({ ...current, [key]: value }));
  };

  const handleSavePlan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!planForm.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    if (!planForm.amount.trim()) {
      toast.error("Plan amount is required");
      return;
    }

    if (!planForm.duration) {
      toast.error("Select a duration");
      return;
    }

    const amount = Number(planForm.amount);
    const trialDays = planForm.trialDays.trim() ? Number(planForm.trialDays) : undefined;

    if (Number.isNaN(amount)) {
      toast.error("Plan amount must be a number");
      return;
    }

    if (trialDays !== undefined && Number.isNaN(trialDays)) {
      toast.error("Trial days must be a number");
      return;
    }

    const payload: CreateSubscriptionPlanRequest = {
      name: planForm.name.trim(),
      amount,
      currency: planForm.currency.trim().toUpperCase(),
      duration: planForm.duration,
      // API types may expect a numeric trialDays; coerce to any to satisfy the imported type
      trialDays: trialDays as any,
    };

    if (planModalMode === "create") {
      createPlan(payload, {
        onSuccess: (result) => {
          setSelectedPlanId(result.id);
          setShowPlanModal(false);
          setPlanForm(emptyPlanForm());
        },
      });
      return;
    }

    if (!selectedPlan) {
      toast.error("Select a plan before updating it");
      return;
    }

    const updatePayload: UpdateSubscriptionPlanRequest = {
      ...payload,
    };

    updatePlan(
      { planId: selectedPlan.id, payload: updatePayload },
      {
        onSuccess: () => {
          setShowPlanModal(false);
          setPlanForm(emptyPlanForm());
        },
      }
    );
  };

  const handleDeletePlan = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setShowDeletePlanModal(true);
  };

  const confirmDeletePlan = () => {
    if (!planToDelete) {
      return;
    }

    deletePlan(planToDelete.id, {
      onSuccess: () => {
        const remainingPlan = plans.find((plan) => plan.id !== planToDelete.id);
        setSelectedPlanId(remainingPlan?.id ?? "");
        setPlanToDelete(null);
        setShowDeletePlanModal(false);
      },
    });
  };

  const handleOpenSubscriptionModal = () => {
    setSubscriptionForm({
      ...emptySubscriptionForm(),
      planId: selectedPlan?.id || plans[0]?.id || "",
      network: defaultSubscriptionNetwork,
    });
    setSelectedSubscriptionCustomer(null);
    setShowSubscriptionModal(true);
  };

  const handleSubscriptionFormChange = <K extends keyof SubscriptionDraftState>(key: K, value: SubscriptionDraftState[K]) => {
    setSubscriptionForm((current) => ({ ...current, [key]: value }));
  };

  const handleSaveSubscription = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!subscriptionForm.planId.trim()) {
      toast.error("Select a plan");
      return;
    }

    if (!subscriptionForm.customerId.trim()) {
      toast.error("Select a customer");
      return;
    }

    if (!subscriptionForm.network.trim()) {
      toast.error("Select a network");
      return;
    }

    const payload: CreateSubscriptionRequest = {
      planId: subscriptionForm.planId.trim(),
      customerId: subscriptionForm.customerId.trim(),
      network: subscriptionForm.network.trim(),
    };

    createSubscription(payload, {
      onSuccess: () => {
        setShowSubscriptionModal(false);
        setSelectedSubscriptionCustomer(null);
        setSubscriptionForm(emptySubscriptionForm());
      },
    });
  };

  const handleCustomerSelection = (customer: CustomerOption | null) => {
    setSelectedSubscriptionCustomer(customer);
    setSubscriptionForm((current) => ({
      ...current,
      customerId: customer?.id || "",
    }));
  };

  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionModal(false);
    setSelectedSubscriptionCustomer(null);
    setSubscriptionForm(emptySubscriptionForm());
  };

  const handleNavigateToTransactions = (subscriptionId: string) => {
    setLocation(`/transactions?subscriptionId=${encodeURIComponent(subscriptionId)}&type=PAYMENT`);
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    setSubscriptionToCancel(subscription);
  };

  const confirmCancelSubscription = () => {
    if (!subscriptionToCancel) {
      return;
    }

    cancelSubscription(subscriptionToCancel.id, {
      onSuccess: () => {
        if (selectedPlanId) {
          refetchPlan();
        }
        setSubscriptionToCancel(null);
      },
    });
  };

  const handleRefresh = () => {
    refetchPlans();
    if (selectedPlanId) {
      refetchPlan();
    }
  };

  const selectedPlanAmount = (() => {
    const candidate = selectedPlan?.amount;
    const num = typeof candidate === "number" ? candidate : Number(candidate as any);
    return Number.isNaN(num) ? undefined : num;
  })();

  const selectedPlanCurrency = selectedPlan?.currency || "USDC";
  const selectedPlanTrialDays = selectedPlan?.trialDays ?? undefined;

  return (
    <DashboardWrapper>
      <Helmet>
        <title>Subscriptions - Dashboard</title>
        <meta name="description" content="Manage your subscription plans and customer subscriptions." />
      </Helmet>
      <div className="space-y-6 p-4 sm:p-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Plans</p>
                <p className="mt-3 text-2xl font-semibold text-gray-900">{planCount.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 ring-1 ring-inset ring-blue-100">
                <FiLayers className="h-4 w-4" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Selected plan subscriptions</p>
                <p className="mt-3 text-2xl font-semibold text-gray-900">{selectedPlanSubscriptionCount.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 ring-1 ring-inset ring-emerald-100">
                <FiUsers className="h-4 w-4" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Visible subscriptions</p>
                <p className="mt-3 text-2xl font-semibold text-gray-900">{filteredSubscriptionCount.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-2 text-violet-600 ring-1 ring-inset ring-violet-100">
                <FiEye className="h-4 w-4" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Active subscriptions</p>
                <p className="mt-3 text-2xl font-semibold text-gray-900">{activeSubscriptions.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600 ring-1 ring-inset ring-amber-100">
                <FiActivity className="h-4 w-4" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Plans</h2>
                  <p className="mt-1 text-sm text-gray-500">Create, update, and delete subscription plans.</p>
                </div>
                <button
                  onClick={handleOpenCreatePlan}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                >
                  <FiPlus className="h-4 w-4" />
                  Create
                </button>
              </div>
              <div className="relative mt-4">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={planSearch}
                  onChange={(event) => setPlanSearch(event.target.value)}
                  placeholder="Search plans"
                  className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-4">
              {plansLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="mt-3 h-3 w-1/2 rounded bg-gray-200" />
                      <div className="mt-4 flex gap-2">
                        <div className="h-8 w-16 rounded bg-gray-200" />
                        <div className="h-8 w-16 rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : plansError ? (
                <ErrorState message="Failed to load subscription plans" onRetry={handleRefresh} />
              ) : filteredPlans.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-gray-900">No plans found</p>
                  <p className="mt-1 text-sm text-gray-500">Create your first subscription plan to get started.</p>
                  <button
                    onClick={handleOpenCreatePlan}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                  >
                    <FiPlus className="h-4 w-4" />
                    Create plan
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPlans.map((plan) => {
                    const isSelected = plan.id === selectedPlanId;
                    const amount = (() => {
                      const candidate = plan?.amount;
                      const num = typeof candidate === "number" ? candidate : Number(candidate as any);
                      return Number.isNaN(num) ? undefined : num;
                    })();
                    const currency = plan?.currency || "USDC";

                    return (
                      <div
                        key={plan.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectPlan(plan.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            handleSelectPlan(plan.id);
                          }
                        }}
                        className={`w-full rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                          isSelected
                            ? "border-blue-300 bg-blue-50/70 shadow-sm"
                            : "border-gray-100 bg-white hover:border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                              <span>{shortenId(plan.id)}</span>
                              <CopyButton text={plan.id} />
                            </div>
                          </div>
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getPlanTone(plan)}`}>
                            Active
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1">
                            {amount !== undefined ? `${currency} ${amount.toLocaleString()}` : `${currency} custom`}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2.5 py-1">
                            {plan?.trialDays ? `${plan.trialDays} trial days` : "No trial"}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenEditPlan(plan);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <FiEdit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeletePlan(plan);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Plan details</h2>
                  <p className="mt-1 text-sm text-gray-500">Review the selected plan and the subscriptions attached to it.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SubscriptionStatusDropdown value={subscriptionStatus} onChange={setSubscriptionStatus} />
                  <button
                    onClick={handleOpenSubscriptionModal}
                    disabled={!selectedPlan}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiUserPlus className="h-4 w-4" />
                    Create subscription
                  </button>
                </div>
              </div>

              <div className="p-5">
                {planLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-6 w-1/2 rounded bg-gray-200" />
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                    <div className="h-24 rounded-xl bg-gray-100" />
                  </div>
                ) : planError ? (
                  <ErrorState message="Failed to load the selected plan" onRetry={handleRefresh} />
                ) : selectedPlan ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Plan</p>
                        <p className="mt-2 truncate text-lg font-semibold text-gray-900">{selectedPlan.name}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                          <span>{shortenId(selectedPlan.id)}</span>
                          <CopyButton text={selectedPlan.id} />
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Amount</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {selectedPlanAmount !== undefined ? `${selectedPlanCurrency} ${selectedPlanAmount.toLocaleString()}` : `${selectedPlanCurrency} custom`}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">Duration: {selectedPlanDuration}</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Trial</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {selectedPlanTrialDays !== undefined ? `${selectedPlanTrialDays} days` : "No trial"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Status</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">Active</p>
                        <p className="mt-1 text-sm text-gray-500">Created {formatDate(selectedPlan.createdAt)}</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Subscriptions</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{selectedPlanSubscriptionCount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-gray-900">Select a plan</p>
                    <p className="mt-1 text-sm text-gray-500">Choose a plan from the list to see its subscriptions.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Subscriptions for this plan</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Filtered by status and ready to jump into the transactions tab.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    {filteredSubscriptionCount} visible
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    {selectedPlanSubscriptionCount} total
                  </span>
                </div>
              </div>

              <div className="p-5">
                {selectedPlanSubscriptionCount === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-gray-900">No subscriptions returned for this plan</p>
                    <p className="mt-1 text-sm text-gray-500">Create a subscription to populate the list here.</p>
                  </div>
                ) : filteredSubscriptionCount === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-gray-900">No subscriptions match the selected status</p>
                    <p className="mt-1 text-sm text-gray-500">Change the filter to see other subscriptions for this plan.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSubscriptions.map((subscription) => {
                      const statusLabel = formatSubscriptionStatus(subscription.status);
                      const normalizedStatus = normalizeSubscriptionStatus(subscription.status);
                      const customer = subscription.customer;
                      const isExpanded = expandedSubscriptionId === subscription.id;
                      const customerName = [(subscription?.customer?.firstname), (subscription?.customer?.lastname)].filter(Boolean).join(" ").trim() ?? "-";
                      const customerEmail = subscription.customer?.email ??  "—";

                      return (
                        <div
                          key={subscription.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleNavigateToTransactions(subscription.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              handleNavigateToTransactions(subscription.id);
                            }
                          }}
                          className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1 space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900">{customerName}</p>
                                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getSubscriptionTone(subscription.status)}`}>
                                  {statusLabel}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                  <span>Subscription ID: {shortenId(subscription.id)}</span>
                                  <CopyButton text={subscription.id} />
                                </div>
                                {subscription.customerId ? (
                                  <div className="flex items-center gap-1.5">
                                    <span>Customer ID: {shortenId(subscription.customerId)}</span>
                                    <CopyButton text={subscription.customerId} />
                                  </div>
                                ) : null}
                              </div>

                              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                
                                <span className="rounded-full bg-gray-100 px-2.5 py-1">
                                  Started {formatDate(subscription.createdAt)}
                                </span>
                                <span className="rounded-full bg-gray-100 px-2.5 py-1">
                                  Next billing {formatDate(subscription.endsAt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleNavigateToTransactions(subscription.id);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
                              >
                                Transactions
                                <FiArrowRight className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setExpandedSubscriptionId(isExpanded ? null : subscription.id);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                {isExpanded ? "Show less" : "Show more"}
                                {isExpanded ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
                              </button>
                              {normalizedStatus !== "CANCELLED" && (
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleCancelSubscription(subscription);
                                  }}
                                  disabled={isCancelingSubscription}
                                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                              <div className="grid gap-3 md:grid-cols-3">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Customer name</p>
                                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                    <span className="truncate">{customerName}</span>
                                    <CopyButton text={customerName} />
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Customer email</p>
                                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                    <span className="break-all">{customerEmail}</span>
                                    {customerEmail !== "—" ? <CopyButton text={customerEmail} /> : null}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Customer id</p>
                                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                    <span className="break-all">{subscription.customer?.id}</span>
                                    {subscription.customer?.id ? (
                                      <CopyButton text={String(subscription.customer?.id)}/>
                                    ): null}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                                { customer?.firstname ? (
                                  <span className="rounded-full bg-white px-2.5 py-1 border border-gray-200">First name: {customer?.firstname}</span>
                                ) : null}
                                {customer?.lastname ? (
                                  <span className="rounded-full bg-white px-2.5 py-1 border border-gray-200">Last name: {customer?.lastname}</span>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={planModalMode === "create" ? "Create subscription plan" : "Update subscription plan"}
        description="Define the billing settings that will be attached to future subscriptions."
        icon={planModalMode === "create" ? <FiPlus className="h-5 w-5 text-blue-600" /> : <FiEdit2 className="h-5 w-5 text-blue-600" />}
        size="xl"
      >
        <form className="space-y-4" onSubmit={handleSavePlan}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Plan name</label>
              <input
                type="text"
                value={planForm.name}
                onChange={(event) => handlePlanFormChange("name", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Premium Plan"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={planForm.amount}
                onChange={(event) => handlePlanFormChange("amount", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Duration</label>
              <DurationPicker
                value={planForm.duration}
                onChange={(duration) => handlePlanFormChange("duration", duration)}
                placeholder="Choose duration"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
              <CurrencyPicker
                value={planForm.currency}
                onChange={(currency) => handlePlanFormChange("currency", currency)}
                placeholder="Search currencies"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Trial days</label>
              <input
                type="number"
                min="0"
                step="1"
                value={planForm.trialDays}
                onChange={(event) => handlePlanFormChange("trialDays", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPlanModal(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingPlan || isUpdatingPlan}
              className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {planModalMode === "create" ? (isCreatingPlan ? "Creating..." : "Create plan") : isUpdatingPlan ? "Updating..." : "Update plan"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showSubscriptionModal}
        onClose={handleCloseSubscriptionModal}
        title="Create subscription"
        description="Attach a customer to one of your subscription plans."
        icon={<FiUserPlus className="h-5 w-5 text-blue-600" />}
        size="wide"
      >
        <form className="space-y-4" onSubmit={handleSaveSubscription}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Plan</label>
              <PlanPicker
                value={subscriptionForm.planId}
                onChange={(planId) => handleSubscriptionFormChange("planId", planId)}
                options={plans}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Customer</label>
              <CustomerPicker value={selectedSubscriptionCustomer} onChange={handleCustomerSelection} placeholder="Search active customers" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Network</label>
              <NetworkPicker
                value={subscriptionForm.network}
                onChange={(network) => handleSubscriptionFormChange("network", network)}
                options={activeNetworks}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseSubscriptionModal}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingSubscription}
              className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingSubscription ? "Creating..." : "Create subscription"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(subscriptionToCancel)}
        onClose={() => setSubscriptionToCancel(null)}
        title="Cancel subscription"
        description="This will stop future billing for the selected customer subscription."
        icon={<FiTrash2 className="h-5 w-5 text-red-600" />}
        variant="danger"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {subscriptionToCancel ? (
              <div className="space-y-2">
                <p>
                  Are you sure you want to cancel the subscription for <span className="font-semibold">{subscriptionToCancel.customer?.email || "this customer"}</span>?
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-red-700">
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium ring-1 ring-red-100">
                    Subscription: {subscriptionToCancel.id}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium ring-1 ring-red-100">
                    Status: {formatSubscriptionStatus(subscriptionToCancel.status)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSubscriptionToCancel(null)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              No, keep subscription
            </button>
            <button
              type="button"
              onClick={confirmCancelSubscription}
              disabled={isCancelingSubscription}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelingSubscription ? "Cancelling..." : "Yes, cancel subscription"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeletePlanModal}
        onClose={() => setShowDeletePlanModal(false)}
        title="Delete subscription plan"
        description="This action will remove the plan and any future subscriptions will no longer be able to use it."
        icon={<FiTrash2 className="h-5 w-5 text-red-600" />}
        variant="danger"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {planToDelete ? (
                <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{planToDelete?.name || planToDelete?.id}</span>
                <span className="text-red-600">({shortenId(planToDelete.id)})</span>
                <CopyButton text={planToDelete.id} />
              </div>
            ) : (
              "Confirm deletion of this plan."
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeletePlanModal(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeletePlan}
              disabled={isDeletingPlan}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeletingPlan ? "Deleting..." : "Delete plan"}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardWrapper>
  );
};

export default Subscriptions;
