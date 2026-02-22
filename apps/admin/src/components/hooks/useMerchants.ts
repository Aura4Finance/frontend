import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";

// Types
export interface Merchant {
  id: string;
  name: string;
  email: string;
  category: string;
  status: "Live" | "Test" | "Pending" | "Suspended";
  onboarded: string;
  totalRevenue: number;
  totalTransactions: number;
  apiKey?: string;
  webhookUrl?: string;
  logo?: string;
  description?: string;
  website?: string;
  contactPerson?: string;
  phoneNumber?: string;
}

interface MerchantsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface MerchantsResponse {
  data: Merchant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface MerchantLeaderboard {
  profileId: string;
  totalVolume: string;
  transactionCount: string;
  activeCustomers: string;
  score: string;
  profile: {
    businessName: string;
    country: string;
    isLive: boolean
  }
}

interface MerchantStats {
  total: number;
  live: number;
  onboarded: number;
  stats: {
    date: string;
    label: string;
    count: number;
  }[];
  leaderboard: MerchantLeaderboard[];
  revenueByMerchant: {
    averageRevenue: number;
    averageRevenueInUSDC: number;
    averageTransactionCount: number;
    totalMerchants: number;
  };
}

// Hooks
export const useMerchants = (params: MerchantsParams = {}) => {
  return useQuery<MerchantsResponse>({
    queryKey: ["merchants", params],
    queryFn: async () => {
      const response = await client.get("/admin/merchants", { params });
      return response.data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
};

export const useMerchant = (merchantId: string, enabled: boolean = true) => {
  return useQuery<Merchant>({
    queryKey: ["merchant", merchantId],
    queryFn: async () => {
      const response = await client.get(`/admin/merchants/${merchantId}`);
      return response.data.data;
    },
    enabled: enabled && !!merchantId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMerchantStats = () => {
  return useQuery<MerchantStats>({
    queryKey: ["merchants", "stats"],
    queryFn: async () => {
      const response = await client.get("/admin/metrics/merchants");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMerchantLeaderboard = (limit: number = 5) => {
  return useQuery<MerchantLeaderboard[]>({
    queryKey: ["merchants", "leaderboard", limit],
    queryFn: async () => {
      // Using merchants list endpoint and processing for leaderboard
      const response = await client.get("/admin/merchants", {
        params: { limit },
      });
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateMerchantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ merchantId, action }: { merchantId: string; action: 'enable' | 'disable' }) => {
      const endpoint = action === 'enable' ? 'enable' : 'disable';
      const response = await client.patch(`/admin/merchants/${merchantId}/${endpoint}`);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      queryClient.invalidateQueries({ queryKey: ["merchant", variables.merchantId] });
      toast.success("Merchant status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update merchant status");
    },
  });
};

