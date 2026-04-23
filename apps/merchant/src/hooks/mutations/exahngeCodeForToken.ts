import { useMutation } from "@tanstack/react-query";
import client from "../../store/client";
import { toast } from "sonner";
import { useLocation } from "wouter";

export const useExchangeCodeForToken = () => {
    const [, setLocation] = useLocation();
    return useMutation({
        mutationFn: async (otp: string) => {    
            let payload = {};
            if(!otp.startsWith("orafi")){
                payload = { otp, type: "google" };
            }else {
                payload = { otp, type: "orafi" };
            }
            const response = await client.post('/auth/exchange-code', payload);
            return response.data;
        },
        onSuccess: async (data: {message: string, data: { businessProfile: { onboarded: boolean} } }) => {
            toast.success(data.message || "User logged in successfully!")
            const isOnboarded = Boolean((data.data?.businessProfile?.onboarded));
            setTimeout(() => setLocation(isOnboarded ? '/' : '/onboarding'), 2000);
            
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Unable to validate login request")
            window.location.replace("https://auth.orafi.app/signin");

        }
    })
}