import { useEffect, useMemo, useState } from "react";
import DashboardWrapper from "./DashboardWrapper";
import {
  FiCopy,
  FiMenu,
  FiEye,
  FiEyeOff,
  FiUsers,
  FiChevronDown,
  FiCheckCircle,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useBalance, useDashboard } from "../hooks/mutations/useDashboard";
import { tokenStore } from "../store/client";

const RATES_TO_NGN: Record<string, number> = {
  USDC: 1_580,
  USDT: 1_575,
  SUI: 520,
  ETH: 5_200_000,
};

// --- Skeleton helpers ---
const KpiSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-gray-200" />
        <div className="h-7 w-1/2 rounded bg-gray-200" />
      </div>
      <div className="h-12 w-12 rounded-full bg-gray-100" />
    </div>
    <div className="h-3 w-full rounded bg-gray-200" />
  </div>
);

const ChartSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="mb-2 h-4 w-1/3 rounded bg-gray-200" />
    <div className="mb-4 h-3 w-1/2 rounded bg-gray-200" />
    <div className="h-52 rounded bg-gray-100" />
  </div>
);

// --- Component ---

const shortenAddress = (address: string) => {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}....${address.slice(-4)}`;
};

const Dashboard = () => {
  const { profile } = tokenStore();
  const [isOpen, setIsOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState("");
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);

  const { data, isLoading, isError } = useDashboard();
  const { data: balances = [] } = useBalance();

  const coinOptions = useMemo(
    () => [...new Set(balances.map(({ coinType }) => coinType))],
    [balances]
  );

  useEffect(() => {
    if (!coinOptions.length) {
      return;
    }

    if (!selectedCoin || !coinOptions.includes(selectedCoin)) {
      setSelectedCoin(coinOptions[0]);
    }
  }, [coinOptions, selectedCoin]);

  const network = profile?.businessProfile.isLive ? "Mainnet" : "Testnet";
  const walletAddress = profile?.businessProfile.wallet?.[0]?.address ?? "—";
  const shortWalletAddress = walletAddress === "—" ? walletAddress : shortenAddress(walletAddress);

  const currentBalance = balances.find(({ coinType }) => coinType === selectedCoin)?.balance ?? 0;
  const ngnBalance = currentBalance * (RATES_TO_NGN[selectedCoin] ?? 0);

  // Chart data comes straight from the API's transactionMetrics array
  const chartData = data?.transactionMetrics ?? [];
  const transactionCount = data?.transactionCount;
  const customerCount = data?.customerCount;
  const transactionVolume = data?.transactionVolume;

  const dashboardKpis = [
    {
      label: "Completed transactions",
      value: transactionCount?.total?.toLocaleString("en-US") ?? "—",
      helper: transactionCount
        ? `${transactionCount.percentageChange}% ${transactionCount.trend === "up" ? "increase" : "decrease"} from last period`
        : "—",
      icon: FiCheckCircle,
      iconClassName: "bg-emerald-50 text-emerald-600",
      trend: transactionCount?.trend,
    },
    {
      label: "Active customers",
      value: customerCount?.total?.toLocaleString("en-US") ?? "—",
      helper: customerCount
        ? `${customerCount.percentageChange}% ${customerCount.trend === "up" ? "increase" : "decrease"} from last period`
        : "—",
      icon: FiUsers,
      iconClassName: "bg-violet-50 text-violet-600",
      trend: customerCount?.trend,
    },
    {
      label: "Total transaction volume",
      value: transactionVolume
        ? `$${transactionVolume.totalVolumeInUSDC.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`
        : "—",
      helper: transactionVolume
        ? `${transactionVolume.transactionCount.toLocaleString()} transactions settled`
        : "—",
      icon: FiTrendingUp,
      iconClassName: "bg-blue-50 text-blue-600",
      trend: undefined as "up" | "down" | undefined,
    },
  ];

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-2xl text-black sm:text-xl">
            Hi, {profile?.firstname ? profile.firstname : "there"}!{" "}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-semibold px-3 py-1.5 rounded-full text-sm cursor-default select-none bg-gray-100 text-black w-fit">
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${
              network === "Testnet"
                ? "bg-red-600 text-white"
                : "bg-blue-950 text-white"
            }`}
          >
            {network}
          </span>
          <span>{shortWalletAddress}</span>
          <FiCopy className="text-blue-950 cursor-pointer" />
        </div>

        <div className="flex sm:hidden items-center gap-2 relative">
          <FiMenu
            className="text-blue-950 text-xl cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          />
          {isOpen && (
            <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-md w-48 p-3 flex flex-col gap-2 z-50">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  network === "Testnet"
                    ? "bg-red-600 text-white"
                    : "bg-blue-950 text-white"
                }`}
              >
                {network}
              </span>
              <div className="flex items-center justify-between text-sm font-semibold text-black bg-gray-100 px-2 py-1 rounded-md">
                <span>{shortWalletAddress}</span>
                <FiCopy className="text-blue-950 cursor-pointer" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <div className="flex flex-col items-center py-8">
          {/* Coin Selector Dropdown */}
          <div className="relative mb-4">
            <button
              type="button"
              onClick={() => setCoinDropdownOpen(!coinDropdownOpen)}
              disabled={!coinOptions.length}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {selectedCoin || "No balances"}
              <FiChevronDown
                size={14}
                className={`transition-transform ${coinDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {coinDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[100px]">
                {coinOptions.map((coin) => (
                  <button
                    key={coin}
                    onClick={() => {
                      setSelectedCoin(coin);
                      setCoinDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                      coin === selectedCoin
                        ? "text-blue-600 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Balance Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">
                {balanceVisible
                  ? `${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${selectedCoin || ""}`
                  : "********"}
              </span>
              <button
                type="button"
                onClick={() => setBalanceVisible((v) => !v)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {balanceVisible ? <FiEye size={18} /> : <FiEyeOff size={18} />}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {balanceVisible
                ? `≈ ₦${ngnBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
                : "********"}
            </p>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <KpiSkeleton key={i} />)
            : dashboardKpis.map(({ label, value, helper, icon: Icon, iconClassName, trend }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
                    </div>
                    <div className={`rounded-full p-3 ${iconClassName}`}>
                      <Icon className="text-lg" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {trend === "up" && (
                      <FiArrowUp className="shrink-0 text-emerald-500" size={13} />
                    )}
                    {trend === "down" && (
                      <FiArrowDown className="shrink-0 text-red-400" size={13} />
                    )}
                    <p
                      className={`text-xs ${
                        trend === "up"
                          ? "text-emerald-600"
                          : trend === "down"
                            ? "text-red-500"
                            : "text-gray-500"
                      }`}
                    >
                      {helper}
                    </p>
                  </div>
                </div>
              ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {isLoading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : isError ? (
            <div className="col-span-2 rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-500">
              Failed to load chart data. Please refresh.
            </div>
          ) : (
            <>
              {/* Transaction Count Trend */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Transaction Count</h3>
                <p className="mb-3 text-xs text-gray-500">Daily count trend</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.1)",
                          fontSize: "11px",
                        }}
                        formatter={(value: number) => [value.toLocaleString(), "Transactions"]}
                        labelFormatter={(label: string) => `Date: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#countGradient)"
                        dot={{ fill: "#3b82f6", r: 3 }}
                        name="Count"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transaction Volume Trend */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Transaction Volume</h3>
                <p className="mb-3 text-xs text-gray-500">Daily volume trend (USDC)</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        tickFormatter={(v: number) =>
                          v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.1)",
                          fontSize: "11px",
                        }}
                        formatter={(value: number) => [
                          `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                          "Volume (USDC)",
                        ]}
                        labelFormatter={(label: string) => `Date: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="volumeInUSDC"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#volumeGradient)"
                        dot={{ fill: "#8b5cf6", r: 3 }}
                        name="Volume (USDC)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </DashboardWrapper>
  );
};

export default Dashboard;
