import { useQuery } from "@tanstack/react-query";
import client from "../../store/client";

type DashboardMetrics = {
    transactionCount: {
        total: number;
        percentageChange: number;
        trend: "up" | "down"
    },
    customerCount: {
        total: number;
        percentageChange: number;
        trend: "up" | "down"
    },
    earnings: {
        earningsUSDC: number;
        grossEarningsUSDC: number;
        totalPaymentsUSDC: number;
        totalRefundsUSDC: number;
        platformFeeUSDC: number;
    },
    transactionVolume: {
        totalVolume: number;
        totalVolumeInUSDC: number;
        transactionCount: number
    },
    transactionMetrics: {
        date: string;
        label: string;
        count: number;
        volume: number;
        volumeInUSDC: number
    }[]
}

type Balances = {
    coinType: string;
    balance: number;
}


export const useDashboard = () => {
    return useQuery<DashboardMetrics>({
        queryKey: ["dashboard-data"],
        queryFn: async () => {
            const response = await client.get("/user/profile/metrics");
            return response.data.data;
        }
    }
    );
}

export const  getRate = () => {
    return useQuery<{ [key: string]: number }>({
        queryKey: ["exchange-rates"],
        queryFn: async () => {
            const response = await client.get("/rates?currency=NGN");
            return response.data.data;
        }
    });
};

export const useBalance = () => {
    return useQuery<Balances[]>({
        queryKey: ["balances"],
        queryFn: async () => {
            const response = await client.get("/user/transactions/payout/balances");
            const data = response.data.data;
            const balances: { coinType: string; balance: number | string }[] = Array.isArray(data)
                ? data
                : data?.balances ?? [];

            return balances.map((entry) => {
                const normalizedBalance = Number(entry.balance);

                return {
                    coinType: entry.coinType,
                    balance: Number.isFinite(normalizedBalance) ? normalizedBalance / 1_000_000 : 0,
                };
            });
        }
    })
}