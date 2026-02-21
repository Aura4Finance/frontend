import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types matching backend API
export type TransactionType = "PAYMENT" | "PAYOUT" | "REFUND";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export type TransactionToken = "USDC" | "BTC" | "ETH" | "EUR" | "USD";
export type PaymentMethod = "PAYMENT_LINK" | "HOSTED_CHECKOUT";
export type DatePresetInterval = 
  | "today" 
  | "yesterday" 
  | "last7days" 
  | "last30days" 
  | "thisMonth" 
  | "lastMonth" 
  | "thisYear";

export interface DateFilter {
  type: "preset" | "range";
  interval?: DatePresetInterval;
  startDate?: string;
  endDate?: string;
}

export interface TransactionFiltersState {
  // Primary filters
  type?: TransactionType;
  status?: TransactionStatus;
  token?: TransactionToken;
  
  // Date filter
  date?: DateFilter;
  
  // Secondary filters
  paymentMethod?: PaymentMethod;
  paymentLinkId?: string;
  customerId?: string;
  userId?: string;
  
  // Pagination
  limit: number;
  cursor?: string;
  
  // Search (for quick search input)
  searchQuery?: string;
}

export interface TransactionFiltersStore extends TransactionFiltersState {
  // Actions
  setType: (type?: TransactionType) => void;
  setStatus: (status?: TransactionStatus) => void;
  setToken: (token?: TransactionToken) => void;
  setDate: (date?: DateFilter) => void;
  setPaymentMethod: (method?: PaymentMethod) => void;
  setPaymentLinkId: (id?: string) => void;
  setCustomerId: (id?: string) => void;
  setUserId: (id?: string) => void;
  setLimit: (limit: number) => void;
  setCursor: (cursor?: string) => void;
  setSearchQuery: (query?: string) => void;
  
  // Bulk actions
  setFilters: (filters: Partial<TransactionFiltersState>) => void;
  resetFilters: () => void;
  resetPagination: () => void;
  
  // URL sync helpers
  getQueryParams: () => Record<string, string>;
  setFromQueryParams: (params: URLSearchParams) => void;
}

const defaultFilters: TransactionFiltersState = {
  type: undefined,
  status: undefined,
  token: undefined,
  date: undefined,
  paymentMethod: undefined,
  paymentLinkId: undefined,
  customerId: undefined,
  userId: undefined,
  limit: 10,
  cursor: undefined,
  searchQuery: undefined,
};

