import { useMutation } from "@tanstack/react-query";
import client from "../../store/client";
import { toast } from "sonner";
import { tokenStore } from "../../store/client";
import { useLocation } from "wouter";

export const useExchangeCodeForToken = () => {
    const { setToken } = tokenStore();
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
            return response.data.data.accessToken;
        },
        onSuccess: (accessToken: string) => {
            setToken(accessToken);
            setLocation("/dashboard");
            toast.success("Welcome back!");
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to validate login request")
            window.location.replace("http://localhost:3100/signin");
        }
    })
}