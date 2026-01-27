import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";

export const useVerifyTransferMutation = (redirectUrl?: string) => {
    return useMutation({
        mutationFn: async (paymentId: string) => {
            await client.post("/transactions/payment/verify-transfer", { paymentId });
        },
        onSuccess: () => {
            toast.success("Transfer verified successfully!");
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Error verifying transfer");
        }
    });
}
