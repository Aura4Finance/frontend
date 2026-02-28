import { useQuery } from "@tanstack/react-query";
import client from "../client/client";

type PaymentData = {
  id: string;
  depositAddress: string;
  transferAddress: string;
  businessName: string;
  amount: number;
  amountInUSDC: number;
  currency: string;
  redirectUrl: string;
  mode: "test" | "live"
};

export const useGetPaymentInformationQuery = (paymentId: string) => {
  return useQuery<PaymentData>({
    queryKey: ["payment-information", paymentId],
    queryFn: async () => {
      const { data } = await client.get(
        `/transactions/payment?paymentId=${paymentId}`,
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
