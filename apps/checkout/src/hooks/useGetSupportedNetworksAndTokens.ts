import {
    useQuery,
} from "@tanstack/react-query";
import client from "../client/client";

type SupportedNetwork = {
    code: string;
    name: string;
    symbol: string;
    isActive: boolean;
    supportedTokens: string[];
    smartContractPackageId: string;
    explorerUrl: string;
    logoUrl: string;
}

export const useGetSupportedNetworksAndTokens = () => {
    return useQuery<SupportedNetwork[]>({
        queryKey: ["supported-networks-and-tokens"],
        queryFn: async () => {
            const { data } = await client.get(
                `/networks`,
            );
            return data.data;
        }
    })
}