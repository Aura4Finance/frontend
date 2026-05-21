export type SubscriptionStatus =
  | "ACTIVE"
  | "ABANDONDED"
  | "ABANDONED"
  | "PENDING"
  | "CANCELLED"
  | "PAST_DUE";

export type SubscriptionBillingInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface SubscriptionCustomer {
  id?: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface Subscription {
  id: string;
  planId?: string;
  customerId?: string;
  status: SubscriptionStatus | string;
  customer?: SubscriptionCustomer;
  amount?: number;
  currency?: string;
  startDate?: string;
  startedAt?: string;
  nextBillingAt?: string;
  canceledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface SubscriptionPlan {
  id: string;
  name?: string;
  title?: string;
  planName?: string;
  description?: string;
  amount?: number;
  price?: number;
  amountInUSDC?: number;
  value?: number;
  currency?: string;
  token?: string;
  interval?: SubscriptionBillingInterval | string;
  billingInterval?: SubscriptionBillingInterval | string;
  intervalCount?: number;
  trialDays?: number;
  isActive?: boolean;
  status?: string;
  subscriptions?: Subscription[];
  subscriptionCount?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
  count?: number;
}

export interface SubscriptionPlanResponse {
  plan: SubscriptionPlan;
  subscriptions?: Subscription[];
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  count?: number;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  description?: string;
  amount?: number;
  currency?: string;
  interval?: SubscriptionBillingInterval | string;
  intervalCount?: number;
  trialDays?: number;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface UpdateSubscriptionPlanRequest extends Partial<CreateSubscriptionPlanRequest> {}

export interface CreateSubscriptionRequest {
  planId: string;
  customerId: string;
  status?: SubscriptionStatus | string;
  startDate?: string;
  [key: string]: unknown;
}
