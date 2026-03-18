import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../../store/client";
import { toast } from "sonner";
import type {
  Transaction,
  TransactionsParams,
  TransactionsResponse,
} from "@orafi/transactions";

export const useTransactions = (params: TransactionsParams = {}) => {
  return useQuery<TransactionsResponse>({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const response = await client.get("/user/transactions", { params });
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
      const response = await client.get(`/user/transactions/${transactionId}`);
      return response.data.data;
    },
    enabled: enabled && !!transactionId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRetryTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await client.post(`/user/transactions/${transactionId}/retry`);
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
      const response = await client.post(`/user/transactions/${transactionId}/refund`, { reason });
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