import { useQuery } from "@tanstack/react-query";
import client from "../../store/client";

type DashboardMetrics = {
    transactionCount: {
        total: number;
        percentageUp: number;
        trend: "up" | "down"
    },
    customerCount: {
        total: number;
        percentageUp: number;
        trend: "up" | "down"
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