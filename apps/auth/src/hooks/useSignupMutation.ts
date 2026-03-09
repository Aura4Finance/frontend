import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";
import type { SignUpSchema } from "./useLoginMutation";
import { useLocation } from "wouter";

interface verifyEmailSchema {
  otp: string;
  email: string;
}

export interface TwoFASetup {
  otpauth_url: string,
  manualCode: string
}

export const useSignUpMutation = () => {
  const [, setLocation] = useLocation();
  return useMutation({
    mutationFn: async (data: SignUpSchema) => {
      await client.post("/auth/create-account", data);
    },
    onSuccess: () => {
      toast.success("Merchant account created successfully!");
      setLocation("/verify");
    },
    onError: (error: any) => {
      toast.error(error.response.data?.message || "Error creating account");
    },
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: async (data: verifyEmailSchema) => {
      const response = await client.post("/auth/verify-email", data);
      return response.data.data as TwoFASetup;
    },
    onSuccess: () => {
      toast.success("Merchant account verified successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Error verifying account");
    },
  });
};
