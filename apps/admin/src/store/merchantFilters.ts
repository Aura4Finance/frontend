import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MerchantFiltersState {
  // Primary filters
  country?: string;
  businessSector?: string;
  disabled?: boolean;
  onboarded?: boolean;

  // Secondary filters
  businessName?: string;

  // Sort
  sortBy?: "businessName" | "createdAt";
  sortOrder?: "asc" | "desc";

  // Pagination
  limit: number;
  cursor?: string;
}

export interface MerchantFiltersStore extends MerchantFiltersState {
  // Actions
  setCountry: (country?: string) => void;
  setBusinessSector: (sector?: string) => void;
  setDisabled: (disabled?: boolean) => void;
  setOnboarded: (onboarded?: boolean) => void;
  setBusinessName: (name?: string) => void;
  setSortBy: (sortBy?: "businessName" | "createdAt") => void;
  setSortOrder: (sortOrder?: "asc" | "desc") => void;
  setLimit: (limit: number) => void;
  setCursor: (cursor?: string) => void;

  // Bulk actions
  setFilters: (filters: Partial<MerchantFiltersState>) => void;
  resetFilters: () => void;
  resetPagination: () => void;
}

const defaultFilters: MerchantFiltersState = {
  country: undefined,
  businessSector: undefined,
  disabled: undefined,
  onboarded: undefined,
  businessName: undefined,
  sortBy: undefined,
  sortOrder: undefined,
  limit: 10,
  cursor: undefined,
};

export const useMerchantFilters = create<MerchantFiltersStore>()(
  persist(
    (set) => ({
      ...defaultFilters,

      // Individual setters
      setCountry: (country) => set({ country, cursor: undefined }),
      setBusinessSector: (businessSector) => set({ businessSector, cursor: undefined }),
      setDisabled: (disabled) => set({ disabled, cursor: undefined }),
      setOnboarded: (onboarded) => set({ onboarded, cursor: undefined }),
      setBusinessName: (businessName) => set({ businessName, cursor: undefined }),
      setSortBy: (sortBy) => set({ sortBy, cursor: undefined }),
      setSortOrder: (sortOrder) => set({ sortOrder, cursor: undefined }),
      setLimit: (limit) => set({ limit, cursor: undefined }),
      setCursor: (cursor) => set({ cursor }),

      // Bulk actions
      setFilters: (filters) => set({ ...filters, cursor: undefined }),
      resetFilters: () => set({ ...defaultFilters }),
      resetPagination: () => set({ cursor: undefined }),
    }),
    {
      name: "merchant-filters",
      partialize: (state) => ({
        limit: state.limit,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);

// Helper to build API params from filter state
export const buildMerchantParams = (filters: MerchantFiltersState) => {
  const params: Record<string, any> = {
    limit: filters.limit,
  };

  if (filters.country) params.country = filters.country;
  if (filters.businessSector) params.businessSector = filters.businessSector;
  if (filters.disabled !== undefined) params.disabled = filters.disabled;
  if (filters.onboarded !== undefined) params.onboarded = filters.onboarded;
  if (filters.businessName) params.businessName = filters.businessName;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;
  if (filters.cursor) params.cursor = filters.cursor;

  return params;
};
