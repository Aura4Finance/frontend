import { create } from "zustand";
import type { WebhookDeliveryQueryParams, Event } from "../hooks/mutations/useWehbooks";
import { parseNumberParam } from "../lib/queryState";

export interface WebhookFiltersStore {
  status?: string;
  transactionId?: string;
  event?: Event;
  date?: {
    startDate: string;
    endDate: string;
  };
  limit: number;
  cursor?: string;

  setStatus: (status?: string) => void;
  setTransactionId: (transactionId?: string) => void;
  setEvent: (event?: Event) => void;
  setDate: (date?: { startDate: string; endDate: string }) => void;
  setLimit: (limit: number) => void;
  setCursor: (cursor?: string) => void;
  setFilters: (filters: Partial<WebhookFiltersStore>) => void;
  resetFilters: () => void;
  getQueryParams: () => Record<string, string>;
  setFromQueryParams: (params: URLSearchParams) => void;
}

const defaultFilters: Omit<WebhookFiltersStore, keyof Required<Pick<WebhookFiltersStore, "setStatus" | "setTransactionId" | "setEvent" | "setDate" | "setLimit" | "setCursor" | "setFilters" | "resetFilters" | "getQueryParams" | "setFromQueryParams">>> = {
  status: undefined,
  transactionId: undefined,
  event: undefined,
  date: undefined,
  limit: 10,
  cursor: undefined,
};

export const useWebhookFilters = create<WebhookFiltersStore>()(
  (set, get) => ({
      ...defaultFilters,

      setStatus: (status) => set({ status, cursor: undefined }),
      setTransactionId: (transactionId) => set({ transactionId, cursor: undefined }),
      setEvent: (event) => set({ event, cursor: undefined }),
      setDate: (date) => set({ date, cursor: undefined }),
      setLimit: (limit) => set({ limit }),
      setCursor: (cursor) => set({ cursor }),

      setFilters: (filters) => set({ ...filters, cursor: undefined }),

      resetFilters: () => set({ ...defaultFilters }),

      getQueryParams: () => {
        const state = get();
        const params: Record<string, string> = {};

        if (state.status) params.status = state.status;
        if (state.transactionId) params.transactionId = state.transactionId;
        if (state.event) params.event = state.event;
        if (state.date?.startDate) params.startDate = state.date.startDate;
        if (state.date?.endDate) params.endDate = state.date.endDate;
        if (state.limit !== 10) params.limit = String(state.limit);
        if (state.cursor) params.cursor = state.cursor;

        return params;
      },

      setFromQueryParams: (params) => {
        const status = params.get("status");
        const transactionId = params.get("transactionId");
        const eventRaw = params.get("event");
        const event = eventRaw === "payment.success" || eventRaw === "payment.failed" ? eventRaw : undefined;
        const startDate = params.get("startDate");
        const endDate = params.get("endDate");
        const limit = params.get("limit") ? parseNumberParam(params.get("limit"), 10) : 10;
        const cursor = params.get("cursor");

        const date = startDate || endDate ? { startDate: startDate || "", endDate: endDate || "" } : undefined;

        set({
          status: status || undefined,
          transactionId: transactionId || undefined,
          event,
          date,
          limit,
          cursor: cursor || undefined,
        });
      },
    })
);

export const buildWebhookParams = (
  filters: WebhookFiltersStore
): WebhookDeliveryQueryParams | undefined => {
  const params: any = {};

  if (filters.status) params.status = filters.status;
  if (filters.transactionId) params.transactionId = filters.transactionId;
  if (filters.event) params.event = filters.event;
  if (filters.date) {
    params.date = {
      startDate: filters.date.startDate,
      endDate: filters.date.endDate,
    };
  }
  if (filters.cursor) params.cursor = filters.cursor;
  
  // Add limit
  params.limit = filters.limit;

  return Object.keys(params).length > 0 ? params : undefined;
};
