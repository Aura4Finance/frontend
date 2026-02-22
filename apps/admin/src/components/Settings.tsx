import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import { Button, Input } from "@orafi/ui";
import { FiUser, FiBell, FiLock, FiLogOut, FiMail, FiShield, FiEye, FiEyeOff } from "react-icons/fi";
import { useAdminProfile } from "./hooks/useProfile";
import { useLogoutMutation } from "./hooks/useLogout";
import { useResetPassword } from "./hooks/useSettings";
import ErrorState from "./shared/ErrorState";

const Settings = () => {
  const { data: profile, isLoading, error, refetch } = useAdminProfile();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordError("");
  };

  const handleResetPassword = () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    resetPassword(
      {
        email: profile?.email || "",
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      },
      {
        onSuccess: () => {
          setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <DashboardWrapper>
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-xs mt-0.5">Manage your account and preferences</p>
        </div>
        <div className="p-4 max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 rounded-xl"></div>
            <div className="h-40 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  if (error) {
    return (
      <DashboardWrapper>
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-xs mt-0.5">Manage your account and preferences</p>
        </div>
        <div className="p-4 max-w-3xl">
          <ErrorState
            message="Failed to load profile data"
            onRetry={refetch}
            type="error"
          />
        </div>
      </DashboardWrapper>
    );
  }

  const initials = `${(profile?.firstname?.[0] || "").toUpperCase()}${(profile?.lastname?.[0] || "").toUpperCase()}`;

  return (
    <DashboardWrapper>
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-xs mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="p-4 max-w-3xl">
        {/* Profile Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <FiUser className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Profile Information</h2>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
              {initials}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {profile?.firstname} {profile?.lastname}
              </h3>
              <p className="text-xs text-gray-500 capitalize">{profile?.role?.toLowerCase()}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiMail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiShield className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-500">Role</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{profile?.role?.toLowerCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiUser className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-500">Provider</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{profile?.provider?.toLowerCase()}</p>
              </div>
            </div>
            {profile?.createdAt && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiUser className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-500">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reset Password Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <FiLock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Reset Password</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Current Password</label>
              <div className="relative">
                <Input
                  type={showPasswords.old ? "text" : "password"}
                  value={passwordForm.oldPassword}
                  onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                  placeholder="Enter current password"
                  className="w-full h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((p) => ({ ...p, old: !p.old }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.old ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}

            <div className="flex justify-end pt-1">
              <Button
                variant="default"
                onClick={handleResetPassword}
                disabled={isResetting}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiLock className="w-3.5 h-3.5" />
                {isResetting ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </div>

        {/* Preferences Section (Non-functional) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Preferences</h2>
            <span className="text-[9px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 ml-auto">Coming Soon</span>
          </div>
          <div className="space-y-3 opacity-50 pointer-events-none">
            {[
              { label: "Email Notifications", description: "Receive important updates via email" },
              { label: "Transaction Alerts", description: "Get notified for high-value transactions" },
              { label: "System Alerts", description: "Receive system health notifications" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-xs text-gray-900">{item.label}</p>
                  <p className="text-[11px] text-gray-500">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Logout</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Sign out of your admin account</p>
            </div>
            <Button
              variant="outline"
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default Settings;
