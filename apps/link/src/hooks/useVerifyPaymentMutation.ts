import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";

export const useVerifyPaymentMutation = () => {
    return useMutation({
        mutationFn: async (paymentId: string) => {
            const response = await client.post(`/transactions/payment/${paymentId}verify`);
            return response.data.data;
        },
        onSuccess: (response) => {
            if(response && response.status === "completed") toast.success("Payment verified successfully!");
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Error verifying payment");
        },
    });
}