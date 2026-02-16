import { useState, type SetStateAction } from "react";
import { Link } from "wouter";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@orafi/ui";
import logo from "@orafi/ui/assets/OraFi.png";
import { FiAlertCircle } from "react-icons/fi";
import { useLoginMutation } from "../hooks/useLoginMutation"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginMutation = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      await loginMutation.mutateAsync({ email, password });
    }catch(error: any){
      setError(error.response?.data?.message || "An error occurred during login");
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
        
        <Card className="border-none shadow-xl p-7">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold text-gray-900">Admin Login</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
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
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password">
                    <a className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</a>
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: { target: { value: SetStateAction<string>; }; }) => setPassword(e.target.value)}
                  className="bg-white h-10"
                  required
                />
              </div>
              
              <Button 
                variant="default"
                onClick={handleLogin} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} OraFi. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
