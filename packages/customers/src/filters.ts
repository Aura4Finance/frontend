import type { CustomerFiltersState, AmountSpentRange, FilterOption } from "./types";

export const defaultCustomerFilters: CustomerFiltersState = {
  amountSpent: undefined,
  limit: 10,
  cursor: undefined,
};

export const amountSpentOptions: FilterOption<AmountSpentRange>[] = [
  { label: "Below $10", value: "BELOW10USDT" },
  { label: "$10 - $30", value: "FROM10TO30USDT" },
  { label: "$30 - $100", value: "FROM30TO100USDT" },
  { label: "$100 - $200", value: "FROM100TO200USDT" },
  { label: "$200 - $500", value: "FROM200TO500USDT" },
  { label: "Above $500", value: "ABOVE500USDT" },
];

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
  if (filters.cursor) params.cursor = filters.cursor;

  return params;
};
