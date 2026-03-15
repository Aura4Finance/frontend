import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";

export interface LoginSchema {
  email: string;
  password: string;
}

export interface SignUpSchema {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await client.post("/auth/login", data);
      const userId = response.data.data.userId;
      return userId;
    },
    onSuccess: () => {
      toast.success("Continue to 2FA verification");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Invalid Login Credentials");
    },
  });
};

export const useLogin2FAMutation = () => {
  return useMutation({
    mutationFn: async (user: { userId: string, token: string }) => {
      const response = await client.post("/auth/login/2fa", { userId: user.userId, token: user.token });
      const code = response.data.data.secret;
      window.location.href = `https://dashboard.orafi.app/auth/callback?code=${code}`;
    },
    onSuccess: () => {
      toast.success("Login Successful");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Invalid Login Credentials");
    },
  });
} 
