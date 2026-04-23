import { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Wrapper from "../layouts/Wrapper";
import { FaRegEye } from 'react-icons/fa';
import { FaRegEyeSlash } from 'react-icons/fa';
import { FaLock, FaShieldHalved } from 'react-icons/fa6';
import { FcGoogle } from "react-icons/fc";
import { IoMdContact } from "react-icons/io";
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
import { Button } from "@orafi/ui/button";
import { Input } from "@orafi/ui/input";
import { useLoginMutation, useLogin2FAMutation, type LoginSchema } from '../hooks/useLoginMutation';

const TwoFAStep = ({
  userId,
  onBack,
}: {
  userId: string;
  onBack: () => void;
}) => {
  const login2FAMutation = useLogin2FAMutation();

  const totpSchema = z.object({
    token: z.string().min(6, 'Enter the 6-digit code from your authenticator app'),
  });

  const form = useForm({
    resolver: zodResolver(totpSchema),
    defaultValues: { token: '' },
  });

  const handleSubmit = (value: { token: string }) => {
    login2FAMutation.mutate({ userId, token: value.token });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm border bg-white border-blue-950/20 shadow-2xl p-5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-950/10">
            <FaShieldHalved className="h-7 w-7 text-blue-950" />
          </div>
          <CardTitle className="text-xl font-semibold">
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Open your authenticator app and enter the 6-digit code to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authenticator Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FaShieldHalved className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="000000"
                          autoFocus
                          className="pl-10 text-center text-lg font-mono tracking-[0.3em] border-l-4"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-800" />
                  </FormItem>
                )}
              />

              <Button
                variant="ghost"
                size="lg"
                asChild={false}
                className="w-full bg-blue-950 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90"
                disabled={login2FAMutation.isPending}
              >
                {login2FAMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-xl" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify & Login'
                )}
              </Button>

              <button
                type="button"
                onClick={onBack}
                className="w-full text-center text-sm text-gray-500 hover:text-blue-950 transition-colors"
              >
                &larr; Back to login
              </button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

const Signin = () => {

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const loginMutation = useLoginMutation();


  const signInSchema = z.object({
    email: z.email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  });

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  const handleGoogleSignIn = (e: any) => {
    e.preventDefault();
    const redirectUri = import.meta.env.VITE_REDIRECT_URL;
    const clientId = import.meta.env.VITE_CLIENT_ID;

    const url =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      "&response_type=code" +
      "&scope=openid%20email%20profile" +
      "&access_type=offline";
      window.location.assign(url);
  }

  const handleShowPasswordToggle = (e: any) => {
    e.preventDefault()
    setShowConfirmPassword(!showConfirmPassword);
  }
  const handleLoginMutation = (value: LoginSchema) => {
    loginMutation.mutate(value);
  }

  const handleBackToLogin = () => {
    loginMutation.reset();
  }

  return (
    <Wrapper>
      <Card className='p-5 border border-b-black'>
        <CardHeader className='text-center pb-6'>
          <CardTitle className='text-2xl font-semibold'>
            Login with Aura!
          </CardTitle>
          <CardDescription>
            Welcome back.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLoginMutation)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IoMdContact className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="example@gmail.com"
                          {...field}
                          className="pl-10 pr-10 border-l-4"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-red-800' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <FaLock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                    <FormMessage className='text-red-800' />
                  </FormItem>
                )}
              />
              <Button
                variant="ghost"
                size="lg"
                asChild={false}
                className="w-full bg-blue-950 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 mt-4"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-xl " />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </Button>
              <div className="flex items-center my-2">
                <div className="grow h-px bg-gray-300" />
                <span className="px-3 text-gray-500 text-sm">or</span>
                <div className="grow h-px bg-gray-300" />
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full border-gray-300 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 rounded-xl p-3"
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="h-5 w-5" />
              </Button>
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Forgot password?{' '}
                  <Link href="/forgot-password" className="font-medium text-black hover:text-grey-500 hover:underline">
                    Recover it.
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  New to orafi?{' '}
                  <Link href="/signup" className="font-medium text-black hover:text-grey-500 hover:underline">
                    Sign Up.
                  </Link>
                </p>
              </div>
            </form>
          </Form >
        </CardContent>
      </Card>
      {/* 2FA Step Overlay */}
      {loginMutation.isSuccess && loginMutation.data && (
        <TwoFAStep
          userId={loginMutation.data}
          onBack={handleBackToLogin}
        />
      )}
    </Wrapper >
  )
}

export default Signin