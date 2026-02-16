import { useQuery } from "@tanstack/react-query";
import { client } from "../client/client";

// Types
interface DashboardStats {
  totalTransactions: number;
  totalCustomers: number;
  totalMerchants: number;
  totalRevenue: number;
  transactionsTrend?: {
    value: number;
    isPositive: boolean;
  };
  customersTrend?: {
    value: number;
    isPositive: boolean;
  };
  merchantsTrend?: {
    value: number;
    isPositive: boolean;
  };
  revenueTrend?: {
    value: number;
    isPositive: boolean;
  };
}

interface TokenDistribution {
  name: string;
  value: number;
  color?: string;
}

interface RevenueMetric {
  name: string;
  revenue: number;
  date?: string;
}

// Hooks
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const response = await client.get("/admin/dashboard/stats");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useTokenDistribution = () => {
  return useQuery<TokenDistribution[]>({
    queryKey: ["dashboard", "token-distribution"],
    queryFn: async () => {
      const response = await client.get("/admin/dashboard/token-distribution");
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRevenueMetrics = (days: number = 7) => {
  return useQuery<RevenueMetric[]>({
    queryKey: ["dashboard", "revenue-metrics", days],
    queryFn: async () => {
      const response = await client.get(`/admin/dashboard/revenue-metrics`, {
        params: { days },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ["dashboard", "recent-activity", limit],
    queryFn: async () => {
      const response = await client.get(`/admin/dashboard/recent-activity`, {
        params: { limit },
      });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
