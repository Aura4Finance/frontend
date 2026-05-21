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

const getErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message || error?.message || fallback;
};

const extractPayload = (response: any) => response?.data?.data ?? response?.data ?? response;

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

const normalizePlans = (payload: any): SubscriptionPlan[] => {
  if (Array.isArray(payload)) {
    return payload as SubscriptionPlan[];
  }

  if (Array.isArray(payload?.plans)) {
    return payload.plans as SubscriptionPlan[];
  }

  if (Array.isArray(payload?.items)) {
    return payload.items as SubscriptionPlan[];
  }

  return [];
};

const normalizePlanDetail = (payload: any): SubscriptionPlanDetail => {
  if (payload && typeof payload === "object" && "plan" in payload && payload.plan) {
    const plan = payload.plan as SubscriptionPlanDetail;
    return {
      ...plan,
      subscriptions: normalizeSubscriptions(payload.subscriptions ?? plan.subscriptions),
    };
  }

  const plan = payload as SubscriptionPlanDetail;
  return {
    ...plan,
    subscriptions: normalizeSubscriptions(plan?.subscriptions),
  };
};

const normalizeSubscription = (payload: any): Subscription => {
  if (payload && typeof payload === "object" && "subscription" in payload && payload.subscription) {
    return payload.subscription as Subscription;
  }

  return payload as Subscription;
};

export const useSubscriptionPlans = () => {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await client.get("/user/subscriptions/plans");
      return normalizePlans(extractPayload(response));
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
      return normalizePlanDetail(extractPayload(response));
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
      return normalizeSubscriptions(extractPayload(response));
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
      return normalizePlanDetail(extractPayload(response));
    },
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", plan.id] });
      toast.success("Subscription plan created successfully");
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
      return normalizePlanDetail(extractPayload(response));
    },
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", plan.id] });
      toast.success("Subscription plan updated successfully");
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
      await client.delete(`/user/subscriptions/plans/${planId}`);
      return planId;
    },
    onSuccess: (planId) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", planId] });
      toast.success("Subscription plan deleted successfully");
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
      return normalizeSubscription(extractPayload(response));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", variables.planId] });
      queryClient.invalidateQueries({ queryKey: ["customer-subscriptions", variables.customerId] });
      toast.success("Subscription created successfully");
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
      return normalizeSubscription(extractPayload(response));
    },
    onSuccess: (subscription) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", subscription.planId] });
      if (subscription.customerId) {
        queryClient.invalidateQueries({ queryKey: ["customer-subscriptions", subscription.customerId] });
      }
      toast.success("Subscription canceled successfully");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Unable to cancel subscription"));
    },
  });
};
