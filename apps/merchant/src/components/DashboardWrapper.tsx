import React, { useMemo, useState } from "react";
import { FiCopy } from "react-icons/fi";
import LeftBar from "../components/LeftBar";
import { useActiveTabStore } from "../store/activeTab";
import { tokenStore } from "../store/client";

const tabSubtitles: Record<string, string> = {
  Dashboard: "Overview of your merchant activity",
  Transactions: "Track and review all transactions",
  Customers: "Manage customer relationships",
  Balances: "Monitor available wallet balances",
  "Payment Links": "Create and manage payment links",
  "Payment Link": "Create and manage payment links",
  "Bank Accounts": "Manage linked fiat accounts",
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
    <div className="flex min-h-screen">
      <LeftBar />
      <main
        className={`w-screen bg-gray-50 transition-all duration-300 ${collapsed ? "ml-20" : "ml-55"}`}
      >
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
