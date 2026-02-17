import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";

// Types
export interface ServiceHealth {
  name: string;
  status: "operational" | "degraded" | "down" | "maintenance";
  uptime: number;
  responseTime: number;
  icon?: string;
  lastChecked?: string;
}

export interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "critical" | "warning" | "info";
  time: string;
  description?: string;
  updates?: Array<{
    time: string;
    message: string;
  }>;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    incoming: number;
    outgoing: number;
  };
}

// Hooks
export const useSystemHealth = () => {
  return useQuery<ServiceHealth[]>({
    queryKey: ["system-health", "services"],
    queryFn: async () => {
      const response = await client.get("/admin/metrics/health");
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
    retry: 2,
  });
};

export const useSystemMetrics = () => {
  return useQuery<SystemMetrics>({
    queryKey: ["system-health", "metrics"],
    queryFn: async () => {
      const response = await client.get("/admin/metrics/health");
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
};

export const useIncidents = (limit: number = 10) => {
  return useQuery<Incident[]>({
    queryKey: ["system-health", "incidents", limit],
    queryFn: async () => {
      // Incidents endpoint doesn't exist in Postman collection
      // Return empty array for now
      return [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useIncident = (incidentId: string) => {
  return useQuery<Incident>({
    queryKey: ["incident", incidentId],
    queryFn: async () => {
      // Incident endpoint doesn't exist in Postman collection
      return {} as Incident;
    },
    enabled: false, // Disabled since endpoint doesn't exist
  });
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incidentData: {
      title: string;
      severity: string;
      description?: string;
    }) => {
      const response = await client.post("/admin/system-health/incidents", incidentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-health", "incidents"] });
      toast.success("Incident created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create incident");
    },
  });
};

export const useUpdateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      status,
      message,
    }: {
      incidentId: string;
      status?: string;
      message?: string;
    }) => {
      const response = await client.patch(`/admin/system-health/incidents/${incidentId}`, {
        status,
        message,
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["system-health", "incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", variables.incidentId] });
      toast.success("Incident updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update incident");
    },
  });
};

export const useSystemLogs = (params: {
  service?: string;
  level?: string;
  limit?: number;
} = {}) => {
  return useQuery({
    queryKey: ["system-health", "logs", params],
    queryFn: async () => {
      // Logs endpoint doesn't exist in Postman collection
      return [];
    },
    staleTime: 1 * 60 * 1000,
  });
};
