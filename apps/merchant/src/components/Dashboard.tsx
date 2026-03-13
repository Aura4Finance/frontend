import { useState } from "react";
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
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// --- Mock Data ---

const RATES_TO_NGN: Record<string, number> = {
  USDC: 1_580,
  USDT: 1_575,
  SUI: 520,
  ETH: 5_200_000,
};

const mockBalances: Record<string, number> = {
  USDC: 12_450.75,
  USDT: 8_320.00,
  SUI: 2_150.50,
  ETH: 1.4325,
};

const coinOptions = Object.keys(mockBalances);

const mockCustomerData = [
  { label: "Mar 2", count: 5 },
  { label: "Mar 3", count: 12 },
  { label: "Mar 4", count: 8 },
  { label: "Mar 5", count: 15 },
  { label: "Mar 6", count: 10 },
  { label: "Mar 7", count: 18 },
  { label: "Mar 8", count: 7 },
  { label: "Mar 9", count: 22 },
];

const mockTransactionChartData = [
  { label: "Mar 2", all: 30, success: 22, failed: 5, pending: 3 },
  { label: "Mar 3", all: 45, success: 35, failed: 4, pending: 6 },
  { label: "Mar 4", all: 28, success: 20, failed: 6, pending: 2 },
  { label: "Mar 5", all: 52, success: 40, failed: 7, pending: 5 },
  { label: "Mar 6", all: 38, success: 30, failed: 3, pending: 5 },
  { label: "Mar 7", all: 60, success: 48, failed: 8, pending: 4 },
  { label: "Mar 8", all: 35, success: 27, failed: 4, pending: 4 },
  { label: "Mar 9", all: 48, success: 38, failed: 6, pending: 4 },
];

const mockRecentTransactions = [
  {
    id: "TXN-00A1",
    customer: { name: "John Doe", email: "john@example.com" },
    amount: "120.50",
    token: "USDC",
    type: "Payment",
    status: "Completed",
    date: "2026-03-09",
  },
  {
    id: "TXN-00A2",
    customer: { name: "Jane Smith", email: "jane@example.com" },
    amount: "85.00",
    token: "USDC",
    type: "Payout",
    status: "Pending",
    date: "2026-03-09",
  },
  {
    id: "TXN-00A3",
    customer: { name: "Michael Brown", email: "mike@example.com" },
    amount: "240.75",
    token: "USDC",
    type: "Refund",
    status: "Failed",
    date: "2026-03-08",
  },
  {
    id: "TXN-00A4",
    customer: { name: "Sarah Lee", email: "sarah@example.com" },
    amount: "310.00",
    token: "USDC",
    type: "Payment",
    status: "Completed",
    date: "2026-03-08",
  },
  {
    id: "TXN-00A5",
    customer: { name: "David Kim", email: "david@example.com" },
    amount: "55.25",
    token: "USDC",
    type: "Payment",
    status: "Completed",
    date: "2026-03-07",
  },
  {
    id: "TXN-00A6",
    customer: { name: "Alice Chen", email: "alice@example.com" },
    amount: "190.00",
    token: "USDC",
    type: "Payout",
    status: "Pending",
    date: "2026-03-07",
  },
];

const txFilterColors: Record<string, string> = {
  all: "#3b82f6",
  success: "#22c55e",
  failed: "#ef4444",
  pending: "#f59e0b",
};

const totalCompletedTransactions = mockTransactionChartData.reduce(
  (sum, item) => sum + item.success,
  0,
);

const totalActiveCustomers = new Set(
  mockRecentTransactions.map((transaction) => transaction.customer.email),
).size;

const totalTransactionVolume = mockRecentTransactions.reduce((sum, transaction) => {
  if (transaction.status !== "Completed") {
    return sum;
  }

  return sum + Number(transaction.amount) * (RATES_TO_NGN[transaction.token] ?? 0);
}, 0);

// --- Component ---

const Dashboard = () => {
  const network = "Testnet";
  const [isOpen, setIsOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [txChartFilter, setTxChartFilter] = useState<"all" | "success" | "failed" | "pending">("all");
  const [selectedCoin, setSelectedCoin] = useState("USDC");
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);

  const currentBalance = mockBalances[selectedCoin] ?? 0;
  const ngnBalance = currentBalance * (RATES_TO_NGN[selectedCoin] ?? 0);
  const dashboardKpis = [
    {
      label: "Completed transactions",
      value: totalCompletedTransactions.toLocaleString("en-US"),
      helper: "Successful transactions processed so far",
      icon: FiCheckCircle,
      iconClassName: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Active customers",
      value: totalActiveCustomers.toLocaleString("en-US"),
      helper: "Customers with recent transaction activity",
      icon: FiUsers,
      iconClassName: "bg-violet-50 text-violet-600",
    },
    {
      label: "Total transaction volume",
      value: `₦${totalTransactionVolume.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      helper: "Completed volume across the current dataset",
      icon: FiTrendingUp,
      iconClassName: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-2xl text-black sm:text-xl">
            Hi, Emmanuel
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
          <span>0x32344....3456</span>
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
                    ? "bg-blue-950 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {network}
              </span>
              <div className="flex items-center justify-between text-sm font-semibold text-black bg-gray-100 px-2 py-1 rounded-md">
                <span>0x32344....3456</span>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
            >
              {selectedCoin}
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
                  ? `${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${selectedCoin}`
                  : "••••••••"}
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
                : "••••••••"}
            </p>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardKpis.map(({ label, value, helper, icon: Icon, iconClassName }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
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
              <p className="text-sm text-gray-500">{helper}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* New Customers Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">New Customers</h3>
            <p className="text-xs text-gray-500 mb-3">Daily signups — last 8 days</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockCustomerData} barCategoryGap="20%">
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
                    formatter={(value: number) => [value, "Customers"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    name="Customers"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Count Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900">Transactions</h3>
              <div className="flex gap-1">
                {(["all", "success", "failed", "pending"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setTxChartFilter(filter)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                      txChartFilter === filter
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">Daily count — last 8 days</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTransactionChartData}>
                  <defs>
                    <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={txFilterColors[txChartFilter]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={txFilterColors[txChartFilter]} stopOpacity={0.05} />
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
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Area
                    type="monotone"
                    dataKey={txChartFilter}
                    stroke={txFilterColors[txChartFilter]}
                    strokeWidth={2}
                    fill="url(#txGradient)"
                    dot={{ fill: txFilterColors[txChartFilter], r: 3 }}
                    name={txChartFilter.charAt(0).toUpperCase() + txChartFilter.slice(1)}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </DashboardWrapper>
  );
};

export default Dashboard;
