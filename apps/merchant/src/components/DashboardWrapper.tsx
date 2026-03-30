import React, { useMemo, useState } from "react";
import { FiAlertTriangle, FiCopy } from "react-icons/fi";
import { Link } from "wouter";
import LeftBar from "../components/LeftBar";
import { useActiveTabStore } from "../store/activeTab";
import { tokenStore } from "../store/client";

const tabSubtitles: Record<string, string> = {
  Dashboard: "Overview of your merchant activity",
  Transactions: "Track and review all transactions",
  Customers: "Manage customer relationships",
  Balances: "Monitor available wallet balances",
  "Payment Link": "Create and manage payment links",
  Webhook: "Manage webhooks and webhook deliveries",
  Settings: "Manage your profile, security, and services",
};

const shortenAddress = (address: string) => {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}....${address.slice(-4)}`;
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { collapsed, activeTab } = useActiveTabStore();
  const { profile } = tokenStore();
  const [copied, setCopied] = useState(false);

  const network = profile?.businessProfile?.isLive ? "Mainnet" : "Testnet";
  const walletAddress = profile?.businessProfile?.wallet?.[0]?.address ?? "—";
  const shortWalletAddress =
    walletAddress === "—" ? walletAddress : shortenAddress(walletAddress);

  const title =
    activeTab === "Dashboard"
      ? `Hi, ${profile?.firstname ? profile.firstname : "there"}!`
      : activeTab;

  const subtitle = useMemo(
    () => tabSubtitles[activeTab] ?? "Manage your merchant workspace",
    [activeTab]
  );

  const handleCopyWallet = async () => {
    if (!walletAddress || walletAddress === "—") {
      return;
    }

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <LeftBar />
      <main
        className={`w-full bg-gray-50 transition-all duration-300 pb-20 md:pb-0 ${
          collapsed ? "md:ml-20" : "md:ml-55"
        }`}
      >
        {!profile?.businessProfile?.onboarded && (
          <div className="flex items-center justify-between gap-4 bg-yellow-400 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2 text-yellow-900">
              <FiAlertTriangle size={16} className="shrink-0" />
              <p className="text-sm font-medium">
                Your account setup is incomplete. Complete onboarding to unlock all features.
              </p>
            </div>
            <Link
              to="/onboarding"
              className="shrink-0 rounded-md bg-yellow-900 px-3 py-1.5 text-xs font-semibold text-yellow-50 transition-colors hover:bg-yellow-800"
            >
              Complete onboarding
            </Link>
          </div>
        )}
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">{title}</h1>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-black">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  network === "Testnet" ? "bg-red-600 text-white" : "bg-blue-950 text-white"
                }`}
              >
                {network}
              </span>
              <span>{shortWalletAddress}</span>
              <button
                type="button"
                onClick={handleCopyWallet}
                className="inline-flex items-center text-blue-950 transition-colors hover:text-blue-700"
                title="Copy wallet"
              >
                <FiCopy size={15} />
              </button>
              <span className="text-xs font-medium text-blue-700">{copied ? "Copied" : ""}</span>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default DashboardWrapper;
