import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@orafi/ui/button";
import Wrapper from "../layouts/Wrapper";
import { FaRegEye } from 'react-icons/fa';
import { FaRegEyeSlash } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa6';
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
import { Input } from "@orafi/ui/input";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignUpMutation } from "../hooks/useSignupMutation";
import type { LoginSchema } from "../hooks/useLoginMutation";
import { useAuth } from "../store/auth";


const Signup = () => {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const signUpMutation = useSignUpMutation()
  const { setEmail } = useAuth()

  const signUpSchema = z.object({
    firstname: z.string("Enter your username"),
    lastname: z.string("Enter your lastname"),
    email: z.email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
  });

  const handleCreateAccountMutation = (value: LoginSchema) => {
    signUpMutation.mutate({
      firstname: value.firstname,
      lastname: value.lastname,
      email: value.email,
      password: value.password
    });
    setEmail(value.email);
  }

  const handleGoogleSignIn = (e: any) => {
    e.preventDefault();
    const redirectUri = "http://localhost:3200/auth/callback";
    const clientId = import.meta.env.VITE_CLIENT_ID;

    const url =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      "&response_type=code" +
      "&scope=openid%20email%20profile" +
      "&access_type=offline";
    window.location.href = url;
  }

  const handleShowPasswordToggle = (e: any) => {
    e.preventDefault()
    setShowConfirmPassword(!showConfirmPassword);
  }
  return (
    <Wrapper>
      <Card className="p-5 border border-b-black">
        <CardHeader className='text-center pb-6'>
          <CardTitle className='text-2xl font-semibold'>
            Create Your Account
          </CardTitle>
          <CardDescription>
            Fill in your details to get your aura farm!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateAccountMutation)}>
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firstname</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IoMdContact className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="John"
                          {...field}
                          className="pl-10 pr-10 border-l-4"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lastname</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IoMdContact className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Doe"
                          {...field}
                          className="pl-10 pr-10 border-l-4"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormMessage />
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                    <FormMessage className='text-red-800' />
                  </FormItem>
                )}
              />
              <Button
                variant="ghost"
                size="lg"
                asChild={false}
                className="w-full bg-blue-950 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 mt-4"
                disabled={signUpMutation.isPending}
              >
                {signUpMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-xl " />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
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
            </form>
          </Form>
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="font-medium text-black hover:text-grey-500">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </Wrapper>
  )
}

export default Signup