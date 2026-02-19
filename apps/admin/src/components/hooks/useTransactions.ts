import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";
import { type Mode } from "../../store/mode";

interface Payment {
  id: string;
  refunded: boolean;
  depositAddress: string;
  wallet: {
    pubKey: string
  };
  txRef: string;
  paymentMethod: string;
  redirectUrl: string;
  paylinkId: string;

}

interface Payout {
  id: string;
  method: string;
  walletAddress: string;
  txDigest: string;
}

interface Refund {
  id: string;
  reason: string;
  walletAddress: string;
  originalTxId: string;
  txDigest: string;
}

// Types
export interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  amountInUSDC: number;
  mode: string;
  createdAt: string;
  confirmedAt: string;
  token: string;
  customerId?: string;
  webhookDeliveryId: string;
  profileId:  string;
  customer?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    createdAt: string;
    mode: Mode["mode"];
    totalSpent: number;
  };
  profile: {
    id: string;
    businessName: string;
    user: {
      email: string
    }
  }
  payment?: Payment;
  refund?: Refund;
  payout?: Payout;
}

interface TransactionsParams {
  page?: number;
  mode?: Mode["mode"]
  limit?: number;
  cursor?: string;
  search?: string;
  status?: string;
  type?: string;
  token?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface TransactionsResponse {
  transactions: Transaction[];
  nextCursor: string;
  hasNextPage: boolean;
  count: number;
}

interface TransactionCountData {
  total: number;
  successful: number;
  pending: number;
  failed: number;
}

type TransactionMetricsData = {
  date: string;
  label: string;
  count: number;
  volume: number;
  volumeInUSDC: number
}[]

// Hooks
export const useTransactions = (params: TransactionsParams = {}) => {
  return useQuery<TransactionsResponse>({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const response = await client.get("/admin/transactions", { params });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

export const useTransaction = (transactionId: string, enabled: boolean = true) => {
  return useQuery<Transaction>({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      const response = await client.get(`/admin/transactions/${transactionId}`);
      return response.data.data;
    },
    enabled: enabled && !!transactionId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTransactionStats = (mode: string = "test", status: undefined | "COMPLETED" | "PENDING" | "FAILED") => {
  return useQuery<TransactionMetricsData>({
    queryKey: ["transactions", "stats", mode, status ],
    queryFn: async () => {
      const response = await client.get("/admin/metrics/transactions", {
        params: { mode,  status }
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTransactionCountData = (mode: string = "test") => {
  return useQuery<TransactionCountData>({
    queryKey: ["transactions", "count-data", mode],
    queryFn: async () => {
      const response = await client.get("/admin/transactions/overview", {
        params: { mode },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};


export const useRetryTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await client.post(`/admin/transactions/${transactionId}/retry`);
      return response.data.data;
    },
    onSuccess: (_, transactionId) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", transactionId] });
      toast.success("Transaction retry initiated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to retry transaction");
    },
  });
};

export const useRefundTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, reason }: { transactionId: string; reason?: string }) => {
      const response = await client.post(`/admin/transactions/${transactionId}/refund`, { reason });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.transactionId] });
      toast.success("Refund processed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to process refund");
    },
  });
};
