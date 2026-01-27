import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";

export interface LoginSchema {
  email: string;
  password: string;
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await client.post("/auth/login", data);
      const code = response.data.data.code.secret;
      window.location.href = `http://localhost:3200/auth/callback?code=${code}`;
    },
    onSuccess: () => {
      toast.success("Login Successful");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Invalid Login Credentials");
    },
  });
};
