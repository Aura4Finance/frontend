import { useMutation } from "@tanstack/react-query";
import { client, tokenStore } from "../client/client";
import changePasswordStore from "../../store/changePassword";
import { toast } from "sonner";
import { useLocation } from "wouter";

export interface LoginSchema {
  email: string;
  password: string;
}

export const useLoginMutation = () => {
  const [, setLocation] = useLocation();

  const setToken = tokenStore((s) => s.setToken);
  const setAuthInformationState = changePasswordStore(
    (s) => s.setAuthInformationState
  );

  return useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await client.post("/admin/auth/login", data);
      return response.data.data.accessToken;
    },

    onSuccess: (accessToken: string) => {
      setToken(accessToken);
      toast.success("Login Successful");
      setLocation("/dashboard");
    },

    onError: (error: any, variables: LoginSchema) => {
      console.log(error);

      // user must change password
      if (error?.response?.status === 406) {
        setAuthInformationState({
          email: variables.email,
          password: variables.password,
        });

        toast.info("You must change your password");
        setLocation("/change-password");
        return;
      }

      toast.error(
        error?.response?.data?.message || "Invalid Login Credentials"
      );
    },
  });
};
