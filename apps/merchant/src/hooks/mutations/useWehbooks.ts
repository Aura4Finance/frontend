import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../../store/client";
import { toast } from "sonner";

export type FilterOptions<T extends string> = {
  label: string;
  value: T
}[]

export type WebhookDelivery = {
    id: string;
    event: Event;
    transactionId: string;
    status: string;
    payload: {
        data:{
            amount: number;
            currency: string;
            status: string;
            occuredAt: string
        }
    };
    attemptCount: number;
    responseStatus: string;
    nextRetryAt: string;
    createdAt: string;
    lastAttemptAt: string;
}

export type WebhookDeliveryQueryParams = {
    status: string;
    transactionId: string;
    event: Event;
    date: {
        startDate: string;
        endDate: string;
    }
}

type WebhookDetails = {
    url: string;
    secret: string;
    createdAt: string;
    updatedAt: string;
    events: Event[];
}

export type EventType = {
    name: string;
    type: Event
}

export type Event = 
    | "payment.success"
    | "payment.failed"
    | "payment.create"
    | "subscription.active"
    | "subscription.abandonded"
    | "subscription.not_renew"
    | "subscription.disable"

export const useRegisterWehbook = () => {
    return useMutation({
        mutationFn: async ({ url }: { url: string }) => {
            const { data } = await client.post(`/user/webhook/register`, { url });
            return data.data as WebhookDetails
        },
        onSuccess: () => {
            toast.success("Webhook registered successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update customer status");
        },
    })
}

export const useGetWebhookDetails = () => {
    return useQuery({
        queryKey: ["webhook-details"],
        queryFn: async () => {  
            const { data } = await client.get(`/user/webhook`);
            return data.data as WebhookDetails;
        }
    })
}

export const useGetWebhookEventTypes = () => {
    return useQuery({
        queryKey: ["webhook-event-types"],
        queryFn: async () => {
            const { data } = await client.get(`/user/webhook/events`);
            return data.data as EventType[];
        }
    })
}

export const useSubcribeToWebhookEvent = () => {
    return useMutation({
        mutationFn: async ({ event }: { event: Event }) => {
            const { data } = await client.post(`/user/webhook/subscribe`, { event });
            return data.data;
        }
    })
}

export const useRetrieveWebhookDeliveries = (params?: WebhookDeliveryQueryParams) => {
    return useQuery({
        queryKey: ["webhook-deliveries", params],
        queryFn: async () => {
            const { data } = await client.get(`/user/webhook/deliveries`, { params });
            return data.data  as WebhookDelivery[];
        }
    })
}