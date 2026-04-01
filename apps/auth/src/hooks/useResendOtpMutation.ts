import { useMutation } from "@tanstack/react-query";
import client from "../client/client";
import { toast } from "sonner";

interface ResendOtpSchema {
  email: string;
}

export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: async (data: ResendOtpSchema) => {
      await client.post("/auth/resend-otp", data);
    },
    onSuccess: () => {
      toast.success("OTP has been resent!");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Invalid Login Credentials");
    },
  });
};
