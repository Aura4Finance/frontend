import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";

// Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  totalTransactions: number;
  totalSpent: number;
  status: "Active" | "Inactive" | "Suspended";
  joinedDate: string;
  phoneNumber?: string;
  country?: string;
  lastActive?: string;
}

interface CustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface CustomersResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Hooks
export const useCustomers = (params: CustomersParams = {}) => {
  return useQuery<CustomersResponse>({
    queryKey: ["customers", params],
    queryFn: async () => {
      const response = await client.get("/admin/customers", { params });
      return response.data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
};

export const useCustomer = (customerId: string, enabled: boolean = true) => {
  return useQuery<Customer>({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const response = await client.get(`/admin/customers/${customerId}`);
      return response.data.data;
    },
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCustomerTransactions = (customerId: string, params: any = {}) => {
  return useQuery({
    queryKey: ["customer-transactions", customerId, params],
    queryFn: async () => {
      // Using transactions endpoint with customerId filter
      const response = await client.get(`/admin/transactions`, { 
        params: { ...params, customerId } 
      });
      return response.data;
    },
    enabled: !!customerId,
  });
};

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, status }: { customerId: string; status: string }) => {
      // Note: Status update endpoint doesn't exist in Postman collection
      // This will need to be implemented on the backend
      const response = await client.patch(`/admin/customers/${customerId}`, { status });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.customerId] });
      toast.success("Customer status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update customer status");
    },
  });
};

export const useCustomerStats = () => {
  return useQuery({
    queryKey: ["customers", "stats"],
    queryFn: async () => {
      // Using customers list to derive stats
      const response = await client.get("/admin/customers");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
