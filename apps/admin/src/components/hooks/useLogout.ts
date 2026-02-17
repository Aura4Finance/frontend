import { useMutation } from "@tanstack/react-query";
import { client, tokenStore } from "../client/client";
import { toast } from "sonner";
import { useLocation } from "wouter";

export const useLogoutMutation = () => {
  const [, setLocation] = useLocation();
  const clearToken = tokenStore((s) => s.clearToken);

  return useMutation({
    mutationFn: async () => {
      const response = await client.post("/auth/logout", {});
      return response.data;
    },

    onSuccess: () => {
      clearToken();
      toast.success("Logged out successfully");
      setLocation("/login");
    },

    onError: (error: any) => {
      // Even if the API call fails, clear the token locally
      clearToken();
      toast.info("Logged out");
      setLocation("/login");
    },
  });
};
