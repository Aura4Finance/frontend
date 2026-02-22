import { useMutation } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";

interface ResetPasswordData {
  email: string;
  oldPassword: string;
  newPassword: string;
}

// Hook
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await client.post("/admin/auth/change-password", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to change password");
    },
  });
};
