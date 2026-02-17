import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";

// Types
export interface Transaction {
  id: string;
  customer: string;
  customerId: string;
  email: string;
  amount: number;
  token: string;
  type: "Payment" | "Payout" | "Refund" | "Withdrawal";
  status: "Completed" | "Pending" | "Failed" | "Processing";
  date: string;
  merchant: string;
  merchantId: string;
  fee?: number;
  hash?: string;
  network?: string;
  metadata?: any;
}

interface TransactionsParams {
  page?: number;
  limit?: number;
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
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TransactionCountData {
  date: string;
  all: number;
  successful: number;
  pending: number;
  failed: number;
}

interface TransactionVolumeData {
  date: string;
  ngn: number;
  usdc: number;
  usdt?: number;
  sui?: number;
  eth?: number;
}

// Hooks
export const useTransactions = (params: TransactionsParams = {}) => {
  return useQuery<TransactionsResponse>({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const response = await client.get("/admin/transactions", { params });
      return response.data;
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

export const useTransactionStats = () => {
  return useQuery({
    queryKey: ["transactions", "stats"],
    queryFn: async () => {
      const response = await client.get("/admin/metrics/transactions", {
        params: { mode: "test" }
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTransactionCountData = (mode: string = "test") => {
  return useQuery<TransactionCountData[]>({
    queryKey: ["transactions", "count-data", mode],
    queryFn: async () => {
      const response = await client.get("/admin/metrics/transactions", {
        params: { mode },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTransactionVolumeData = (mode: string = "test") => {
  return useQuery<TransactionVolumeData[]>({
    queryKey: ["transactions", "volume-data", mode],
    queryFn: async () => {
      const response = await client.get("/admin/metrics/revenue", {
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
