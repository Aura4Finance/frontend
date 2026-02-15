import { useMutation } from "@tanstack/react-query";
import { client, tokenStore } from "../client/client";
import { toast } from "sonner";
import { useLocation } from "wouter";

export interface LoginSchema {
  email: string;
  oldPassword: string;
  newPassword: string
}

export const useChangePasswordMutation = () => {
  const [, setLocation] = useLocation();

  const setToken = tokenStore((s) => s.setToken);

  return useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await client.post("/auth/change-password", data);
      return response.data.data.accessToken;
    },

    onSuccess: (accessToken: string) => {
      setToken(accessToken);
      toast.success("Login Successful");
      setLocation("/dashboard");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Invalid Login Credentials"
      );
    },
  });
};
