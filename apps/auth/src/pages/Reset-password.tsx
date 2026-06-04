import { useState, useEffect } from "react";
import Wrapper from "../layouts/Wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@orafi/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@orafi/ui/form';
import { Input } from "@orafi/ui/input";
import { Button } from "@orafi/ui/button";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from "wouter";
import { FaKey } from 'react-icons/fa6';
import { FaLock } from 'react-icons/fa6';
import { FaRegEye } from 'react-icons/fa';
import { FaRegEyeSlash } from 'react-icons/fa';
import { useAuth } from "../store/auth";
import {useResetPasswordMutation  } from "../hooks/useResetPasswordMutation";
import { useResendOtpMutation } from "../hooks/useResendOtpMutation";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";



const ResetPassword = () => {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const { email } = useAuth();
  const resetPasswordMutation = useResetPasswordMutation()
  const resendOtpMutation = useResendOtpMutation()
  const [ , setLocation ] = useLocation()

  const forgotPasswordSchema = z.object({
    otp: z.string(),
    newPassword: z.string().min(8, 'Password is too weak'),
    confirmNewPassword: z.string().min(1, 'Password is required'),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Password does not match",
    path: ["confirmNewPassword"]
  })

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const handleResendOtp = () => {
    resendOtpMutation.mutate({ email: email as string });
    setIsResendDisabled(true);
    setTimer(60); 
  };
  
  useEffect(() => {
    if(!email){
      toast.error("Email not found");
      setLocation("/forgot-password");
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


  const handleShowPasswordToggle = (e: any) => {
    e.preventDefault();
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleResetPasswordMutation = (value: any) => {
    resetPasswordMutation.mutate({
      otp: value.otp,
      email: email as string,
      password: value.newPassword
    });
  }

  return (
    <Wrapper>
      <Helmet>
        <title>Reset Password</title>
        <meta name="description" content="Reset your password" />
      </Helmet>
      <Card className="p-5 border border-b-black">
        <CardHeader className='text-center pb-6'>
          <CardTitle className='text-2xl font-semibold'>
            Reset Password
          </CardTitle>
          <CardDescription>
            {`Enter the OTP sent to your email(${email})`}.<br></br>
             Make sure your new password has aura!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleResetPasswordMutation)}>
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FaKey className="absolute left-3 top-3 h-4 w-4 text-grey-400" />
                        <Input
                          type="number"
                          {...field}
                          className="pl-10 pr-10 border-l-4"
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <FaLock className="absolute left-3 top-3 h-4 w-4 text-grey-400" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 border-l-4"
                          {...field}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild={false}
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={handleShowPasswordToggle}
                        >
                          {showConfirmPassword ? (
                            <FaRegEye className="h-4 w-4 text-black" />
                          ) : (
                            <FaRegEyeSlash className="h-4 w-4 text-black" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600"/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3 h-4 w-4 text-black" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10 border-l-4"
                          {...field}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild={false}
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={handleShowPasswordToggle}
                        >
                          {showConfirmPassword ? (
                            <FaRegEye className="h-4 w-4 text-black" />
                          ) : (
                            <FaRegEyeSlash className="h-4 w-4 text-black" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600"/>
                  </FormItem>
                )}
              />
              <Button
                variant="ghost"
                size="lg"
                asChild={false}
                className="w-full bg-blue-950 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 mt-4"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-xl " />
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Wrapper>
  )
}

export default ResetPassword