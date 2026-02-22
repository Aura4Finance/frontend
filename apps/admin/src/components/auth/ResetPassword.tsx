import { useState, type SetStateAction } from "react";
import { Link } from "wouter";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@orafi/ui";
import logo from "@orafi/ui/assets/OraFi.png";
import { FiAlertCircle, FiArrowLeft, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useResetPasswordMutation } from "../hooks/useResetPassword";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const { mutate: resetPassword, isPending: isLoading } = useResetPasswordMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !otp || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    resetPassword(
      { email, otp, password },
      {
        onError: (error: any) => {
          setError(error?.response?.data?.message || "Failed to reset password");
        },
      }
    );
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

        <Card className="border-none shadow-xl p-6">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <FiLock className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Reset Password</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Enter the OTP sent to your email and set a new password
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e: { target: { value: SetStateAction<string> } }) => setEmail(e.target.value)}
                  className="bg-white h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">OTP Code</label>
                <Input
                  type="text"
                  placeholder="Enter OTP from your email"
                  value={otp}
                  onChange={(e: { target: { value: SetStateAction<string> } }) => setOtp(e.target.value)}
                  className="bg-white h-10 tracking-widest"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e: { target: { value: SetStateAction<string> } }) => setPassword(e.target.value)}
                    className="bg-white h-10 pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e: { target: { value: SetStateAction<string> } }) => setConfirmPassword(e.target.value)}
                    className="bg-white h-10 pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>

              <div className="text-center pt-2">
                <Link href="/login">
                  <a className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors">
                    <FiArrowLeft className="w-3 h-3" /> Back to Login
                  </a>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
