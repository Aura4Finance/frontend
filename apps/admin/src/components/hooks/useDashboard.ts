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
      const response = await client.get("/admin/metrics/dashboard");
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
      // Mock data for USDC only (our only token for now)
      return [
        {
          name: "USDC",
          value: 100,
          color: "#2775CA"
        }
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRevenueMetrics = (mode: string = "test") => {
  return useQuery<RevenueMetric[]>({
    queryKey: ["dashboard", "revenue-metrics", mode],
    queryFn: async () => {
      const response = await client.get(`/admin/metrics/revenue`, {
        params: { mode },
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
      // Using transactions endpoint for recent activity
      const response = await client.get(`/admin/transactions`, {
        params: { limit, status: "COMPLETED" },
      });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
