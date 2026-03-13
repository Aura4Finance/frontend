import { useMutation } from "@tanstack/react-query";
import client, { type UserProfile } from "../../store/client";
import { toast } from "sonner";
import { tokenStore } from "../../store/client";
import { useLocation } from "wouter";

export const useExchangeCodeForToken = () => {
    const { setProfile } = tokenStore();
    const [, setLocation] = useLocation();
    return useMutation({
        mutationFn: async (otp: string) => {
            let payload = {};
            if(!otp.startsWith("orafi")){
                payload = { otp, type: "google" };
            }else {
                payload = { otp, type: "orafi" };
            }
            await client.post('/auth/exchange-code', payload);
        },
        onSuccess: () => {
            useMutation({
                mutationFn: async () => {
                    const response = await client.get("/auth/profile");
                    return response.data.data.profile as UserProfile;
                },
                onSuccess: (profile) => {
                    setProfile(profile);
                    tokenStore.getState().setProfile(profile);
                    setLocation("/dashboard");
                    toast.success("Welcome back!");
                },
                onError: (error: any) => {
                    toast.error(error.response.data.message || "Unable to fetch user profile")
                    window.location.replace("http://localhost:3100/signin");
                }
            });
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to validate login request")
            window.location.replace("http://localhost:3100/signin");
        }
    })
}