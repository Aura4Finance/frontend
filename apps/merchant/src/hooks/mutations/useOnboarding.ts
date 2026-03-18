import { useMutation } from "@tanstack/react-query";
import client from "../../store/client";
import {toast} from "sonner";

type OnboardingData = {
    businessName: string;
    businessSector: string;
    country: string;
    websiteLink: string;
}

export const useCompleteOnboarding = () => {
    return useMutation({
        mutationFn: async (data: OnboardingData) => {
            await client.post("/user/onboarding", data);
        },
        onSuccess: () => {
            toast.success("Onboarding completed successfully! Your business profile has been updated.")
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to complete onboarding process")
        }
    })
}