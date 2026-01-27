import { useQuery } from "@tanstack/react-query";
import client from "../client/client";

type PaymentData = {
  id: string;
  depositAddress: string;
  transferAddress: string;
  amount: number;
  businessName: string;
  amountInUSDC: number;
  redirectUrl: string;
  mode: "test" | "live"
};

export const useGetPaymentInformationQuery = (paymentId?: string) => {
  return useQuery<PaymentData>({
    queryKey: ["payment-information", paymentId],
    queryFn: async () => {
      const { data } = await client.get(
        `/transactions/payment/retrieve?paymentId=${paymentId}`,
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
