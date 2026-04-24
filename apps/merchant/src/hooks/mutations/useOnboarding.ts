import { useMutation } from "@tanstack/react-query";
import client from "../../store/client";
import {toast} from "sonner";

type OnboardingData = {
    businessName: string;
    businessSector: string;
    country: string;
    websiteLink: string | undefined;
}

export const useCompleteOnboarding = () => {
    return useMutation({
        mutationFn: async (data: OnboardingData) => {
            const websiteLink = data.websiteLink?.trim();

            const payload = {
                businessName: data.businessName,
                businessSector: data.businessSector,
                country: data.country,
                ...(websiteLink ? { websiteLink } : {}),
            };

            await client.post("/user/onboarding", payload);
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to complete onboarding process")
        }
    })
}