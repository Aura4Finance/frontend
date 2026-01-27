import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";
import { useAuth } from "../store/auth";

interface ResendOtpSchema {
  email: string;
}

export const useResendOtpMutation = () => {
  const { clearEmail } = useAuth();
  return useMutation({
    mutationFn: async (data: ResendOtpSchema) => {
      await client.post("/auth/resend-otp", data);
    },
    onSuccess: () => {
      toast.success("OTP has been resent!");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Invalid Login Credentials");
      clearEmail();
    },
  });
};
