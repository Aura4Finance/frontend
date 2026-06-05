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
import { FaKey, FaShieldHalved, FaCopy, FaCheck } from "react-icons/fa6";
import { useVerifyEmailMutation, type TwoFASetup } from "../hooks/useSignupMutation";
import { useResendOtpMutation } from "../hooks/useResendOtpMutation";
import { useAuth } from "../store/auth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { Helmet } from "react-helmet-async";

const TwoFAPopup = ({
  twoFaData,
  onProceed,
}: {
  twoFaData: TwoFASetup;
  onProceed: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(twoFaData.manualCode);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-10">
      <Helmet>
        <title>Set Up Two-Factor Authentication</title>
        <meta name="description" content="Scan the QR code or enter the manual code to set up 2FA on your account." />
      </Helmet>
      <Card className="w-full max-w-md border border-blue-950/20 shadow-2xl p-5 bg-white">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-950/10">
            <FaShieldHalved className="h-7 w-7 text-blue-950" />
          </div>
          <CardTitle className="text-xl font-semibold">
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Scan the QR code below with an authenticator app (e.g. Google
            Authenticator, Authy) to enable 2FA on your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-xl border-2 border-dashed border-blue-950/20 bg-white p-4">
              <QRCodeSVG
                value={twoFaData.otpauth_url}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Manual Code */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 text-center uppercase tracking-wide">
              Or enter this code manually
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5">
              <code className="flex-1 text-center text-sm font-mono font-semibold tracking-widest text-blue-950 select-all">
                {twoFaData.manualCode}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-md p-1.5 text-gray-400 hover:text-blue-950 hover:bg-gray-200 transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <FaCheck className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <FaCopy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-blue-950/5 border border-blue-950/10 p-3.5 space-y-2">
            <p className="text-xs font-semibold text-blue-950">How it works:</p>
            <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
              <li>
                Open your authenticator app and scan the QR code or enter the
                manual code above.
              </li>
              <li>
                The app will generate a 6-digit code that refreshes every 30
                seconds.
              </li>
              <li>
                You'll need this code each time you perform sensitive actions
                like payouts or API key management.
              </li>
            </ol>
          </div>

          {/* Proceed Button */}
          <Button
            onClick={onProceed}
            variant="ghost"
            size="lg"
            className="w-full bg-blue-950 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90"
          >
            Proceed to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

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

  const handleProceedToLogin = () => {
    clearEmail();
    setLocation("/signin");
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
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-xl " />
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

      {/* 2FA Setup Popup */}
      {verifyEmailMutation.isSuccess && verifyEmailMutation.data && (
        <TwoFAPopup
          twoFaData={verifyEmailMutation.data}
          onProceed={handleProceedToLogin}
        />
      )}
    </Wrapper>
  );
};

export default VerifyEmail;
