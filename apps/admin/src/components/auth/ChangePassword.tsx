import { useState, type SetStateAction } from "react";
import { useLocation } from "wouter";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@orafi/ui";
import logo from "@orafi/ui/assets/OraFi.png";
import { FiAlertCircle, FiLock } from "react-icons/fi";

const ChangePassword = () => {
  const [, setLocation] = useLocation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard on success
      setLocation("/");
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
            <div className="mx-auto w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
              <FiLock className="w-5 h-5 text-yellow-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Change Password</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Please change your temporary password to continue
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
                <label className="text-xs font-medium text-gray-700">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e: { target: { value: SetStateAction<string>; }; }) => setCurrentPassword(e.target.value)}
                  className="bg-white h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e: { target: { value: SetStateAction<string>; }; }) => setNewPassword(e.target.value)}
                  className="bg-white h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e: { target: { value: SetStateAction<string>; }; }) => setConfirmPassword(e.target.value)}
                  className="bg-white h-10"
                  required
                />
              </div>
              
              <Button 
                variant="default"
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
