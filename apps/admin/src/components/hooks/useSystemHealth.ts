import { useQuery } from "@tanstack/react-query";
import { client } from "../client/client";

// Types
export interface ServiceHealth {
  name: string;
  status: "operational" | "degraded" | "down";
  responseTime: number;
  message?: string;
}

export interface SystemHealthData {
  status: string;
  overallStatus: string;
  timestamp: string;
  uptimeSeconds: number;
  services: ServiceHealth[];
  operationalCount: number;
  totalServices: number;
  app: {
    env: string;
    version: string;
    nodeVersion: string;
  };
  system: {
    memory: {
      rssMB: number;
      heapUsedMB: number;
      heapTotalMB: number;
    };
    cpu: {
      load1m: number;
      load5m: number;
      load15m: number;
    };
  };
}

// Hooks
export const useSystemHealth = () => {
  return useQuery<SystemHealthData>({
    queryKey: ["system-health"],
    queryFn: async () => {
      const response = await client.get("/admin/metrics/health");
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
    retry: 2,
  });
};
