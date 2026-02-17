import { useMutation } from "@tanstack/react-query";
import { client, tokenStore } from "../client/client";
import { toast } from "sonner";
import { useLocation } from "wouter";
import type { ResetPasswordRequest, AdminLoginResponse, ApiResponse } from "../../lib/api-types";

export const useResetPasswordMutation = () => {
  const [, setLocation] = useLocation();
  const setToken = tokenStore((s) => s.setToken);

  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await client.post<ApiResponse<AdminLoginResponse>>("/auth/reset-password", data);
      return response.data.data;
    },

    onSuccess: (data) => {
      if (data.accessToken) {
        setToken(data.accessToken);
        toast.success("Password reset successful");
        setLocation("/dashboard");
      } else {
        toast.success("Password reset successful. Please login.");
        setLocation("/login");
      }
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to reset password"
      );
    },
  });
};
