import type { SubscriptionStatus } from "./types";

export interface FilterOption<T extends string> {
  label: string;
  value: T;
}

const subscriptionStatusLabelMap: Record<string, SubscriptionStatus> = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  TRIALING: "TRIALING",
  ABANDONED: "ABANDONED",
  CANCELLED: "CANCELLED",
  PAST_DUE: "PAST_DUE",
};

export const subscriptionStatusOptions: FilterOption<SubscriptionStatus>[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Trialing", value: "TRIALING" },
  { label: "Abandoned", value: "ABANDONED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Past Due", value: "PAST_DUE" },
];

export const normalizeSubscriptionStatus = (value?: string | null): SubscriptionStatus | undefined => {
  if (!value) {
    return undefined;
  }

  return subscriptionStatusLabelMap[value.trim().toUpperCase()];
};

export const formatSubscriptionStatus = (value?: string | null) => {
  const normalized = normalizeSubscriptionStatus(value);

  if (normalized) {
    return subscriptionStatusLabelMap[normalized];
  }

  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const isSubscriptionStatus = (value: string): value is SubscriptionStatus => {
  return normalizeSubscriptionStatus(value) !== undefined;
};
