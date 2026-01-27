import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useAuth } from "../store/auth";

interface ResetPasswordDto {
  otp: string;
  email: string;
  password: string;
}

export const useResetPasswordMutation = () => {
  const [, setLocation] = useLocation();
  const { clearEmail } = useAuth();
  return useMutation({
    mutationFn: async (data: ResetPasswordDto) => {
      await client.post("/auth/reset-password", data);
    },
    onSuccess: () => {
      toast.success("Password Reset Successful!");
      setLocation("/signin");
      clearEmail();
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Invalid Login Credentials");
    },
  });
};
