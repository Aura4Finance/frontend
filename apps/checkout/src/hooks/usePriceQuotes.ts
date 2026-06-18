import {
     useQuery
} from "@tanstack/react-query";
import client from "../client/client";

export type PriceQuote = {
    price: number;
    timeStamp: Date;
}
type QuoteParams = {
    amountInUSDC: number;
    token: string;
    mode: "test" | "live";
}

export const useGetPriceQuote = (params: QuoteParams) => {
    return useQuery<PriceQuote>({
        queryKey: ["price-qoute"],
        queryFn: async () => {
            const { data } = await client.get(
                `/quotes`,
                { params }
            );
            return data.data;
        }
    })
}