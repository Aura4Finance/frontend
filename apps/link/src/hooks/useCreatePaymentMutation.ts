import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";

type Network = "SUI"

interface CreatePaylinkPaymentPayload {
    amount: number;
    email: string;
    fullname: string;
    network: Network;
    currency: string;
    paymentLinkId: string;
}


export const useCreatePaymentMutation = () => {
    return useMutation({
        mutationFn: async ({
            amount,
            email,
            network,
            currency,
            fullname,
            paymentLinkId,
        }: CreatePaylinkPaymentPayload) => {
            const response = await client.post(
                "/transactions/payment/paylink",
                {
                    amount,
                    customer: {
                        email,
                        fullname,
                    },
                    network,
                    currency,
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
            toast.success("Payment initiated successfully, redirecting to checkout!");
            setTimeout(() => window.location.href = data.checkoutUrl, 2000);
        }
    });
};
