import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import client from "../../store/client";
import type {
  CreateSubscriptionPlanRequest,
  CreateSubscriptionRequest,
  Subscription,
  SubscriptionPlan,
  UpdateSubscriptionPlanRequest,
} from "@orafi/subscriptions";

export const useSubscriptionPlans = () => {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await client.get("/user/subscriptions/plans");
      return response.data.data as SubscriptionPlan[];
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useSubscriptionPlan = (planId: string, enabled: boolean = true) => {
  return useQuery<SubscriptionPlan>({
    queryKey: ["subscription-plan", planId],
    queryFn: async () => {
      const response = await client.get(`/user/subscriptions/plans/${planId}`);
      return response.data.data as SubscriptionPlan;
    },
    enabled: enabled && !!planId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCustomerSubscriptions = (customerId: string, enabled: boolean = true) => {
  return useQuery<Subscription[]>({
    queryKey: ["customer-subscriptions", customerId],
    queryFn: async () => {
      const response = await client.get(`/user/subscriptions/customer/${customerId}`);
      return response.data.data as Subscription[];
    },
    enabled: enabled && !!customerId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSubscriptionPlanRequest) => {
      const response = await client.post("/user/subscriptions/plans", payload);
      return response.data.data as SubscriptionPlan;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", result.id] });
      toast.success("Subscription plan created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Unable to create subscription plan");
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, payload }: { planId: string; payload: UpdateSubscriptionPlanRequest }) => {
      const response = await client.patch(`/user/subscriptions/plans/${planId}`, payload);
      return response.data.data as SubscriptionPlan;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", result.id] });
      toast.success("Subscription plan updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Unable to update subscription plan");
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      await client.delete(`/user/subscriptions/plans/${planId}`);
      return planId;
    },
    onSuccess: (planId) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", planId] });
      toast.success("Subscription plan deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Unable to delete subscription plan");
    },
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSubscriptionRequest) => {
      const response = await client.post("/user/subscriptions", payload);
      return response.data.data as Subscription;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      if (result.planId) {
        queryClient.invalidateQueries({ queryKey: ["subscription-plan", result.planId] });
      }
      if (result.customerId) {
        queryClient.invalidateQueries({ queryKey: ["customer-subscriptions", result.customerId] });
      }
      toast.success("Subscription created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Unable to create subscription");
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await client.post(`/user/subscriptions/${subscriptionId}/cancel`);
      return response.data.data as Subscription;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      if (result.planId) {
        queryClient.invalidateQueries({ queryKey: ["subscription-plan", result.planId] });
      }
      if (result.customerId) {
        queryClient.invalidateQueries({ queryKey: ["customer-subscriptions", result.customerId] });
      }
      toast.success("Subscription canceled successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Unable to cancel subscription");
    },
  });
};
