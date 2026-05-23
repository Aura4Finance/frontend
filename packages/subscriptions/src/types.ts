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
  | "PENDING"
  | "TRIALING"
  | "ABANDONED"
  | "CANCELLED"
  | "PAST_DUE";

export type SubscriptionDuration = 
  | "WEEKLY"
  | "MONTHLY"
  | "SIX_MONTHS"
  | "YEARLY";


export interface Subscription {
  id: string;
  mode: string;
  network: string;
  customerId: string;
  customer?: Customer;
  planId: string;
  status: SubscriptionStatus | string;
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
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration?: SubscriptionDuration | string;
  amount: number;
  currency: string;
  trialDays: string
  createdAt?: string;
  updatedAt?: string;
  subscriptions: Subscription[];
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
  duration?: SubscriptionDuration;
  trialDays?: string
}

export interface UpdateSubscriptionPlanRequest extends Partial<CreateSubscriptionPlanRequest> {}

export interface CreateSubscriptionRequest {
  planId: string;
  customerId: string;
  network: string;
}
