import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";
import type { LoginSchema } from "./useLoginMutation";
import { useAuth } from "../store/auth";
import { useLocation } from "wouter";

interface verifyEmailSchema {
  otp: string;
  email: string;
}

export const useSignUpMutation = () => {
  const [, setLocation] = useLocation();
  return useMutation({
    mutationFn: async (data: LoginSchema) => {
      await client.post("/auth/create-account", data);
    },
    onSuccess: () => {
      toast.success("Merchant account created successfully!");
      setLocation("/verify");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Error creating account");
    },
  });
};

export const useVerifyEmailMutation = () => {
  const { clearEmail } = useAuth();
  const [, setLocation] = useLocation();
  return useMutation({
    mutationFn: async (data: verifyEmailSchema) => {
      await client.post("/auth/verify-email", data);
    },
    onSuccess: () => {
      toast.success("Merchant account verified successfully!");
      clearEmail();
      setLocation("/signin");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Error verifying account");
    },
  });
};
