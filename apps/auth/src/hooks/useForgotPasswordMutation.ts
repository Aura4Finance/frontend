import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";
import { useLocation } from "wouter";

export interface ForgotPasswordSchema {
  email: string;
}

export const useForgotPasswordMutation = () => {
  const [, setLocation] = useLocation();
  return useMutation({
    mutationFn: async (data: ForgotPasswordSchema) => {
      await client.post("/auth/forgot-password", data);
    },
    onSuccess: () => {
      toast.success("OTP sent!");
      setLocation("/reset-password");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Invalid Login Credentials");
    },
  });
};
