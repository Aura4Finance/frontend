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

export const useGetALLFiatSettlements = () => {
    return useQuery({
        queryKey: ["fiat-settlements"],
        queryFn: async () => {
            const { data } = await client.get("/user/settlements/fiat");
            return data.data as {
                id: string;
                bankName: string;
                bankCode: string;
                accountNumber: string;
                accountName: string;
                isPrimary: boolean
            }[]
        }
    })
}

export const useAddFiatSettlement = () => {
    return useMutation({
        mutationFn: async ({ bankCode, accountNumber, isPrimary }: { bankCode: string, accountNumber: string, isPrimary: boolean }) => {
            const { data } = await client.post("/user/settlements/fiat", { bankCode, accountNumber, isPrimary });
            return data.data as {
                id: string;
                bankName: string;
                bankCode: string;
                accountNumber: string;
                accountName: string;
                isPrimary: boolean
            };
        }
    });
}

export const useDeleteFiatSettlementAccount = () => {
    return useMutation({
        mutationFn: async (id: string) => { 
            await client.delete(`/user/settlements/fiat/${id}`);
        }
    });
}

export const useUpdatePrimaryFiatSettlementAccount = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await client.patch(`/user/settlements/fiat/${id}`, { isPrimary: true });
            return data.data as {
                id: string;
                bankName: string;
                bankCode: string;
                accountNumber: string;
                accountName: string;
                isPrimary: boolean
            };
        }
    });
}


//extras
export const useListFiatBanks = () => {
    return useQuery({
        queryKey: ["fiat-banks"],
        queryFn: async () => {
            const { data } = await client.get("/banks");
            return data.data as {
                name: string;
                bankCode: string
            }
        }
    })
}

export const useResolveFiatAccount = (params: { accountNumber: string; bankCode: string } | null) => {
    return useQuery({
        queryKey: ["resolve-acount", params?.accountNumber, params?.bankCode],
        queryFn: async () => {
            if (!params || !params.accountNumber || !params.bankCode) {
                return null;
            }
            const { data } = await client.get("/resolve-account", {
                params: {
                    accountNumber: params.accountNumber,
                    bankCode: params.bankCode
                }
            });
            return data.data as {
                accountName: string;
            }
        },
        enabled: !!params && !!params.accountNumber && !!params.bankCode
    })
}

export const useGetRates = (currency: string) => {
    return useQuery({
        queryKey: ["exchange-rates"],
        queryFn: async () => {
            const { data } = await client.get(`/rates?currency=${currency}`);
            return data.data as {
                rate: number;
                timestamp: number;
                rateDescription: string;
            }
        }
    })

}