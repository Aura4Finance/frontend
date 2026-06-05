import Wrapper from "../layouts/Wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@orafi/ui";
import { IoMdContact } from "react-icons/io";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@orafi/ui';
import { Input } from "@orafi/ui";
import { Button } from "@orafi/ui";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from "../store/auth";;
import { useForgotPasswordMutation, type ForgotPasswordSchema } from "../hooks/useForgotPasswordMutation";
import {  Helmet } from "react-helmet-async"

const ForgotPassword = () => {
  const forgotPasswordSchema = z.object({
    email: z.email("Please enter a valid email address")
  });
  const { setEmail } = useAuth()
  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema as any),
    defaultValues: {
      email: ""
    }
  })

  const handleForgotPasswordMutation = (value: ForgotPasswordSchema) => {
    forgotPasswordMutation.mutate(value);
    setEmail(value.email);
  }

  return (
    <Wrapper>
      <Helmet>
        <title>Forgot Password</title>
        <meta name="description" content="Recover account" />
      </Helmet>
      <Card className="p-5 border border-b-black">
        <CardHeader className='text-center pb-6'>
          <CardTitle className='text-2xl font-semibold'>
            Enter your email address
          </CardTitle>
          <CardDescription>
            An OTP will be sent if the email address is found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleForgotPasswordMutation)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IoMdContact className="absolute left-3 top-3 h-4 w-4 text-grey-400" />
                        <Input
                          placeholder="example@gmail.com"
                          {...field}
                          className="pl-10 pr-10 border-l-4"
                        />
                      </div>
                    </FormControl>
                    <FormMessage  className="text-red-800"/>
                  </FormItem>
                )}
              />
              <Button
                variant="ghost"
                size="lg"
                asChild={false}
                className="w-full bg-blue-950 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 mt-4"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-xl " />
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Get OTP'
                )}
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Wrapper>
  )
}
export default ForgotPassword