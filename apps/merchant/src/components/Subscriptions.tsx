import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { FiArrowRight, FiEdit2, FiFilter, FiPlus, FiSearch, FiTrash2, FiUserPlus } from "react-icons/fi";
import DashboardWrapper from "./DashboardWrapper";
import Modal from "./transactions/Modal";
import ErrorState from "./transactions/ErrorState";
import { useActiveTabStore } from "../store/activeTab";
import { useQueryState } from "../hooks/useQueryState";
import {
  formatSubscriptionStatus,
  isSubscriptionBillingInterval,
  isSubscriptionStatus,
  normalizeSubscriptionStatus,
  subscriptionBillingIntervalOptions,
  subscriptionStatusOptions,
  type CreateSubscriptionPlanRequest,
  type CreateSubscriptionRequest,
  type Subscription,
  type SubscriptionPlan,
  type SubscriptionStatus,
  type UpdateSubscriptionPlanRequest,
} from "@orafi/subscriptions";
import {
  useCancelSubscription,
  useCreateSubscription,
  useCreateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useSubscriptionPlan,
  useSubscriptionPlans,
  useUpdateSubscriptionPlan,
} from "../hooks/mutations/useSubscriptions";

type PlanFormState = {
  name: string;
  description: string;
  amount: string;
  currency: string;
  interval: string;
  intervalCount: string;
  trialDays: string;
  isActive: boolean;
};

type SubscriptionFormState = {
  planId: string;
  customerId: string;
  status: SubscriptionStatus | "";
  startDate: string;
};

const defaultPlanFormState: PlanFormState = {
  name: "",
  description: "",
  amount: "",
  currency: "USDC",
  interval: "MONTHLY",
  intervalCount: "1",
  trialDays: "",
  isActive: true,
};

