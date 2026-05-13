import { 
  useQuery,
  useMutation,
 } from "@tanstack/react-query";
import client from "../client/client";

type PaymentData = {
  id: string;
  businessName: string;
  depositAddress: string;
  transferAddress:  string;
  amount: number;
  amountInUSDC: number;
  currency: string;
  redirectUrl: string;
  mode: "test" | "live";
  network: string
};

export const useGetPaymentInformationQuery = (paymentId: string) => {
  return useQuery<PaymentData>({
    queryKey: ["payment-information", paymentId],
    queryFn: async () => {
      const { data } = await client.get(
        `/transactions/payment/${paymentId}`,
      );
      return data.data;
    },
    enabled: !!paymentId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useGeneratePaymentIntentMutation = (paymentId: string) => {
  return useMutation({
    mutationKey: ["generate-payment-intent", paymentId],
    mutationFn: async (intent: "deposit_address" | "transfer_address") => {
      const { data } = await client.patch(
        `/transactions/payment/${paymentId}?intent=${intent}`,
      );
      return data.data as string;
    }
  })
}


