import { create } from "zustand";
import {
  buildCustomerParams as buildSharedCustomerParams,
  defaultCustomerFilters,
  amountSpentOptions,
  type AmountSpentRange,
  type CustomerFiltersState,
} from "@orafi/customers";
import { parseNumberParam } from "../lib/queryState";

export interface CustomerFiltersStore extends CustomerFiltersState {
  // State is inherited from CustomerFiltersState
  
  // Actions
  setAmountSpent: (amountSpent?: AmountSpentRange) => void;
  setLimit: (limit: number) => void;
  setCursor: (cursor?: string) => void;
  setFilters: (filters: Partial<CustomerFiltersState>) => void;
  resetFilters: () => void;
  resetPagination: () => void;
  getQueryParams: () => Record<string, string>;
  setFromQueryParams: (params: URLSearchParams) => void;
}

export const useCustomerFilters = create<CustomerFiltersStore>()(
  (set, get) => ({
      ...defaultCustomerFilters,

      setAmountSpent: (amountSpent) => set({ amountSpent, cursor: undefined }),
      setLimit: (limit) => set({ limit, cursor: undefined }),
      setCursor: (cursor) => set({ cursor }),
      setFilters: (filters) => set({ ...filters, cursor: undefined }),
      resetFilters: () => set({ ...defaultCustomerFilters }),
      resetPagination: () => set({ cursor: undefined }),

      getQueryParams: () => {
        const state = get();
        const params: Record<string, string> = {};

        if (state.amountSpent) params.amountSpent = state.amountSpent;
        if (state.limit !== 10) params.limit = String(state.limit);
        if (state.cursor) params.cursor = state.cursor;

        return params;
      },

      setFromQueryParams: (params) => {
        const amountSpent = params.get("amountSpent") as AmountSpentRange | null;
        const limit = params.get("limit");
        const cursor = params.get("cursor");

        const hasAmountSpent = amountSpentOptions.some((option) => option.value === amountSpent);

        set({
          ...defaultCustomerFilters,
          amountSpent: hasAmountSpent ? amountSpent || undefined : undefined,
          limit: limit ? parseNumberParam(limit, defaultCustomerFilters.limit) : defaultCustomerFilters.limit,
          cursor: cursor || undefined,
        });
      },
    })
);

// Helper to build API params from filter state
export const buildCustomerParams = (
  filters: CustomerFiltersState,
  mode: "test" | "live"
) => {
  return buildSharedCustomerParams(filters, mode);
};