export const useTransactionFilters = create<TransactionFiltersStore>()(
  persist(
    (set, get) => ({
      ...defaultFilters,

      // Individual setters
      setType: (type) => set({ type, cursor: undefined }),
      setStatus: (status) => set({ status, cursor: undefined }),
      setToken: (token) => set({ token, cursor: undefined }),
      setDate: (date) => set({ date, cursor: undefined }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod, cursor: undefined }),
      setPaymentLinkId: (paymentLinkId) => set({ paymentLinkId, cursor: undefined }),
      setCustomerId: (customerId) => set({ customerId, cursor: undefined }),
      setUserId: (userId) => set({ userId, cursor: undefined }),
      setLimit: (limit) => set({ limit, cursor: undefined }),
      setCursor: (cursor) => set({ cursor }),
      setSearchQuery: (searchQuery) => set({ searchQuery, cursor: undefined }),

      // Bulk actions
      setFilters: (filters) => set({ ...filters, cursor: undefined }),
      resetFilters: () => set({ ...defaultFilters }),
      resetPagination: () => set({ cursor: undefined }),

      // URL sync helpers
      getQueryParams: () => {
        const state = get();
        const params: Record<string, string> = {};

        if (state.type) params.type = state.type;
        if (state.status) params.status = state.status;
        if (state.token) params.token = state.token;
        if (state.paymentMethod) params.paymentMethod = state.paymentMethod;
        if (state.paymentLinkId) params.paymentLinkId = state.paymentLinkId;
        if (state.customerId) params.customerId = state.customerId;
        if (state.userId) params.userId = state.userId;
        if (state.searchQuery) params.search = state.searchQuery;
        if (state.limit !== 10) params.limit = String(state.limit);
        
        // Date filter
        if (state.date) {
          params.dateType = state.date.type;
          if (state.date.type === "preset" && state.date.interval) {
            params.dateInterval = state.date.interval;
          } else if (state.date.type === "range") {
            if (state.date.startDate) params.startDate = state.date.startDate;
            if (state.date.endDate) params.endDate = state.date.endDate;
          }
        }

        return params;
      },

      setFromQueryParams: (params) => {
        const filters: Partial<TransactionFiltersState> = {};

        const type = params.get("type") as TransactionType | null;
        const status = params.get("status") as TransactionStatus | null;
        const token = params.get("token") as TransactionToken | null;
        const paymentMethod = params.get("paymentMethod") as PaymentMethod | null;
        const paymentLinkId = params.get("paymentLinkId");
        const customerId = params.get("customerId");
        const userId = params.get("userId");
        const search = params.get("search");
        const limit = params.get("limit");
        const dateType = params.get("dateType") as "preset" | "range" | null;

        if (type) filters.type = type;
        if (status) filters.status = status;
        if (token) filters.token = token;
        if (paymentMethod) filters.paymentMethod = paymentMethod;
        if (paymentLinkId) filters.paymentLinkId = paymentLinkId;
        if (customerId) filters.customerId = customerId;
        if (userId) filters.userId = userId;
        if (search) filters.searchQuery = search;
        if (limit) filters.limit = parseInt(limit, 10);

        // Date filter
        if (dateType) {
          if (dateType === "preset") {
            const interval = params.get("dateInterval") as DatePresetInterval | null;
            if (interval) {
              filters.date = { type: "preset", interval };
            }
          } else if (dateType === "range") {
            const startDate = params.get("startDate");
            const endDate = params.get("endDate");
            if (startDate && endDate) {
              filters.date = { type: "range", startDate, endDate };
            }
          }
        }

        set({ ...defaultFilters, ...filters });
      },
    }),
    {
      name: "transaction-filters",
      partialize: (state) => ({
        // Only persist these fields
        type: state.type,
        status: state.status,
        token: state.token,
        date: state.date,
        paymentMethod: state.paymentMethod,
        limit: state.limit,
      }),
    }
  )
);

// Helper to build API params from filter state
export const buildTransactionParams = (
  filters: TransactionFiltersState,
  mode: "test" | "live"
) => {
  const params: Record<string, any> = {
    mode,
    limit: filters.limit,
  };

  if (filters.type) params.type = filters.type;
  if (filters.status) params.status = filters.status;
  if (filters.token) params.token = filters.token;
  if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
  if (filters.paymentLinkId) params.paymentLinkId = filters.paymentLinkId;
  if (filters.customerId) params.customerId = filters.customerId;
  if (filters.userId) params.userId = filters.userId;
  if (filters.cursor) params.cursor = filters.cursor;

  // Date filter - flatten to startDate/endDate for the API
  if (filters.date) {
    if (filters.date.type === "preset" && filters.date.interval) {
      const { startDate, endDate } = resolveDatePreset(filters.date.interval);
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (filters.date.type === "range") {
      if (filters.date.startDate) params.startDate = filters.date.startDate;
      if (filters.date.endDate) params.endDate = filters.date.endDate;
    }
  }

  return params;
};

// Resolve date presets to actual start/end date strings
function resolveDatePreset(interval: DatePresetInterval): { startDate: string; endDate: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate: Date;
  let endDate: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1); // end of today

  switch (interval) {
    case "today":
      startDate = today;
      break;
    case "yesterday":
      startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      endDate = new Date(today.getTime() - 1);
      break;
    case "last7days":
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "last30days":
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case "thisYear":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = today;
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}
