import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../../store/client";
import { toast } from "sonner";

//crypto settlements

type CryptoSettlement = {
    id: string;
    walletAddress: string;
    network: string;
    alias: string;
}

export const useGetCryptoSettlements = () => {
    return useQuery({
        queryKey: ["crypto-settlements"],
        queryFn: async () => {
            const { data } = await client.get("/user/settlements/crypto");
            return data.data as CryptoSettlement[];
        }
    })
}

export const useAddCryptoSettlements = () => {
    return useMutation({
        mutationFn: async ({ walletAddress, network, alias }: { walletAddress: string, network: string, alias: string }) => {
            const { data } = await client.post("/user/settlements/crypto", { walletAddress, network, alias });
            return data.data as CryptoSettlement;
        },
        onSuccess: () => {
            toast.success("Crypto settlement added successfully!");
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to add crypto settlement");
        }
    });
}

export const useDeleteCryptoSettlementAccount = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            await client.delete(`/user/settlements/crypto/${id}`);
        },
        onSuccess: () => {
            toast.success("Crypto settlement deleted successfully!");
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to delete crypto settlement");
        }
    });
}

//fiat settlements

export const useListFiatBanks = () => {
    return useQuery({
        queryKey: ["fiat-banks"],
        queryFn: async () => {
            const { data } = await client.get("/banks");
            return data.data;
        }
    })
}