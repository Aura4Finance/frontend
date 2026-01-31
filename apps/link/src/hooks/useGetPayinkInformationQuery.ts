import { useQuery } from "@tanstack/react-query";
import client from "../client/client";

type PayLinkData = {
        id: string;
        title: string;
        description: string;
        mode: string;
        amount: number;
        imageBlobIds: string[];
        profile: {
            businessName: string;
            businessSector: string;
            country: string;
            websiteLink: string;
        }
}


export const useGetPayLinkInformationQuery = (payLinkId?: string) => {
  return useQuery<PayLinkData>({
    queryKey: ["paylink-information", payLinkId],
    queryFn: async () => {
      const { data } = await client.get(
        `/paylink/${payLinkId}`,
      );
      return data.data;
    },
    enabled: !!payLinkId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};