const defaultSubscriptionFormState: SubscriptionFormState = {
  planId: "",
  customerId: "",
  status: "PENDING",
  startDate: "",
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const shortenId = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const readPlanName = (plan?: SubscriptionPlan | null) => {
  if (!plan) {
    return "Untitled plan";
  }

  return plan.name || plan.title || plan.planName || plan.id;
};

const readPlanDescription = (plan?: SubscriptionPlan | null) => {
  if (!plan) {
    return "";
  }

  return plan.description || "No description provided";
};

const readPlanAmount = (plan?: SubscriptionPlan | null) => {
  if (!plan) {
    return undefined;
  }

  const candidate = plan.amount ?? plan.price ?? plan.amountInUSDC ?? plan.value;
  const amount = typeof candidate === "number" ? candidate : Number(candidate);
  return Number.isNaN(amount) ? undefined : amount;
};

const readPlanCurrency = (plan?: SubscriptionPlan | null) => {
  if (!plan) {
    return "USDC";
  }

  return plan.currency || plan.token || "USDC";
};

const readPlanInterval = (plan?: SubscriptionPlan | null) => {
  if (!plan) {
    return "MONTHLY";
  }

  return plan.interval || plan.billingInterval || "MONTHLY";
};

const readPlanIntervalCount = (plan?: SubscriptionPlan | null) => {
  if (!plan) {
    return 1;
  }

  const candidate = plan.intervalCount;
  return Number.isFinite(candidate) && candidate ? candidate : 1;
};

const readPlanTrialDays = (plan?: SubscriptionPlan | null) => {
  if (!plan) {
    return undefined;
  }

  return plan.trialDays ?? undefined;
};

const readPlanActiveState = (plan?: SubscriptionPlan | null) => {
  if (!plan) {
    return true;
  }

  if (typeof plan.isActive === "boolean") {
    return plan.isActive;
  }

  if (plan.status) {
    const normalized = String(plan.status).toUpperCase();
    return normalized === "ACTIVE" || normalized === "ENABLED";
  }

  return true;
};

const readPlanStatusLabel = (plan?: SubscriptionPlan | null) => {
  if (!plan) {
    return "Inactive";
  }

  if (plan.status) {
    return String(plan.status)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  return readPlanActiveState(plan) ? "Active" : "Inactive";
};

const readSubscriptionAmount = (subscription: Subscription) => {
  const candidate =
    subscription.amount ??
    (subscription as Record<string, unknown>).billingAmount ??
    (subscription as Record<string, unknown>).totalAmount;

  const amount = typeof candidate === "number" ? candidate : Number(candidate);
  return Number.isNaN(amount) ? undefined : amount;
};

const readSubscriptionCurrency = (subscription: Subscription, fallbackCurrency = "USDC") => {
  return (
    subscription.currency ||
    (subscription as Record<string, unknown>).token ||
    (subscription as Record<string, unknown>).paymentCurrency ||
    fallbackCurrency
  );
};

const readSubscriptionCustomerName = (subscription: Subscription) => {
  const customer = subscription.customer;
  if (customer) {
    const fullName = [customer.firstname, customer.lastname].filter(Boolean).join(" ").trim();
    if (fullName) {
      return fullName;
    }

    if (customer.name) {
      return customer.name;
    }

    if (customer.email) {
      return customer.email;
    }
  }

  const directName = (subscription as Record<string, unknown>).customerName;
  if (typeof directName === "string" && directName.trim()) {
    return directName;
  }

  return subscription.customerId || "Unknown customer";
};

const readSubscriptionBillingDate = (subscription: Subscription) => {
  const fallback = subscription.nextBillingAt || (subscription as Record<string, unknown>).nextChargeAt || (subscription as Record<string, unknown>).renewalAt;
  return formatDate(typeof fallback === "string" ? fallback : undefined);
};

const getPlanTone = (plan?: SubscriptionPlan | null) => {
  if (!plan || readPlanActiveState(plan)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-100 text-gray-600 border-gray-200";
};

const getSubscriptionTone = (status?: string | null) => {
  const normalized = normalizeSubscriptionStatus(status);

  switch (normalized) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-600 border-gray-200";
    case "PAST_DUE":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "ABANDONDED":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const emptyPlanForm = () => ({ ...defaultPlanFormState });
const emptySubscriptionForm = () => ({ ...defaultSubscriptionFormState });

const Subscriptions = () => {
  const [, setLocation] = useLocation();
  const { setActiveTab } = useActiveTabStore();
  const [planSearch, setPlanSearch] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useQueryState("planId", "", {
    history: "push",
  });
  const [subscriptionStatus, setSubscriptionStatus] = useQueryState<SubscriptionStatus | "">(
    "subscriptionStatus",
    "",
    {
      history: "replace",
      parse: (raw) => {
        if (!raw.trim()) {
          return "";
        }

        const normalized = normalizeSubscriptionStatus(raw);
        if (normalized) {
          return normalized;
        }

        throw new Error("Invalid subscription status");
      },
    }
  );

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planModalMode, setPlanModalMode] = useState<"create" | "edit">("create");
  const [planForm, setPlanForm] = useState<PlanFormState>(emptyPlanForm());
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionFormState>(emptySubscriptionForm());

  const { data: plans = [], isLoading: plansLoading, error: plansError, refetch: refetchPlans } = useSubscriptionPlans();
  const {
    data: selectedPlanDetail,
    isLoading: planLoading,
    error: planError,
    refetch: refetchPlan,
  } = useSubscriptionPlan(selectedPlanId);

  const { mutate: createPlan, isPending: isCreatingPlan } = useCreateSubscriptionPlan();
  const { mutate: updatePlan, isPending: isUpdatingPlan } = useUpdateSubscriptionPlan();
  const { mutate: deletePlan, isPending: isDeletingPlan } = useDeleteSubscriptionPlan();
  const { mutate: createSubscription, isPending: isCreatingSubscription } = useCreateSubscription();
  const { mutate: cancelSubscription, isPending: isCancelingSubscription } = useCancelSubscription();

  useEffect(() => {
    setActiveTab("Subscriptions");
  }, [setActiveTab]);

  useEffect(() => {
    if (!plans.length) {
      if (selectedPlanId) {
        setSelectedPlanId("");
      }
      return;
    }

    const selectedExists = plans.some((plan) => plan.id === selectedPlanId);
    if (!selectedPlanId || !selectedExists) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId, setSelectedPlanId]);

  const selectedPlan = selectedPlanDetail ?? plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const planSubscriptions = selectedPlan?.subscriptions ?? [];

  const filteredPlans = useMemo(() => {
    const query = planSearch.trim().toLowerCase();
    if (!query) {
      return plans;
    }

    return plans.filter((plan) => {
      const haystack = [
        readPlanName(plan),
        readPlanDescription(plan),
        plan.id,
        readPlanCurrency(plan),
        String(readPlanAmount(plan) ?? ""),
        String(readPlanInterval(plan)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [plans, planSearch]);

  const filteredSubscriptions = useMemo(() => {
    const normalizedStatus = subscriptionStatus ? normalizeSubscriptionStatus(subscriptionStatus) : undefined;

    return [...planSubscriptions]
      .filter((subscription) => {
        if (!normalizedStatus) {
          return true;
        }

        return normalizeSubscriptionStatus(subscription.status) === normalizedStatus;
      })
      .sort((left, right) => {
        const leftDate = new Date(left.createdAt || left.startDate || left.startedAt || 0).getTime();
        const rightDate = new Date(right.createdAt || right.startDate || right.startedAt || 0).getTime();
        return rightDate - leftDate;
      });
  }, [planSubscriptions, subscriptionStatus]);

  const activeSubscriptions = useMemo(() => {
    return planSubscriptions.filter((subscription) => normalizeSubscriptionStatus(subscription.status) === "ACTIVE").length;
  }, [planSubscriptions]);

  const planCount = plans.length;
  const selectedPlanSubscriptionCount = planSubscriptions.length;
  const filteredSubscriptionCount = filteredSubscriptions.length;

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setSubscriptionStatus("");
  };

  const handleOpenCreatePlan = () => {
    setPlanModalMode("create");
    setPlanForm(emptyPlanForm());
    setShowPlanModal(true);
  };

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setPlanModalMode("edit");
    setPlanForm({
      name: readPlanName(plan),
      description: readPlanDescription(plan) === "No description provided" ? "" : readPlanDescription(plan),
      amount: String(readPlanAmount(plan) ?? ""),
      currency: readPlanCurrency(plan),
      interval: readPlanInterval(plan),
      intervalCount: String(readPlanIntervalCount(plan)),
      trialDays: String(readPlanTrialDays(plan) ?? ""),
      isActive: readPlanActiveState(plan),
    });
    setShowPlanModal(true);
  };

  const handlePlanFormChange = <K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) => {
    setPlanForm((current) => ({ ...current, [key]: value }));
  };

  const handleSavePlan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!planForm.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    if (!planForm.amount.trim()) {
      toast.error("Plan amount is required");
      return;
    }

    if (!isSubscriptionBillingInterval(planForm.interval)) {
      toast.error("Select a valid billing interval");
      return;
    }

    const amount = Number(planForm.amount);
    const intervalCount = planForm.intervalCount.trim() ? Number(planForm.intervalCount) : undefined;
    const trialDays = planForm.trialDays.trim() ? Number(planForm.trialDays) : undefined;

    if (Number.isNaN(amount)) {
      toast.error("Plan amount must be a number");
      return;
    }

    if (intervalCount !== undefined && Number.isNaN(intervalCount)) {
      toast.error("Interval count must be a number");
      return;
    }

    if (trialDays !== undefined && Number.isNaN(trialDays)) {
      toast.error("Trial days must be a number");
      return;
    }

    const payload: CreateSubscriptionPlanRequest = {
      name: planForm.name.trim(),
      description: planForm.description.trim() || undefined,
      amount,
      currency: planForm.currency.trim().toUpperCase(),
      interval: planForm.interval,
      intervalCount,
      trialDays,
      isActive: planForm.isActive,
    };

    if (planModalMode === "create") {
      createPlan(payload, {
        onSuccess: (createdPlan) => {
          setSelectedPlanId(createdPlan.id);
          setShowPlanModal(false);
          setPlanForm(emptyPlanForm());
        },
      });
      return;
    }

    if (!selectedPlan) {
      toast.error("Select a plan before updating it");
      return;
    }

    const updatePayload: UpdateSubscriptionPlanRequest = {
      ...payload,
    };

    updatePlan(
      { planId: selectedPlan.id, payload: updatePayload },
      {
        onSuccess: () => {
          setShowPlanModal(false);
          setPlanForm(emptyPlanForm());
        },
      }
    );
  };

  const handleDeletePlan = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setShowDeletePlanModal(true);
  };

  const confirmDeletePlan = () => {
    if (!planToDelete) {
      return;
    }

    deletePlan(planToDelete.id, {
      onSuccess: () => {
        const remainingPlan = plans.find((plan) => plan.id !== planToDelete.id);
        setSelectedPlanId(remainingPlan?.id ?? "");
        setPlanToDelete(null);
        setShowDeletePlanModal(false);
      },
    });
  };

  const handleOpenSubscriptionModal = () => {
    setSubscriptionForm({
      ...emptySubscriptionForm(),
      planId: selectedPlan?.id || plans[0]?.id || "",
      status: "PENDING",
    });
    setShowSubscriptionModal(true);
  };

  const handleSubscriptionFormChange = <K extends keyof SubscriptionFormState>(key: K, value: SubscriptionFormState[K]) => {
    setSubscriptionForm((current) => ({ ...current, [key]: value }));
  };

  const handleSaveSubscription = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!subscriptionForm.planId.trim()) {
      toast.error("Select a plan");
      return;
    }

    if (!subscriptionForm.customerId.trim()) {
      toast.error("Customer ID is required");
      return;
    }

    if (subscriptionForm.status && !isSubscriptionStatus(subscriptionForm.status)) {
      toast.error("Select a valid subscription status");
      return;
    }

    const payload: CreateSubscriptionRequest = {
      planId: subscriptionForm.planId.trim(),
      customerId: subscriptionForm.customerId.trim(),
      status: subscriptionForm.status || undefined,
      startDate: subscriptionForm.startDate || undefined,
    };

    createSubscription(payload, {
      onSuccess: () => {
        setShowSubscriptionModal(false);
        setSubscriptionForm({
          ...emptySubscriptionForm(),
          planId: selectedPlan?.id || plans[0]?.id || "",
          status: "PENDING",
        });
      },
    });
  };

  const handleNavigateToTransactions = (subscriptionId: string) => {
    setLocation(`/transactions?subscriptionId=${encodeURIComponent(subscriptionId)}`);
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    if (!window.confirm(`Cancel subscription ${subscription.id}?`)) {
      return;
    }

    cancelSubscription(subscription.id, {
      onSuccess: () => {
        if (selectedPlanId) {
          refetchPlan();
        }
      },
    });
  };

  const handleRefresh = () => {
    refetchPlans();
    if (selectedPlanId) {
      refetchPlan();
    }
  };

  const selectedPlanAmount = readPlanAmount(selectedPlan);
  const selectedPlanCurrency = readPlanCurrency(selectedPlan);
  const selectedPlanInterval = readPlanInterval(selectedPlan);

  return (
    <DashboardWrapper>
      <div className="space-y-6 p-4 sm:p-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Plans</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{planCount.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-500">Manage your subscription plans</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Selected plan subscriptions</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{selectedPlanSubscriptionCount.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-500">Returned by the plan detail endpoint</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Visible subscriptions</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{filteredSubscriptionCount.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-500">After the status filter is applied</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Active subscriptions</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{activeSubscriptions.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-500">Currently active in the selected plan</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Plans</h2>
                  <p className="mt-1 text-sm text-gray-500">Create, update, and delete subscription plans.</p>
                </div>
                <button
                  onClick={handleOpenCreatePlan}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                >
                  <FiPlus className="h-4 w-4" />
                  Create
                </button>
              </div>
              <div className="relative mt-4">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={planSearch}
                  onChange={(event) => setPlanSearch(event.target.value)}
                  placeholder="Search plans"
                  className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-4">
              {plansLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="mt-3 h-3 w-1/2 rounded bg-gray-200" />
                      <div className="mt-4 flex gap-2">
                        <div className="h-8 w-16 rounded bg-gray-200" />
                        <div className="h-8 w-16 rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : plansError ? (
                <ErrorState message="Failed to load subscription plans" onRetry={handleRefresh} />
              ) : filteredPlans.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-gray-900">No plans found</p>
                  <p className="mt-1 text-sm text-gray-500">Create your first subscription plan to get started.</p>
                  <button
                    onClick={handleOpenCreatePlan}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                  >
                    <FiPlus className="h-4 w-4" />
                    Create plan
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPlans.map((plan) => {
                    const isSelected = plan.id === selectedPlanId;
                    const subscriptionCount = plan.subscriptionCount ?? plan.subscriptions?.length ?? 0;
                    const amount = readPlanAmount(plan);
                    const currency = readPlanCurrency(plan);

                    return (
                      <button
                        key={plan.id}
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                          isSelected
                            ? "border-blue-300 bg-blue-50/70 shadow-sm"
                            : "border-gray-100 bg-white hover:border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{readPlanName(plan)}</p>
                            <p className="mt-1 text-xs text-gray-500">{shortenId(plan.id)}</p>
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getPlanTone(plan)}`}>
                            {readPlanStatusLabel(plan)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1">{amount !== undefined ? `${currency} ${amount.toLocaleString()}` : `${currency} custom`}</span>
                          <span className="rounded-full bg-gray-100 px-2.5 py-1">{String(readPlanInterval(plan))}</span>
                          <span className="rounded-full bg-gray-100 px-2.5 py-1">{subscriptionCount} subscriptions</span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-xs text-gray-500">{readPlanDescription(plan)}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenEditPlan(plan);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <FiEdit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeletePlan(plan);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Plan details</h2>
                  <p className="mt-1 text-sm text-gray-500">Review the selected plan and the subscriptions returned for it.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
                    <FiFilter className="h-4 w-4 text-gray-500" />
                    <span>Status</span>
                    <select
                      value={subscriptionStatus}
                      onChange={(event) => setSubscriptionStatus(event.target.value as SubscriptionStatus | "")}
                      className="bg-transparent text-xs font-medium text-gray-700 outline-none"
                    >
                      <option value="">All</option>
                      {subscriptionStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleOpenSubscriptionModal}
                    disabled={!selectedPlan}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiUserPlus className="h-4 w-4" />
                    Create subscription
                  </button>
                  <button
                    onClick={() => selectedPlan && handleOpenEditPlan(selectedPlan)}
                    disabled={!selectedPlan}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    Edit plan
                  </button>
                </div>
              </div>

              <div className="p-5">
                {planLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-6 w-1/2 rounded bg-gray-200" />
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                    <div className="h-24 rounded-xl bg-gray-100" />
                  </div>
                ) : planError ? (
                  <ErrorState message="Failed to load the selected plan" onRetry={handleRefresh} />
                ) : selectedPlan ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Plan</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{readPlanName(selectedPlan)}</p>
                        <p className="mt-1 text-sm text-gray-500">{shortenId(selectedPlan.id)}</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Amount</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {selectedPlanAmount !== undefined ? `${selectedPlanCurrency} ${selectedPlanAmount.toLocaleString()}` : `${selectedPlanCurrency} custom`}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">Billed {String(selectedPlanInterval)}</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Trial</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {readPlanTrialDays(selectedPlan) !== undefined ? `${readPlanTrialDays(selectedPlan)} days` : "No trial"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">Interval count: {readPlanIntervalCount(selectedPlan)}</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Status</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{readPlanStatusLabel(selectedPlan)}</p>
                        <p className="mt-1 text-sm text-gray-500">Created {formatDate(selectedPlan.createdAt)}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-4">
                      <p className="text-sm font-medium text-gray-900">Description</p>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{readPlanDescription(selectedPlan)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-gray-900">Select a plan</p>
                    <p className="mt-1 text-sm text-gray-500">Choose a plan from the list to see its subscriptions.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Subscriptions for this plan</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Filtered by status and ready to jump into the transactions tab.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    {filteredSubscriptionCount} visible
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    {selectedPlanSubscriptionCount} total
                  </span>
                </div>
              </div>

              <div className="p-5">
                {selectedPlanSubscriptionCount === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-gray-900">No subscriptions returned for this plan</p>
                    <p className="mt-1 text-sm text-gray-500">Create a subscription to populate the list here.</p>
                  </div>
                ) : filteredSubscriptionCount === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-gray-900">No subscriptions match the selected status</p>
                    <p className="mt-1 text-sm text-gray-500">Change the filter to see other subscriptions for this plan.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSubscriptions.map((subscription) => {
                      const statusLabel = formatSubscriptionStatus(subscription.status);
                      const amount = readSubscriptionAmount(subscription);
                      const currency = readSubscriptionCurrency(subscription, selectedPlanCurrency);
                      const normalizedStatus = normalizeSubscriptionStatus(subscription.status);

                      return (
                        <div
                          key={subscription.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleNavigateToTransactions(subscription.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              handleNavigateToTransactions(subscription.id);
                            }
                          }}
                          className="group flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm"
                        >
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">{readSubscriptionCustomerName(subscription)}</p>
                              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getSubscriptionTone(subscription.status)}`}>
                                {statusLabel}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500">
                              Subscription ID: {shortenId(subscription.id)}
                              {subscription.customerId ? ` · Customer ID: ${shortenId(subscription.customerId)}` : ""}
                            </p>

                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                              <span className="rounded-full bg-gray-100 px-2.5 py-1">
                                {amount !== undefined ? `${currency} ${amount.toLocaleString()}` : `${currency} amount unavailable`}
                              </span>
                              <span className="rounded-full bg-gray-100 px-2.5 py-1">
                                Started {formatDate(subscription.startDate || subscription.startedAt || subscription.createdAt)}
                              </span>
                              <span className="rounded-full bg-gray-100 px-2.5 py-1">
                                Next billing {readSubscriptionBillingDate(subscription)}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleNavigateToTransactions(subscription.id);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
                            >
                              Transactions
                              <FiArrowRight className="h-3.5 w-3.5" />
                            </button>
                            {normalizedStatus !== "CANCELLED" && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleCancelSubscription(subscription);
                                }}
                                disabled={isCancelingSubscription}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={planModalMode === "create" ? "Create subscription plan" : "Update subscription plan"}
        description="Define the billing settings that will be attached to future subscriptions."
        icon={planModalMode === "create" ? <FiPlus className="h-5 w-5 text-blue-600" /> : <FiEdit2 className="h-5 w-5 text-blue-600" />}
        size="xl"
      >
        <form className="space-y-4" onSubmit={handleSavePlan}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Plan name</label>
              <input
                type="text"
                value={planForm.name}
                onChange={(event) => handlePlanFormChange("name", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Premium Plan"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={planForm.description}
                onChange={(event) => handlePlanFormChange("description", event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what this plan includes"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={planForm.amount}
                onChange={(event) => handlePlanFormChange("amount", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
              <input
                type="text"
                value={planForm.currency}
                onChange={(event) => handlePlanFormChange("currency", event.target.value.toUpperCase())}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="USDC"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Interval</label>
              <select
                value={planForm.interval}
                onChange={(event) => handlePlanFormChange("interval", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subscriptionBillingIntervalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Interval count</label>
              <input
                type="number"
                min="1"
                step="1"
                value={planForm.intervalCount}
                onChange={(event) => handlePlanFormChange("intervalCount", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Trial days</label>
              <input
                type="number"
                min="0"
                step="1"
                value={planForm.trialDays}
                onChange={(event) => handlePlanFormChange("trialDays", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-3 text-sm text-gray-700 md:col-span-2">
              <input
                type="checkbox"
                checked={planForm.isActive}
                onChange={(event) => handlePlanFormChange("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Active plan
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPlanModal(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingPlan || isUpdatingPlan}
              className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {planModalMode === "create" ? (isCreatingPlan ? "Creating..." : "Create plan") : isUpdatingPlan ? "Updating..." : "Update plan"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title="Create subscription"
        description="Attach a customer to one of your subscription plans."
        icon={<FiUserPlus className="h-5 w-5 text-blue-600" />}
        size="wide"
      >
        <form className="space-y-4" onSubmit={handleSaveSubscription}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Plan</label>
              <select
                value={subscriptionForm.planId}
                onChange={(event) => handleSubscriptionFormChange("planId", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {readPlanName(plan)} ({shortenId(plan.id)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Customer ID</label>
              <input
                type="text"
                value={subscriptionForm.customerId}
                onChange={(event) => handleSubscriptionFormChange("customerId", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="customer_123"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={subscriptionForm.status}
                onChange={(event) =>
                  handleSubscriptionFormChange(
                    "status",
                    event.target.value ? (event.target.value as SubscriptionStatus) : ""
                  )
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                {subscriptionStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start date</label>
              <input
                type="date"
                value={subscriptionForm.startDate}
                onChange={(event) => handleSubscriptionFormChange("startDate", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowSubscriptionModal(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingSubscription}
              className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingSubscription ? "Creating..." : "Create subscription"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDeletePlanModal}
        onClose={() => setShowDeletePlanModal(false)}
        title="Delete subscription plan"
        description="This action will remove the plan and any future subscriptions will no longer be able to use it."
        icon={<FiTrash2 className="h-5 w-5 text-red-600" />}
        variant="danger"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {planToDelete ? (
              <>
                <span className="font-semibold">{readPlanName(planToDelete)}</span>
                <span className="ml-2 text-red-600">({shortenId(planToDelete.id)})</span>
              </>
            ) : (
              "Confirm deletion of this plan."
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeletePlanModal(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeletePlan}
              disabled={isDeletingPlan}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeletingPlan ? "Deleting..." : "Delete plan"}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardWrapper>
  );
};

export default Subscriptions;
