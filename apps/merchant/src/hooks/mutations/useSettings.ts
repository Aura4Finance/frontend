import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../../store/client";
import { toast } from "sonner";
import { tokenStore, type UserProfile } from "../../store/client";


export const useRequestEmailChange = () => {
    return useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            await client.post("/user/profile/request-email-change", { email })
        },
        onSuccess: () => {
            toast.success("Email change request sent! Please check your inbox for further instructions.")
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to process email change request")
        }
    })
}

export const useVerifyEmailChange = () => {
    return useMutation({
        mutationFn: async ({ email, token }: { email: string; token: string }) => {
            await client.post("/user/profile/verify-email-change", { email, token })
        },
        onSuccess: () => {
            toast.success("Email change successful! Your email has been updated.")
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to verify email change request")
        }
    })
}

export const useChangePassword = () => {
    return useMutation({
        mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
            await client.post("/user/security/change-password", { oldPassword });
            await client.post("/user/security/complete-change-password", { newPassword });
        },
        onSuccess: () => {
            toast.success("Password changed successfully!")
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to change password")
        }
    })
}

export const useLogout = () => {
    return useMutation({
        mutationFn: async () => {
            await client.post("/auth/logout")
        },
        onSuccess: () => {
            toast.success("User logged out successfully!")
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to log user out!")
        }
    })
}

export const getUserProfile = (enabled = true) => {
    return useQuery({
        queryKey: ["user-profile"],
        queryFn: fetchUserProfile,
        enabled,
    });
}

export const fetchUserProfile = async () => {
    const response = await client.get("/user/profile");
    const profile = (response.data.data?.profile ?? response.data.profile ?? response.data.data) as UserProfile;
    tokenStore.getState().setProfile(profile);
    return profile;
}
    

type APIKey = {
    id: string
    liveKey: string
    testKey: string
    createdAt: string
    lastUsed: string
}

export const generateAPIKey = () => {
    return useMutation<APIKey, Error, { twoFAKey: string }>({
        mutationFn: async ({ twoFAKey }: {twoFAKey: string}) => {
            //add key to header
            client.defaults.headers.common["2-fa-key"] = twoFAKey;
            const response = await client.post("/user/api-keys");
            return response.data.data;
        },
        onSuccess: (data) => {
            toast.success("API key generated successfully!");
            return data;
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to generate API key");
        }
    });
}

export const regenerateAPIKeys = () => {
    return useMutation<APIKey, Error, { twoFAKey: string, keyId: string }>({
        mutationFn: async ({ twoFAKey, keyId }: {twoFAKey: string, keyId: string}) => {
            //add key to header
            client.defaults.headers.common["2-fa-key"] = twoFAKey;
            const response = await client.post("/user/api-keys/regenerate", { keyId });
            return response.data.data;
        },
        onSuccess: (data) => {
            toast.success("API keys regenerated successfully!");
            return data;
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to regenerate API keys");
        }
    });
}

export const getAPIKeys = () => {
    return useQuery({
        queryKey: ["api-keys"],
        queryFn: async () => {
            const response = await client.get("/user/api-keys");
            return response.data.data as APIKey;
        }
    })
}

export const toggleBusinessMode = () => {
    return useMutation({
        mutationFn: async () => {
            await client.post("/user/business/mode");
        },
        onSuccess: () => {
            toast.success("Business mode toggled successfully!");
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to toggle business mode");
        }
    });
}

export const toggleNotification = () => {
    return useMutation({
        mutationFn: async () => {
            const response = await client.post("/user/notification");
            return response.data.message;
        },
        onSuccess: (message: string) => {
            toast.success(message || "Notification preference toggled successfully!");
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Unable to toggle business mode");
        }
    })
}





