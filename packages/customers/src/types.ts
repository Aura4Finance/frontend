export interface Customer {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  mode?: string[];
  totalSpent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AmountSpentRange =
  | "BELOW10USDT"
  | "FROM10TO30USDT"
  | "FROM30TO100USDT"
  | "FROM100TO200USDT"
  | "FROM200TO500USDT"
  | "ABOVE500USDT";

export interface CustomersParams {
  amountSpent?: AmountSpentRange;
  limit?: number;
  cursor?: string;
  mode?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface CustomersResponse {
  customers: Customer[];
  count: number;
  nextCursor: string;
  hasNextPage: boolean;
}

export interface CustomerFiltersState {
  amountSpent?: AmountSpentRange;
  limit: number;
  cursor?: string;
}

export interface FilterOption<T extends string> {
  label: string;
  value: T;
}
