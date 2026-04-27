import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../store/client";
import { toast } from "sonner";
import { useLocation } from "wouter";

export const useExchangeCodeForToken = () => {
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient()
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
        onSuccess: async (data: {message: string }) => {
            toast.success(data.message || "User logged in successfully!")
            await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            setLocation('/');
            
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Unable to validate login request")
            window.location.replace("https://auth.orafi.app/signin");

        }
    })
}