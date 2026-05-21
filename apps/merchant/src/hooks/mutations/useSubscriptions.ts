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

type SubscriptionPlanDetail = SubscriptionPlan & {
  subscriptions?: Subscription[];
};

type ApiResponse<T> = {
  data: T;
  message?: string;
};

type MutationResult<T> = {
  data: T;
  message?: string;
};

const getErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message || error?.message || fallback;
};

const normalizeSubscriptions = (payload: any): Subscription[] => {
  if (Array.isArray(payload)) {
    return payload as Subscription[];
  }

  if (Array.isArray(payload?.subscriptions)) {
    return payload.subscriptions as Subscription[];
  }

  if (Array.isArray(payload?.items)) {
    return payload.items as Subscription[];
  }

  return [];
};

export const useSubscriptionPlans = () => {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await client.get("/user/subscriptions/plans");
      const payload = response.data as ApiResponse<SubscriptionPlan[]>;
      return payload.data;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useSubscriptionPlan = (planId: string, enabled: boolean = true) => {
  return useQuery<SubscriptionPlanDetail>({
    queryKey: ["subscription-plan", planId],
    queryFn: async () => {
      const response = await client.get(`/user/subscriptions/plans/${planId}`);
      const payload = response.data as ApiResponse<SubscriptionPlanDetail>;
      return {
        ...payload.data,
        subscriptions: Array.isArray(payload.data?.subscriptions) ? payload.data.subscriptions : [],
      };
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
      const payload = response.data as ApiResponse<Subscription[] | { subscriptions?: Subscription[] }>;
      return normalizeSubscriptions(payload.data);
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
      const apiResponse = response.data as ApiResponse<SubscriptionPlan>;
      return {
        data: apiResponse.data,
        message: apiResponse.message,
      } satisfies MutationResult<SubscriptionPlan>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", result.data.id] });
      toast.success(result.message || "Subscription plan created successfully");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Unable to create subscription plan"));
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, payload }: { planId: string; payload: UpdateSubscriptionPlanRequest }) => {
      const response = await client.patch(`/user/subscriptions/plans/${planId}`, payload);
      const apiResponse = response.data as ApiResponse<SubscriptionPlan>;
      return {
        data: apiResponse.data,
        message: apiResponse.message,
      } satisfies MutationResult<SubscriptionPlan>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", result.data.id] });
      toast.success(result.message || "Subscription plan updated successfully");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Unable to update subscription plan"));
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await client.delete(`/user/subscriptions/plans/${planId}`);
      const apiResponse = response.data as ApiResponse<unknown>;
      return {
        data: planId,
        message: apiResponse.message,
      } satisfies MutationResult<string>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", result.data] });
      toast.success(result.message || "Subscription plan deleted successfully");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Unable to delete subscription plan"));
    },
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSubscriptionRequest) => {
      const response = await client.post("/user/subscriptions", payload);
      const apiResponse = response.data as ApiResponse<Subscription>;
      return {
        data: apiResponse.data,
        message: apiResponse.message,
      } satisfies MutationResult<Subscription>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      if (result.data.planId) {
        queryClient.invalidateQueries({ queryKey: ["subscription-plan", result.data.planId] });
      }
      if (result.data.customerId) {
        queryClient.invalidateQueries({ queryKey: ["customer-subscriptions", result.data.customerId] });
      }
      toast.success(result.message || "Subscription created successfully");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Unable to create subscription"));
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await client.post(`/user/subscriptions/${subscriptionId}/cancel`);
      const apiResponse = response.data as ApiResponse<Subscription>;
      return {
        data: apiResponse.data,
        message: apiResponse.message,
      } satisfies MutationResult<Subscription>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      if (result.data.planId) {
        queryClient.invalidateQueries({ queryKey: ["subscription-plan", result.data.planId] });
      }
      if (result.data.customerId) {
        queryClient.invalidateQueries({ queryKey: ["customer-subscriptions", result.data.customerId] });
      }
      toast.success(result.message || "Subscription canceled successfully");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Unable to cancel subscription"));
    },
  });
};
