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
      if(response.data.data.twoFANeeded){
        return response.data.data.userId
      }
    window.location.href = `https://dashboard.orafi.app/auth/callback?code=${response.data.data.otpSecret}`;
    },
    onSuccess: () => {
      toast.success(`${twoFANeeded ? "Continue with 2FA" : "Login Successful"}`);
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
