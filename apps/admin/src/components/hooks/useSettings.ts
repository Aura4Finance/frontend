import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, tokenStore } from "../client/client";
import { toast } from "sonner";

// Types
export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phoneNumber?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  transactionAlerts: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
  securityAlerts?: boolean;
  weeklyReports?: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
  sessions?: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Hooks
export const useAdminProfile = () => {
  return useQuery<AdminProfile>({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const response = await client.get("/admin/profile");
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await client.patch("/admin/profile", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });
};

export const useNotificationPreferences = () => {
  return useQuery<NotificationPreferences>({
    queryKey: ["admin", "notification-preferences"],
    queryFn: async () => {
      const response = await client.get("/admin/settings/notifications");
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const response = await client.patch("/admin/settings/notifications", preferences);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notification-preferences"] });
      toast.success("Notification preferences updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update preferences");
    },
  });
};

export const useSecuritySettings = () => {
  return useQuery<SecuritySettings>({
    queryKey: ["admin", "security-settings"],
    queryFn: async () => {
      const response = await client.get("/admin/settings/security");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useChangePasswordSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await client.post("/admin/settings/change-password", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "security-settings"] });
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to change password");
    },
  });
};

export const useEnable2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await client.post("/admin/settings/enable-2fa");
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "security-settings"] });
      toast.success("Two-factor authentication enabled");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to enable 2FA");
    },
  });
};

export const useDisable2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const response = await client.post("/admin/settings/disable-2fa", { code });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "security-settings"] });
      toast.success("Two-factor authentication disabled");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to disable 2FA");
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await client.post("/admin/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
      toast.success("Avatar uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to upload avatar");
    },
  });
};

export const useLogout = () => {
  const clearToken = tokenStore((s) => s.clearToken);

  return useMutation({
    mutationFn: async () => {
      await client.post("/admin/logout");
    },
    onSuccess: () => {
      clearToken();
      toast.success("Logged out successfully");
      window.location.href = "/login";
    },
    onError: () => {
      // Even if logout fails on backend, clear local token
      clearToken();
      window.location.href = "/login";
    },
  });
};

export const useTerminateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await client.delete(`/admin/settings/sessions/${sessionId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "security-settings"] });
      toast.success("Session terminated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to terminate session");
    },
  });
};
