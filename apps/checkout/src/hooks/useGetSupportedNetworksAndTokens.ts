import {
    useQuery,
} from "@tanstack/react-query";
import client from "../client/client";

export type Token = {
    name: string;
    symbol: string;
    logoUrl: string;
    decimals: string;
    mainnet: {
        coinType: string
    }
    testnet: {
        coinType: string
    }

}
export type SupportedNetwork = {
    code: string;
    name: string;
    symbol: string;
    isActive: boolean;
    supportedTokens: Token[],
    smartContractPackageId: {
        testnet: string,
        mainnet: string;
    };
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