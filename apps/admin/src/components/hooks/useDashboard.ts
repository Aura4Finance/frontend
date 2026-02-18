import { useQuery } from "@tanstack/react-query";
import { client } from "../client/client";

type Trend = "up"|"down";
// Types
interface DashboardStats {
  customerCount: {
    percentageChange: number;
    total: number;
    trend: Trend
  };
  merchantCount: {
    percentageChange: number;
    total: number;
    trend: Trend
  };
  revenueCount: {
    amount: number;
    percentageChange: number;
    trend: Trend
  };
  transactionCount: {
    percentageChange: number;
    total: number;
    trend: Trend
  }
}

interface TokenDistribution {
  name: string;
  value: number;
  color?: string;
}

interface RevenueMetric {
  label: string;
  date?: string;
  revenueInUSDC: number;
  revenue: number;
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
