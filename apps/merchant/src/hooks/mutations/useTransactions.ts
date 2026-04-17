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

type RefundSuccessful = {
  status: string;
  amount: number;
  txDigest: string;
  executionTime:  number;
  gasFee: number;
  platforFee: number;
  amountSent: number;
}


export const useRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ originalTxId, to, reason, twoFAKey }: { originalTxId: string; to: string; reason?: string, twoFAKey: string }) => {
      client.defaults.headers.common["2-fa-key"] = twoFAKey;
      const response = await client.post(`/user/transactions/refund`, { originalTxId, to, reason });
      return response.data.data as RefundSuccessful;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.originalTxId] });
      toast.success("Refund processed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to process refund");
    },
  });
};

export const useRetryRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, twoFAKey }: { transactionId: string, twoFAKey: string }) => {
      client.defaults.headers.common["2-fa-key"] = twoFAKey;
      const response = await client.post(`/user/transactions/refund/retry`, { transactionId });
      return response.data.data as RefundSuccessful;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.transactionId] });
      toast.success("Refund retry processed successfully");
  },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to process refund retry");
  }
  })
}

type PayoutSuccessful = {
  status: string;
  amount: number;
  txDigest: string;
  executionTime:  number;
  gasFee: number;
  platforFee: number;
  amountRecieved: number;
}

export const usePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      walletAddress, 
      network, 
      amount,
      alias,
      save,
      cryptoSettlementAccountId,
      twoFAKey
    }: { 
      amount: number; 
      network?: string; 
      walletAddress?: string;
      twoFAKey: string;
      alias?: string;
      save?: boolean;
      cryptoSettlementAccountId?: string;
    }) => {
      client.defaults.headers.common["2-fa-key"] = twoFAKey;
      
      // Scenario 1: Using presaved crypto settlement account
      if (cryptoSettlementAccountId) {
        const response = await client.post(`/user/transactions/payout/crypto`, { 
          amount, 
          cryptoSettlementAccountId 
        });
        return response.data.data as PayoutSuccessful;
      }
      
      // Scenario 2: Using new wallet address
      if (walletAddress && network) {
        const payloadData: any = {
          amount,
          walletAddress,
          network,
        };
        
        // Add save and alias if user wants to save the account
        if (save && alias) {
          payloadData.alias = alias;
          payloadData.save = true;
        }
        
        const response = await client.post(`/user/transactions/payout/crypto`, payloadData);
        return response.data.data as PayoutSuccessful;
      }
      
      throw new Error("Either cryptoSettlementAccountId or walletAddress and network must be provided");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Payout processed successfully");
    },
    onError: (error: any) => {  
      toast.error(error?.response?.data?.message || "Failed to process payout");
    }
  })
}

export const useRetryPayout = (payoutType: "crypto" | "fiat" = "crypto") => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, twoFAKey }: { transactionId: string, twoFAKey: string }) => {
      client.defaults.headers.common["2-fa-key"] = twoFAKey;
      const response = await client.post(`/user/transactions/payout/${payoutType}/retry`, { transactionId });
      return response.data.data as PayoutSuccessful;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Payout retry processed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to process payout retry");
    }
  })
}

export const useCreateFiatPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      amount, 
      accountId,
      bankCode,
      accountIdentifier,
      twoFAKey,
      save,
    }: { 
      amount: number;
      twoFAKey: string;
      accountId?: string;
      bankCode?: string;
      accountIdentifier?: string;
      save?: boolean;
    }) => {
      client.defaults.headers.common["2-fa-key"] = twoFAKey;

      const payload: any = { amount };

      // Scenario 1: Using saved account by ID
      if (accountId) {
        payload.accountId = accountId;
      } 
      // Scenario 2: Using bank code and account identifier
      else if (bankCode && accountIdentifier) {
        payload.bankCode = bankCode;
        payload.accountIdentifier = accountIdentifier;
        
        // Optionally save the account for future use
        if (save) {
          payload.save = true;
        }
      }
      // Scenario 3: No account specified, use primary account
      // (backend will use the merchant's primary saved account)

      const response = await client.post(`/user/transactions/payout/fiat`, payload);
      return response.data.data as PayoutSuccessful;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Fiat payout created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create fiat payout");
    }
  });
};

export const useGetSupoortedNetworks = () => {

  type Networks = {
    code: number;
    name: string;
    symbol: string;
    isActie: boolean;
    supportedTokens: string[];
    logoUrl: string
  }

  return useQuery({
    queryKey: ["supportedNetworks"],
    queryFn: async () => {
      const response = await client.get(`/networks`);
      return response.data.data as  Networks[];
    }
  })
}