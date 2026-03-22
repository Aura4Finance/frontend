import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildCustomerParams as buildSharedCustomerParams,
  defaultCustomerFilters,
  type AmountSpentRange,
  type CustomerFiltersState,
} from "@orafi/customers";

export interface CustomerFiltersStore extends CustomerFiltersState {
  // State is inherited from CustomerFiltersState
  
  // Actions
  setAmountSpent: (amountSpent?: AmountSpentRange) => void;
  setLimit: (limit: number) => void;
  setCursor: (cursor?: string) => void;
  setFilters: (filters: Partial<CustomerFiltersState>) => void;
  resetFilters: () => void;
  resetPagination: () => void;
}

export const useCustomerFilters = create<CustomerFiltersStore>()(
  persist(
    (set) => ({
      ...defaultCustomerFilters,

      setAmountSpent: (amountSpent) => set({ amountSpent, cursor: undefined }),
      setLimit: (limit) => set({ limit, cursor: undefined }),
      setCursor: (cursor) => set({ cursor }),
      setFilters: (filters) => set({ ...filters, cursor: undefined }),
      resetFilters: () => set({ ...defaultCustomerFilters }),
      resetPagination: () => set({ cursor: undefined }),
    }),
    {
      name: "merchant-customer-filters",
      partialize: (state) => ({
        amountSpent: state.amountSpent,
        limit: state.limit,
      }),
    }
  )
);

// Helper to build API params from filter state
export const buildCustomerParams = (
  filters: CustomerFiltersState,
  mode: "test" | "live"
) => {
  return buildSharedCustomerParams(filters, mode);
};
