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
            await client.post("/user/onboarding", {data, ...(data.websiteLink ?  {websiteLink: data.websiteLink} : {}   )});
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to complete onboarding process")
        }
    })
}