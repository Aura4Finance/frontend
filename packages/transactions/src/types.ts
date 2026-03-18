export interface Payment {
  id: string;
  refunded: boolean;
  depositAddress: string;
  wallet: {
    address: string;
  };
  txRef: string;
  currency: string;
  network: string;
  paymentMethod: string;
  redirectUrl: string;
  paylinkId: string;
}

export interface Payout {
  id: string;
  method: string;
  walletAddress: string;
  txDigest: string;
}

export interface Refund {
  id: string;
  reason: string;
  walletAddress: string;
  originalTxId: string;
  txDigest: string;
}

export interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  amountInUSDC: number;
  currency: string;
  network: string;
  mode: string;
  createdAt: string;
  confirmedAt: string;
  token: string;
  customerId?: string;
  webhookDeliveryId: string;
  profileId: string;
  customer?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    createdAt: string;
    mode: "test" | "live";
    totalSpent: number;
  };
  profile: {
    id: string;
    businessName: string;
    user: {
      email: string;
    };
  };
  payment?: Payment;
  refund?: Refund;
  payout?: Payout;
}

export interface TransactionsParams {
  page?: number;
  mode?: "test" | "live";
  limit?: number;
  cursor?: string;
  search?: string;
  status?: string;
  type?: string;
  token?: string;
  currency?: string;
  network?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  paymentMethod?: string;
  paymentLinkId?: string;
  customerId?: string;
  userId?: string;
  date?: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  nextCursor: string;
  hasNextPage: boolean;
  count: number;
}

export interface TransactionCountData {
  total: number;
  successful: number;
  pending: number;
  failed: number;
}

export type TransactionMetricsData = {
  date: string;
  label: string;
  count: number;
  volume: number;
  volumeInUSDC: number;
}[];