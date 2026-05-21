import { create } from "zustand";
import {
  buildTransactionParams as buildSharedTransactionParams,
  defaultTransactionFilters,
  type DateFilter,
  type DatePresetInterval,
  type PaymentMethod,
  type TransactionCurrency,
  type TransactionFiltersState,
  type TransactionNetwork,
  type TransactionStatus,
  type TransactionToken,
  type TransactionType,
} from "@orafi/transactions";
import { parseNumberParam } from "../lib/queryState";

export interface TransactionFiltersStore extends TransactionFiltersState {
  setType: (type?: TransactionType) => void;
  setStatus: (status?: TransactionStatus) => void;
  setToken: (token?: TransactionToken) => void;
  setCurrency: (currency?: TransactionCurrency) => void;
  setNetwork: (network?: TransactionNetwork) => void;
  setDate: (date?: DateFilter) => void;
  setPaymentMethod: (method?: PaymentMethod) => void;
  setPaymentLinkId: (id?: string) => void;
  setSubscriptionId: (id?: string) => void;
  setCustomerId: (id?: string) => void;
  setUserId: (id?: string) => void;
  setLimit: (limit: number) => void;
  setCursor: (cursor?: string) => void;
  setSearchQuery: (query?: string) => void;
  setFilters: (filters: Partial<TransactionFiltersState>) => void;
  resetFilters: () => void;
  resetPagination: () => void;
  getQueryParams: () => Record<string, string>;
  setFromQueryParams: (params: URLSearchParams) => void;
}

export const useTransactionFilters = create<TransactionFiltersStore>()(
  (set, get) => ({
      ...defaultTransactionFilters,

      setType: (type) => set({ type, cursor: undefined }),
      setStatus: (status) => set({ status, cursor: undefined }),
      setToken: (token) => set({ token, cursor: undefined }),
      setCurrency: (currency) => set({ currency, cursor: undefined }),
      setNetwork: (network) => set({ network, cursor: undefined }),
      setDate: (date) => set({ date, cursor: undefined }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod, cursor: undefined }),
      setPaymentLinkId: (paymentLinkId) => set({ paymentLinkId, cursor: undefined }),
      setSubscriptionId: (subscriptionId) => set({ subscriptionId, cursor: undefined }),
      setCustomerId: (customerId) => set({ customerId, cursor: undefined }),
      setUserId: (userId) => set({ userId, cursor: undefined }),
      setLimit: (limit) => set({ limit, cursor: undefined }),
      setCursor: (cursor) => set({ cursor }),
      setSearchQuery: (searchQuery) => set({ searchQuery, cursor: undefined }),

      setFilters: (filters) => set({ ...filters, cursor: undefined }),
      resetFilters: () => set({ ...defaultTransactionFilters }),
      resetPagination: () => set({ cursor: undefined }),

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
        if (state.subscriptionId) params.subscriptionId = state.subscriptionId;
        if (state.customerId) params.customerId = state.customerId;
        if (state.userId) params.userId = state.userId;
        if (state.searchQuery) params.search = state.searchQuery;
        if (state.limit !== 10) params.limit = String(state.limit);
        if (state.cursor) params.cursor = state.cursor;

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
        const subscriptionId = params.get("subscriptionId");
        const customerId = params.get("customerId");
        const userId = params.get("userId");
        const search = params.get("search");
        const limit = params.get("limit");
        const cursor = params.get("cursor");
        const dateType = params.get("dateType") as "preset" | "range" | null;

        if (type) filters.type = type;
        if (status) filters.status = status;
        if (token) filters.token = token;
        if (currency) filters.currency = currency;
        if (network) filters.network = network;
        if (paymentMethod) filters.paymentMethod = paymentMethod;
        if (paymentLinkId) filters.paymentLinkId = paymentLinkId;
        if (subscriptionId) filters.subscriptionId = subscriptionId;
        if (subscriptionId && !type) filters.type = "PAYMENT";
        if (customerId) filters.customerId = customerId;
        if (userId) filters.userId = userId;
        if (search) filters.searchQuery = search;
        if (limit) filters.limit = parseNumberParam(limit, defaultTransactionFilters.limit);
        if (cursor) filters.cursor = cursor;

        if (dateType) {
          if (dateType === "preset") {
            const interval = params.get("dateInterval") as DatePresetInterval | null;
            if (interval) {
              filters.date = { type: "preset", interval };
            }
          }

          if (dateType === "range") {
            const startDate = params.get("startDate");
            const endDate = params.get("endDate");
            if (startDate && endDate) {
              filters.date = { type: "range", startDate, endDate };
            }
          }
        }

        set({ ...defaultTransactionFilters, ...filters });
      },
    })
);

export const buildTransactionParams = (
  filters: TransactionFiltersState,
  mode: "test" | "live"
) => buildSharedTransactionParams(filters, mode);
