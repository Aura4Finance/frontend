import { useMutation } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";
import type { ForgotPasswordRequest, ApiResponse } from "../../lib/api-types";

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const response = await client.post<ApiResponse>("/admin/auth/forgot-password", data);
      return response.data;
    },

    onSuccess: (data: ApiResponse) => {
      toast.success(data.message || "Password reset link sent to your email");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to send reset link"
      );
    },
  });
};
