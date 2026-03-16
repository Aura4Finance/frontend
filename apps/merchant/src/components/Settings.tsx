import { useEffect, useMemo, useState } from "react";
import { FiCopy, FiLogOut, FiRefreshCcw } from "react-icons/fi";
import { Input } from "@orafi/ui";
import { useLocation } from "wouter";
import DashboardWrapper from "./DashboardWrapper";
import { useActiveTabStore } from "../store/activeTab";
import { tokenStore } from "../store/client";
import {
  generateAPIKey,
  getAPIKeys,
  getUserProfile,
  regenerateAPIKeys,
  toggleBusinessMode,
  toggleNotification,
  useChangePassword,
  useLogout,
  useRequestEmailChange,
  useVerifyEmailChange,
} from "../hooks/mutations/useSettings";

const formatDate = (value?: string) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Settings = () => {
  const { setActiveTab: setDashboardTab } = useActiveTabStore();
  const [, setLocation] = useLocation();
  const { profile: storedProfile, clearProfile } = tokenStore();

  const { data: queriedProfile, refetch: refetchProfile, isLoading: profileLoading } = getUserProfile();
  const { data: apiKeys, isLoading: apiKeysLoading, refetch: refetchApiKeys } = getAPIKeys();

  const requestEmailChangeMutation = useRequestEmailChange();
  const verifyEmailChangeMutation = useVerifyEmailChange();
  const changePasswordMutation = useChangePassword();
  const logoutMutation = useLogout();
  const generateApiKeyMutation = generateAPIKey();
  const regenerateApiKeysMutation = regenerateAPIKeys();
  const toggleBusinessModeMutation = toggleBusinessMode();
  const toggleNotificationMutation = toggleNotification();

  const [activeTabValue, setActiveTabValue] = useState("profile");
  const [requestEmail, setRequestEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFAKey, setTwoFAKey] = useState("");
  const [copiedItem, setCopiedItem] = useState<"live" | "test" | "wallet" | null>(null);

  const profile = queriedProfile ?? storedProfile;
  const apiKey = Array.isArray(apiKeys) && apiKeys.length > 0 ? apiKeys[0] : undefined;

  useEffect(() => {
    setDashboardTab("Settings");
  }, [setDashboardTab]);

  useEffect(() => {
    refetchProfile();
  }, [refetchProfile]);

  useEffect(() => {
    if (profile?.email) {
      if (!requestEmail) {
        setRequestEmail(profile.email);
      }
      if (!verifyEmail) {
        setVerifyEmail(profile.email);
      }
    }
  }, [profile?.email, requestEmail, verifyEmail]);

  const profileRows = useMemo(
    () => [
      {
        label: "Full name",
        value:
          profile?.firstname || profile?.lastname
            ? `${profile?.firstname ?? ""} ${profile?.lastname ?? ""}`.trim()
            : "—",
      },
      { label: "Email", value: profile?.email ?? "—" },
      { label: "2FA enabled", value: profile?.twoFactorEnabled ? "Yes" : "No" },
      { label: "Joined", value: formatDate(profile?.createdAt) },
      { label: "Business", value: profile?.businessProfile?.businessName ?? "—" },
      { label: "Sector", value: profile?.businessProfile?.businessSector ?? "—" },
      { label: "Country", value: profile?.businessProfile?.country ?? "—" },
      { label: "Website", value: profile?.businessProfile?.website || "—" },
      {
        label: "Mode",
        value: profile?.businessProfile?.isLive ? "Live" : "Test",
      },
      {
        label: "Wallet",
        value: profile?.businessProfile?.wallet?.[0]?.address ?? "—",
      },
    ],
    [profile]
  );

  const copyValue = async (value: string, type: "live" | "test" | "wallet") => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedItem(type);
      window.setTimeout(() => setCopiedItem(null), 1500);
    } catch {
      setCopiedItem(null);
    }
  };

  const handleRequestEmailChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requestEmail.trim()) {
      return;
    }

    requestEmailChangeMutation.mutate({ email: requestEmail.trim() });
  };

  const handleVerifyEmailChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!verifyEmail.trim() || !verifyToken.trim()) {
      return;
    }

    verifyEmailChangeMutation.mutate({
      email: verifyEmail.trim(),
      token: verifyToken.trim(),
    });
  };

  const handleChangePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword) {
      return;
    }

    changePasswordMutation.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  };

  const handleGenerateApiKey = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!twoFAKey.trim()) {
      return;
    }

    generateApiKeyMutation.mutate(
      { twoFAKey: twoFAKey.trim() },
      {
        onSuccess: () => {
          refetchApiKeys();
        },
      }
    );
  };

  const handleRegenerateApiKey = () => {
    if (!twoFAKey.trim() || !apiKey?.id) {
      return;
    }

    regenerateApiKeysMutation.mutate(
      { twoFAKey: twoFAKey.trim(), keyId: apiKey.id },
      {
        onSuccess: () => {
          refetchApiKeys();
        },
      }
    );
  };

  const handleToggleBusinessMode = async () => {
    await toggleBusinessModeMutation.mutateAsync();
    await refetchProfile();
  };

  const handleToggleNotification = async () => {
    await toggleNotificationMutation.mutateAsync();
    await refetchProfile();
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    clearProfile();
    setLocation("/");
  };

  const tabs = [
    { id: "profile", label: "User Profile Information" },
    { id: "api-keys", label: "API Keys" },
    { id: "notifications", label: "Notifications" },
    { id: "preferences", label: "Preferences" },
  ];

  return (
    <DashboardWrapper>
      <div className="space-y-6 bg-gray-50 p-4 sm:p-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabValue(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
                activeTabValue === tab.id
                  ? "border-blue-950 text-blue-950"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTabValue === "profile" && (
            <>
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Profile information</h2>
              <p className="mt-1 text-sm text-gray-500">Your account and business details.</p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {profileRows.map((item: any) => (
                  <div key={item.label} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                      {item.label}
                    </p>
                    <div className="mt-2 flex items-start justify-between gap-2">
                      <p className="break-all text-sm font-semibold text-gray-900">{item.value}</p>
                      {item.copyable && item.value !== "—" && (
                        <button
                          type="button"
                          onClick={() => copyValue(item.value, "wallet")}
                          className="flex-shrink-0 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
                        >
                          <FiCopy size={14} />
                        </button>
                      )}
                    </div>
                    {item.copyable && copiedItem === "wallet" && (
                      <p className="mt-1 text-xs text-green-600">Copied!</p>
                    )}
                  </div>
                ))}
              </div>
              {profileLoading && <p className="mt-3 text-xs text-gray-500">Refreshing profile...</p>}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Email management</h2>
              <p className="mt-1 text-sm text-gray-500">Request and verify your email change.</p>

              <form onSubmit={handleRequestEmailChange} className="mt-4 space-y-4">
                <div className="max-w-md">
                  <label className="text-sm font-medium text-gray-700">New email</label>
                  <Input
                    type="email"
                    value={requestEmail}
                    onChange={(event) => setRequestEmail(event.target.value)}
                    placeholder="name@company.com"
                    className="mt-1"
                  />
                </div>
                <button
                  disabled={requestEmailChangeMutation.isPending || !requestEmail.trim()}
                  className="rounded-md bg-blue-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {requestEmailChangeMutation.isPending ? "Sending..." : "Request email change"}
                </button>
              </form>

              <form
                onSubmit={handleVerifyEmailChange}
                className="mt-5 space-y-4 border-t border-gray-100 pt-4"
              >
                <div className="max-w-md">
                  <label className="text-sm font-medium text-gray-700">Verification email</label>
                  <Input
                    type="email"
                    value={verifyEmail}
                    onChange={(event) => setVerifyEmail(event.target.value)}
                    placeholder="name@company.com"
                    className="mt-1"
                  />
                </div>
                <div className="max-w-md">
                  <label className="text-sm font-medium text-gray-700">Verification token</label>
                  <Input
                    value={verifyToken}
                    onChange={(event) => setVerifyToken(event.target.value)}
                    placeholder="Paste token from email"
                    className="mt-1"
                  />
                </div>
                <button
                  disabled={
                    verifyEmailChangeMutation.isPending || !verifyEmail.trim() || !verifyToken.trim()
                  }
                  className="rounded-md bg-blue-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {verifyEmailChangeMutation.isPending ? "Verifying..." : "Verify email change"}
                </button>
              </form>
            </section>
            </>
          )}

          {activeTabValue === "api-keys" && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">API keys</h2>
              <p className="mt-1 text-sm text-gray-500">Generate or rotate keys using your 2FA key.</p>

              <form onSubmit={handleGenerateApiKey} className="mt-4 space-y-4">
                <div className="max-w-md">
                  <label className="text-sm font-medium text-gray-700">2FA key</label>
                  <Input
                    value={twoFAKey}
                    onChange={(event) => setTwoFAKey(event.target.value)}
                    placeholder="Enter your 2FA key"
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    disabled={generateApiKeyMutation.isPending || !twoFAKey.trim()}
                    className="rounded-md bg-blue-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {generateApiKeyMutation.isPending ? "Generating..." : "Generate API keys"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateApiKey}
                    disabled={regenerateApiKeysMutation.isPending || !twoFAKey.trim() || !apiKey?.id}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiRefreshCcw size={14} />
                    {regenerateApiKeysMutation.isPending ? "Regenerating..." : "Regenerate API keys"}
                  </button>
                </div>
              </form>

              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">Live key</p>
                  <p className="mt-1 break-all text-sm font-semibold text-gray-900">{apiKey?.liveKey ?? "—"}</p>
                  {apiKey?.liveKey && (
                    <button
                      type="button"
                      onClick={() => copyValue(apiKey.liveKey, "live")}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
                    >
                      <FiCopy size={13} />
                      {copiedItem === "live" ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">Test key</p>
                  <p className="mt-1 break-all text-sm font-semibold text-gray-900">{apiKey?.testKey ?? "—"}</p>
                  {apiKey?.testKey && (
                    <button
                      type="button"
                      onClick={() => copyValue(apiKey.testKey, "test")}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
                    >
                      <FiCopy size={13} />
                      {copiedItem === "test" ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs text-gray-500 sm:grid-cols-2">
                  <p>Created: {formatDate(apiKey?.createdAt)}</p>
                  <p>Last used: {formatDate(apiKey?.lastUsed)}</p>
                </div>
                {apiKeysLoading && <p className="text-xs text-gray-500">Loading API keys...</p>}
              </div>
            </section>
          )}

          {activeTabValue === "notifications" && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
              <p className="mt-1 text-sm text-gray-500">Turn account notifications on or off.</p>

              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">Notification preference</p>
                <p className="text-xs text-gray-500">
                  When notifications are on, you will receive alerts for successful payments. If
                  notifications are off, you will not receive payment notifications.
                </p>
                <button
                  type="button"
                  onClick={handleToggleNotification}
                  disabled={toggleNotificationMutation.isPending}
                  className="mt-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {toggleNotificationMutation.isPending
                    ? "Updating notifications..."
                    : "Toggle notifications"}
                </button>
              </div>
            </section>
          )}

          {activeTabValue === "preferences" && (
            <>
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Security</h2>
              <p className="mt-1 text-sm text-gray-500">Change your account password.</p>

              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <div className="max-w-md">
                  <label className="text-sm font-medium text-gray-700">Current password</label>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(event) => setOldPassword(event.target.value)}
                    placeholder="Current password"
                    className="mt-1"
                  />
                </div>

                <div className="max-w-md">
                  <label className="text-sm font-medium text-gray-700">New password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="New password"
                    className="mt-1"
                  />
                </div>

                <div className="max-w-md">
                  <label className="text-sm font-medium text-gray-700">Confirm new password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm new password"
                    className="mt-1"
                  />
                </div>

                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500">New password and confirm password do not match.</p>
                )}

                <button
                  disabled={
                    changePasswordMutation.isPending ||
                    !oldPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  className="rounded-md bg-blue-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changePasswordMutation.isPending ? "Updating..." : "Change password"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Business mode</h2>
              <p className="mt-1 text-sm text-gray-500">Manage related service preferences.</p>

              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">Business environment</p>
                <p className="text-xs text-gray-500">
                  Current: {profile?.businessProfile?.isLive ? "Live" : "Test"}
                </p>
                <button
                  type="button"
                  onClick={handleToggleBusinessMode}
                  disabled={toggleBusinessModeMutation.isPending}
                  className="mt-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {toggleBusinessModeMutation.isPending ? "Updating mode..." : "Toggle business mode"}
                </button>
              </div>
            </section>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiLogOut size={16} />
            {logoutMutation.isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default Settings;