import type { TransactionsParams } from "./types";

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

export interface FilterOption<T extends string> {
  label: string;
  value: T;
}

export interface TransactionFiltersState {
  type?: TransactionType;
  status?: TransactionStatus;
  token?: TransactionToken;
  currency?: TransactionCurrency;
  network?: TransactionNetwork;
  date?: DateFilter;
  paymentMethod?: PaymentMethod;
  paymentLinkId?: string;
  customerId?: string;
  userId?: string;
  limit: number;
  cursor?: string;
  searchQuery?: string;
}

export const defaultTransactionFilters: TransactionFiltersState = {
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

export const transactionTypeOptions: FilterOption<TransactionType>[] = [
  { label: "Payment", value: "PAYMENT" },
  { label: "Payout", value: "PAYOUT" },
  { label: "Refund", value: "REFUND" },
];

export const transactionStatusOptions: FilterOption<TransactionStatus>[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
];

export const transactionTokenOptions: FilterOption<TransactionToken>[] = [
  { label: "USDC", value: "USDC" },
  { label: "BTC", value: "BTC" },
  { label: "ETH", value: "ETH" },
  { label: "EUR", value: "EUR" },
  { label: "USD", value: "USD" },
];

export const transactionCurrencyOptions: FilterOption<TransactionCurrency>[] = [
  { label: "NGN", value: "NGN" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
  { label: "GHS", value: "GHS" },
  { label: "KES", value: "KES" },
];

export const transactionNetworkOptions: FilterOption<TransactionNetwork>[] = [
  { label: "Sui", value: "SUI" },
  { label: "Solana", value: "SOLANA" },
  { label: "Ethereum", value: "ETHEREUM" },
  { label: "Base", value: "BASE" },
  { label: "Polygon", value: "POLYGON" },
];

export const paymentMethodOptions: FilterOption<PaymentMethod>[] = [
  { label: "Payment Link", value: "PAYMENT_LINK" },
  { label: "Hosted Checkout", value: "HOSTED_CHECKOUT" },
];

export const datePresetOptions: FilterOption<DatePresetInterval>[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7days" },
  { label: "Last 30 Days", value: "last30days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
];

export const buildTransactionParams = (
  filters: TransactionFiltersState,
  mode: "test" | "live"
): TransactionsParams => {
  const params: TransactionsParams = {
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
  if (filters.searchQuery) params.search = filters.searchQuery;

  if (filters.date) {
    params.date = JSON.stringify(filters.date);
  }

  return params;
};