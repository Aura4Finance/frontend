import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../../store/client";
import { toast } from "sonner";
import type { Customer, CustomersParams, CustomersResponse } from "@orafi/customers";

export const useCustomers = (params: CustomersParams = {}) => {
  return useQuery<CustomersResponse>({
    queryKey: ["customers", params],
    queryFn: async () => {
      const response = await client.get("/user/customers", { params });
      return response.data.data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
};

export const useCustomer = (customerId: string, enabled: boolean = true) => {
  return useQuery<Customer>({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const response = await client.get(`/user/customers/${customerId}`);
      return response.data.data.customer || response.data.data;
    },
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      await client.delete(`/user/customers/${customerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Unable to delete customer");
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ firstname, lastname, email }: { firstname: string; lastname: string; email: string }) => {
      const { data } = await client.post("/user/customers", { firstname, lastname, email });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Unable to create customer");
    },
  });
};