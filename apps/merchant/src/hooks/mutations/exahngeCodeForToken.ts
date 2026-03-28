import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../store/client";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { fetchUserProfile } from "./useSettings";
import type { UserProfile } from "../../store/client";

export const useExchangeCodeForToken = () => {
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (otp: string) => {
            let payload = {};
            if(!otp.startsWith("orafi")){
                payload = { otp, type: "google" };
            }else {
                payload = { otp, type: "orafi" };
            }
            const response = await client.post('/auth/exchange-code', payload);
            return response.data.message;
        },
        onSuccess: async (message: string) => {
            const profile = await queryClient.fetchQuery({
                queryKey: ["user-profile"],
                queryFn: fetchUserProfile,
            });

            toast.success(message || "User logged in successfully!")
            const isOnboarded = Boolean((profile as UserProfile | undefined)?.businessProfile?.onboarded);
            setLocation(isOnboarded ? '/' : '/onboarding')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Unable to validate login request")
            //window.location.replace("http://localhost:3100/signin");
        }
    })
}