import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import { Button, Input } from "@orafi/ui";
import { FiUser, FiBell, FiShield, FiSave, FiCamera } from "react-icons/fi";

const Settings = () => {
  const [profile, setProfile] = useState({ name: "Admin User", email: "admin@orafi.com", role: "Super Admin" });
  const [notifications, setNotifications] = useState({ emailAlerts: true, transactionAlerts: true, systemAlerts: true, marketingEmails: false });

  const handleProfileChange = (field: string, value: string) => setProfile(prev => ({ ...prev, [field]: value }));
  const handleNotificationChange = (field: string) => setNotifications(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));

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
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">{profile.name.charAt(0)}</div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <FiCamera className="w-3 h-3 text-gray-600" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{profile.name}</h3>
              <p className="text-xs text-gray-500">{profile.role}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
              <Input type="text" value={profile.name} onChange={(e) => handleProfileChange("name", e.target.value)} className="w-full h-9 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
              <Input type="email" value={profile.email} onChange={(e) => handleProfileChange("email", e.target.value)} className="w-full h-9 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
              <Input type="text" value={profile.role} disabled className="w-full h-9 text-sm bg-gray-50" />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Notification Preferences</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: "emailAlerts", label: "Email Alerts", description: "Receive important updates via email" },
              { key: "transactionAlerts", label: "Transaction Alerts", description: "Get notified for high-value transactions" },
              { key: "systemAlerts", label: "System Alerts", description: "Receive system health notifications" },
              { key: "marketingEmails", label: "Marketing Emails", description: "Receive product updates and newsletters" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-xs text-gray-900">{item.label}</p>
                  <p className="text-[11px] text-gray-500">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifications[item.key as keyof typeof notifications]} onChange={() => handleNotificationChange(item.key)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <FiShield className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Security</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-xs text-gray-900">Two-Factor Authentication</p>
                <p className="text-[11px] text-gray-500">Add an extra layer of security</p>
              </div>
              <Button variant="outline" className="text-xs h-8 px-3">Enable</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-xs text-gray-900">Change Password</p>
                <p className="text-[11px] text-gray-500">Update your password regularly</p>
              </div>
              <Button variant="outline" className="text-xs h-8 px-3">Update</Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="default" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs">
            <FiSave className="w-3.5 h-3.5" />Save Changes
          </Button>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default Settings;
