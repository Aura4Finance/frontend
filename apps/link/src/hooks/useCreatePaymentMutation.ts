import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";

interface CreatePaylinkPaymentPayload {
    amount: number;
    email: string;
    fullname: string;
    paymentLinkId: string;
}


export const useCreatePaymentMutation = () => {
    return useMutation({
        mutationFn: async ({
            amount,
            email,
            fullname,
            paymentLinkId,
        }: CreatePaylinkPaymentPayload) => {
            const response = await client.post(
                "/transactions/payment/paylink/create",
                {
                    amount,
                    customer: {
                        email,
                        fullname,
                    },
                },
                {
                    headers: {
                        "payment-link-id": paymentLinkId,
                    },
                }
      );

            return response.data.data;
        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ||
                "An error occurred while creating the payment."
            );
        },
        onSuccess: (data) => {
            window.location.href = data.checkoutUrl;
        }
    });
};
