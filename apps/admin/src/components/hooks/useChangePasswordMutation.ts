import { useMutation } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";
import { useLocation } from "wouter";

export interface ChangePasswordSchema {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export const useChangePasswordMutation = () => {
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: ChangePasswordSchema) => {
      await client.post("/admin/auth/change-password", data);
    },

    onSuccess: () => {
      toast.success("Password changed successfully");
      setLocation("/dashboard");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Invalid Login Credentials"
      );
    },
  });
};
