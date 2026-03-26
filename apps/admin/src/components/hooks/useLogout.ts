import { useMutation } from "@tanstack/react-query";
import { client } from "../client/client";
import { toast } from "sonner";
import { useLocation } from "wouter";

export const useLogoutMutation = () => {
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      const response = await client.post("/auth/logout", {});
      return response.data;
    },

    onSuccess: () => {
      toast.success("Logged out successfully");
      setLocation("/login");
    },

    onError: () => {
      toast.info("Logged out");
      setLocation("/login");
    },
  });
};
