import DashboardWrapper from "./layout/DashboardWrapper";
import KPICard from "./shared/KPICard";
import { FiDollarSign, FiUsers, FiShoppingBag, FiActivity } from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Mock data for KPIs
const kpiData = {
  totalTransactions: 12847,
  totalCustomers: 3456,
  totalMerchants: 128,
  totalRevenue: 487250,
};

// Mock data for token distribution
const tokenDistribution = [
  { name: "USDC", value: 45, color: "#2563eb" },
  { name: "USDT", value: 30, color: "#10b981" },
  { name: "SUI", value: 15, color: "#6366f1" },
  { name: "ETH", value: 10, color: "#f59e0b" },
];

// Mock data for revenue metrics (7 days + today)
const revenueData = [
  { name: "Jan 8", revenue: 32000 },
  { name: "Jan 9", revenue: 28000 },
  { name: "Jan 10", revenue: 45000 },
  { name: "Jan 11", revenue: 38000 },
  { name: "Jan 12", revenue: 52000 },
  { name: "Jan 13", revenue: 41000 },
  { name: "Jan 14", revenue: 48000 },
  { name: "Today", revenue: 15000 },
];

const Overview = () => {
  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 text-xs mt-0.5">Welcome to your admin dashboard</p>
      </div>

      <div className="p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Transactions"
            value={kpiData.totalTransactions.toLocaleString()}
            icon={FiActivity}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            trend={{ value: 12.5, isPositive: true, label: "vs last month" }}
          />
          <KPICard
            title="Total Customers"
            value={kpiData.totalCustomers.toLocaleString()}
            icon={FiUsers}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            trend={{ value: 8.2, isPositive: true, label: "vs last month" }}
          />
          <KPICard
            title="Total Merchants"
            value={kpiData.totalMerchants.toLocaleString()}
            icon={FiShoppingBag}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
            trend={{ value: 5.1, isPositive: true, label: "vs last month" }}
          />
          <KPICard
            title="Total Revenue"
            value={`$${(kpiData.totalRevenue / 1000).toFixed(1)}K`}
            icon={FiDollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
            trend={{ value: 15.3, isPositive: true, label: "vs last month" }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Token Distribution Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Token Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tokenDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {tokenDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Share"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              {tokenDistribution.map((token) => (
                <div key={token.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: token.color }}
                  />
                  <span className="text-xs text-gray-600">{token.name}</span>
                  <span className="text-xs font-medium text-gray-900">{token.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Metrics Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Revenue Metrics</h3>
            <p className="text-xs text-gray-500 mb-3">Last 7 days + today</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    tickFormatter={(value) => `$${value / 1000}K`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar
                    dataKey="revenue"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default Overview;
