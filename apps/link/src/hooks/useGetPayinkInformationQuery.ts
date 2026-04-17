import { useQuery } from "@tanstack/react-query";
import client from "../client/client";

type PayLinkData = {
  id: string;
  title: string;
  description: string;
  mode: "live" | "test";
  currency: string;
  amount: number;
  images: {
    blobId: string;
    blobObjectId: string;
  }[];
  profile: {
    businessName: string;
    businessSector: string;
    country: string;
    websiteLink: string;
  }
}

type GetSupportedNetworks = {
  symbol: string,
  logoUrl: string
}

export const useGetSupportedNetworkQuery = () => {
  return useQuery<GetSupportedNetworks[]>({
    queryKey: ["networks"],
    queryFn: async () => {
      const { data } = await client.get("/networks");
      return data.data;
    }
  })
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