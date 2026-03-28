import { create } from "zustand";

// Types matching backend API
export type TransactionType = "PAYMENT" | "PAYOUT" | "REFUND";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export type TransactionToken = "USDC" | "BTC" | "ETH" | "EUR" | "USD";
export type TransactionCurrency = "NGN" | "USD" | "EUR" | "GBP" | "GHS" | "KES";
export type TransactionNetwork = "SUI" | "SOLANA" | "ETHEREUM" | "BASE" | "POLYGON";
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
  currency?: TransactionCurrency;
  network?: TransactionNetwork;
  
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
  setCurrency: (currency?: TransactionCurrency) => void;
  setNetwork: (network?: TransactionNetwork) => void;
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
  currency: undefined,
  network: undefined,
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
  (set, get) => ({
      ...defaultFilters,

      // Individual setters
      setType: (type) => set({ type, cursor: undefined }),
      setStatus: (status) => set({ status, cursor: undefined }),
      setToken: (token) => set({ token, cursor: undefined }),
      setCurrency: (currency) => set({ currency, cursor: undefined }),
      setNetwork: (network) => set({ network, cursor: undefined }),
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
        if (state.currency) params.currency = state.currency;
        if (state.network) params.network = state.network;
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
        const currency = params.get("currency") as TransactionCurrency | null;
        const network = params.get("network") as TransactionNetwork | null;
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
        if (currency) filters.currency = currency;
        if (network) filters.network = network;
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
    })
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
  if (filters.currency) params.currency = filters.currency;
  if (filters.network) params.network = filters.network;
  if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
  if (filters.paymentLinkId) params.paymentLinkId = filters.paymentLinkId;
  if (filters.customerId) params.customerId = filters.customerId;
  if (filters.userId) params.userId = filters.userId;
  if (filters.cursor) params.cursor = filters.cursor;

  // Date filter - send as JSON string so backend can JSON.parse it
  if (filters.date) {
    params.date = JSON.stringify(filters.date);
  }

  return params;
};
