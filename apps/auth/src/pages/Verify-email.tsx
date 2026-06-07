import { useState, useEffect } from "react";
import Wrapper from "../layouts/Wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@orafi/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@orafi/ui";
import { Input } from "@orafi/ui";
import { Button } from "@orafi/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaKey } from "react-icons/fa6";
import { useVerifyEmailMutation } from "../hooks/useSignupMutation";
import { useResendOtpMutation } from "../hooks/useResendOtpMutation";
import { useAuth } from "../store/auth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";

const VerifyEmail = () => {
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const verifyEmailMutation = useVerifyEmailMutation();
  const resendOtpMutation = useResendOtpMutation();
  const { email, clearEmail } = useAuth();
  const [, setLocation] = useLocation();

  const forgotPasswordSchema = z.object({
    otp: z.string().min(6, "OTP must be at least 6 digits"),
  });

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema as any),
  });

  const handleVerifyAccountMutation = (value: any) => {
    verifyEmailMutation.mutate({
      email: email as string,
      otp: value.otp,
    });
  };

  const handleResendOtp = () => {
    resendOtpMutation.mutate({ email: email as string });
    setIsResendDisabled(true);
    setTimer(60);
  };

  useEffect(() => {
    if (!email) {
      toast.error("Email not found");
      setLocation("/");
    }
    let countdown: number;
    if (isResendDisabled && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(countdown);
  }, [isResendDisabled, timer]);

  useEffect(() => {
    if (verifyEmailMutation.isSuccess) {
      clearEmail();
      setLocation("/signin");
    }
  }, [verifyEmailMutation.isSuccess]);

  return (
    <Wrapper>
      <Helmet>
        <title>Verify Email</title>
        <meta name="description" content="Enter the OTP sent to your email address to secure your aura farm!" />
      </Helmet>
      <Card className="p-5 border border-b-black">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the OTP sent to your email address to secure your aura farm!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerifyAccountMutation)}>
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <FaKey className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="235678"
                          {...field}
                          className="pl-10 pr-24 border-l-4"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 text-xs px-3 py-2 rounded hover:bg-blue-950"
                          disabled={isResendDisabled}
                          onClick={handleResendOtp}
                        >
                          {isResendDisabled ? `Resend in ${timer}s` : "Resend OTP"}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className='text-red-800'/>
                  </FormItem>
                )}
              />

              <Button
                variant="ghost"
                size="lg"
                asChild={false}
                className="w-full bg-blue-950 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 mt-4"
                disabled={verifyEmailMutation.isPending}
              >
                {verifyEmailMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-xl" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default VerifyEmail;
