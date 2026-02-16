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
  rank: number;
  name: string;
  merchantId: string;
  revenue: number;
  transactions: number;
  growth: number;
}

interface ModeDistribution {
  name: string;
  value: number;
  color?: string;
}

interface OnboardingData {
  date: string;
  count: number;
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
  return useQuery({
    queryKey: ["merchants", "stats"],
    queryFn: async () => {
      const response = await client.get("/admin/merchants/stats");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMerchantLeaderboard = (limit: number = 5) => {
  return useQuery<MerchantLeaderboard[]>({
    queryKey: ["merchants", "leaderboard", limit],
    queryFn: async () => {
      const response = await client.get("/admin/merchants/leaderboard", {
        params: { limit },
      });
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMerchantModeDistribution = () => {
  return useQuery<ModeDistribution[]>({
    queryKey: ["merchants", "mode-distribution"],
    queryFn: async () => {
      const response = await client.get("/admin/merchants/mode-distribution");
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useMerchantOnboardingData = (days: number = 8) => {
  return useQuery<OnboardingData[]>({
    queryKey: ["merchants", "onboarding-data", days],
    queryFn: async () => {
      const response = await client.get("/admin/merchants/onboarding-data", {
        params: { days },
      });
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useMerchantTransactions = (merchantId: string, params: any = {}) => {
  return useQuery({
    queryKey: ["merchant-transactions", merchantId, params],
    queryFn: async () => {
      const response = await client.get(`/admin/merchants/${merchantId}/transactions`, { params });
      return response.data;
    },
    enabled: !!merchantId,
  });
};

export const useUpdateMerchantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ merchantId, status }: { merchantId: string; status: string }) => {
      const response = await client.patch(`/admin/merchants/${merchantId}/status`, { status });
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

export const useApproveMerchant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (merchantId: string) => {
      const response = await client.post(`/admin/merchants/${merchantId}/approve`);
      return response.data.data;
    },
    onSuccess: (_, merchantId) => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      queryClient.invalidateQueries({ queryKey: ["merchant", merchantId] });
      toast.success("Merchant approved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve merchant");
    },
  });
};

export const useRejectMerchant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ merchantId, reason }: { merchantId: string; reason: string }) => {
      const response = await client.post(`/admin/merchants/${merchantId}/reject`, { reason });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      queryClient.invalidateQueries({ queryKey: ["merchant", variables.merchantId] });
      toast.success("Merchant rejected");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject merchant");
    },
  });
};

export const useRegenerateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (merchantId: string) => {
      const response = await client.post(`/admin/merchants/${merchantId}/regenerate-api-key`);
      return response.data.data;
    },
    onSuccess: (_, merchantId) => {
      queryClient.invalidateQueries({ queryKey: ["merchant", merchantId] });
      toast.success("API key regenerated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to regenerate API key");
    },
  });
};
