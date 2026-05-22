export interface Customer {
  id: string;
  firstname?: string;
  lastname?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

export type SubscriptionStatus =
  | "ACTIVE"
  | "ABANDONDED"
  | "ABANDONED"
  | "TRAILING"
  | "PENDING"
  | "CANCELLED"
  | "PAST_DUE";

export type SubscriptionDuration = 
  | "WEEKLY"
  | "MONTHLY"
  | "SIX_MONTH"
  | "YEARLY"


export interface Subscription {
  id: string;
  mode: string;
  network: string;
  customerId: string;
  customer?: Customer;
  planId: string;
  status: SubscriptionStatus | string;
  amount?: number;
  currency?: string;
  startsAt?: string;
  startDate?: string;
  startedAt?: string;
  nextBillingAt?: string;
  nextChargeAt?: string;
  trialEndsAt?: string;
  endsAt?: string;
  canceledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration?: SubscriptionDuration | string;
  amount: number;
  currency: string;
  trialDays?: number;
  trailDays?: number;
  title?: string;
  planName?: string;
  price?: number;
  amountInUSDC?: number;
  value?: number;
  token?: string;
  isActive?: boolean;
  status?: string;
  subscriptionCount?: number;
  createdAt?: string;
  updatedAt?: string;
  subscriptions: Subscription[];
  [key: string]: unknown;
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
  count?: number;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  count?: number;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  amount: number;
  currency: string;
  duration?: SubscriptionDuration | string;
  trialDays?: number;
  trailDays?: number;
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanRequest extends Partial<CreateSubscriptionPlanRequest> {}

export interface CreateSubscriptionRequest {
  planId: string;
  customerId: string;
  network: string;
}
