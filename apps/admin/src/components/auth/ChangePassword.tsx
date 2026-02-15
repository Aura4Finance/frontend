import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import logo from "@orafi/ui/assets/OraFi.png";
import { FiLock } from "react-icons/fi";
import changePasswordStore from "../../store/changePassword";
import { useChangePasswordMutation } from "../hooks/useChangePasswordMutation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@orafi/ui";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@orafi/ui";

import { Button } from "@orafi/ui";
import { Input } from "@orafi/ui";
import { toast } from "sonner";

const changePasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data: { newPassword: string; confirmPassword: string; }) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

const ChangePassword = () => {
  const [, setLocation] = useLocation();
  const changePasswordMutation = useChangePasswordMutation();
  const { 
    email,
    password, 
    clearAuthInformationState
   } = changePasswordStore();

  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordSchema) => {
    try {
      // TODO: call your mutation here
      console.log(values);

      toast.success("Password updated successfully");
      setLocation("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="OraFi Logo"
            className="w-12 h-12 rounded-full object-cover shadow-md"
          />
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
              <FiLock className="w-5 h-5 text-yellow-600" />
            </div>

            <CardTitle className="text-xl font-bold text-gray-900">
              Change Password
            </CardTitle>

            <CardDescription className="text-sm text-gray-500">
              Please change your temporary password to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-700" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-700" />
                    </FormItem>
                  )}
                />

                <Button
                  variant="default"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Updating Password..."
                    : "Update Password"}
                </Button>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
