import { useMutation } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";
import { useLocation } from "wouter";
import type { ResetPasswordRequest, AdminLoginResponse, ApiResponse } from "../../lib/api-types";

export const useResetPasswordMutation = () => {
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
       await client.post<ApiResponse<AdminLoginResponse>>("/auth/reset-password", data);
    },

    onSuccess: () => {
        toast.success("Password reset successful");
        setLocation("/dashboard");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to reset password"
      );
    },
  });
};
