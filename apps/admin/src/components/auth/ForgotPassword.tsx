import { useState, type SetStateAction } from "react";
import { Link } from "wouter";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@orafi/ui";
import logo from "@orafi/ui/assets/OraFi.png";
import { FiCheckCircle, FiAlertCircle, FiArrowLeft } from "react-icons/fi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
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
            <CardTitle className="text-xl font-bold text-gray-900">Reset Password</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Enter your email to receive password reset instructions
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">Check your email</h3>
                  <p className="text-sm text-gray-500">
                    We've sent password reset instructions to <span className="font-medium text-gray-900">{email}</span>
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="w-full mt-2">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
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
                      onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEmail(e.target.value)}
                      className="bg-white h-10"
                      required
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmit}
                    variant="default" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending Instructions..." : "Reset Password"}
                  </Button>
                  
                  <div className="text-center pt-2">
                    <Link href="/login">
                      <a className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors">
                        <FiArrowLeft className="w-3 h-3" /> Back to Login
                      </a>
                    </Link>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
