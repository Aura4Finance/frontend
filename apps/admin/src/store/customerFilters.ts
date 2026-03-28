import { create } from "zustand";

// Types matching backend validation
export type AmountSpentRange =
  | "BELOW10USDT"
  | "FROM10TO30USDT"
  | "FROM30TO100USDT"
  | "FROM100TO200USDT"
  | "FROM200TO500USDT"
  | "ABOVE500USDT";

export interface CustomerFiltersState {
  amountSpent?: AmountSpentRange;
  userId?: string;
  limit: number;
  cursor?: string;
}

export interface CustomerFiltersStore extends CustomerFiltersState {
  // Actions
  setAmountSpent: (amountSpent?: AmountSpentRange) => void;
  setUserId: (userId?: string) => void;
  setLimit: (limit: number) => void;
  setCursor: (cursor?: string) => void;

  // Bulk actions
  setFilters: (filters: Partial<CustomerFiltersState>) => void;
  resetFilters: () => void;
  resetPagination: () => void;
}

const defaultFilters: CustomerFiltersState = {
  amountSpent: undefined,
  userId: undefined,
  limit: 10,
  cursor: undefined,
};

export const useCustomerFilters = create<CustomerFiltersStore>()(
  (set) => ({
      ...defaultFilters,

      // Individual setters
      setAmountSpent: (amountSpent) => set({ amountSpent, cursor: undefined }),
      setUserId: (userId) => set({ userId, cursor: undefined }),
      setLimit: (limit) => set({ limit, cursor: undefined }),
      setCursor: (cursor) => set({ cursor }),

      // Bulk actions
      setFilters: (filters) => set({ ...filters, cursor: undefined }),
      resetFilters: () => set({ ...defaultFilters }),
      resetPagination: () => set({ cursor: undefined }),
    })
);

// Helper to build API params from filter state
export const buildCustomerParams = (
  filters: CustomerFiltersState,
  mode: "test" | "live"
) => {
  const params: Record<string, any> = {
    mode,
    limit: filters.limit,
  };

  if (filters.amountSpent) params.amountSpent = filters.amountSpent;
  if (filters.userId) params.userId = filters.userId;
  if (filters.cursor) params.cursor = filters.cursor;

  return params;
};
