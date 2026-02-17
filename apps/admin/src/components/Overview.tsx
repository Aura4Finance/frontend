import DashboardWrapper from "./layout/DashboardWrapper";
import KPICard from "./shared/KPICard";
import { KPICardSkeleton, ChartSkeleton } from "./shared/Skeletons";
import ErrorState from "./shared/ErrorState";
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
import {
  useDashboardStats,
  useTokenDistribution,
  useRevenueMetrics,
} from "./hooks/useDashboard";

const Overview = () => {
  // Fetch data using React Query hooks
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    data: tokenData,
    isLoading: tokenLoading,
    error: tokenError,
  } = useTokenDistribution();

  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueMetrics("test");

  // Default colors for tokens
  const defaultColors = {
    USDC: "#2563eb",
    USDT: "#10b981",
    SUI: "#6366f1",
    ETH: "#f59e0b",
    BTC: "#f97316",
  };

  // Add colors to token distribution data
  const tokenDistribution = tokenData?.map((token) => ({
    ...token,
    color: token.color || defaultColors[token.name as keyof typeof defaultColors] || "#94a3b8",
  }));

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
          {statsLoading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : statsError ? (
            <div className="col-span-full">
              <ErrorState
                message="Failed to load dashboard statistics"
                onRetry={refetchStats}
                type="warning"
              />
            </div>
          ) : (
            <>
              <KPICard
                title="Total Transactions"
                value={statsData?.totalTransactions?.toLocaleString() || "0"}
                icon={FiActivity}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-100"
                trend={
                  statsData?.transactionsTrend
                    ? {
                        value: statsData.transactionsTrend.value,
                        isPositive: statsData.transactionsTrend.isPositive,
                        label: "vs last month",
                      }
                    : undefined
                }
              />
              <KPICard
                title="Total Customers"
                value={statsData?.totalCustomers?.toLocaleString() || "0"}
                icon={FiUsers}
                iconColor="text-purple-600"
                iconBgColor="bg-purple-100"
                trend={
                  statsData?.customersTrend
                    ? {
                        value: statsData.customersTrend.value,
                        isPositive: statsData.customersTrend.isPositive,
                        label: "vs last month",
                      }
                    : undefined
                }
              />
              <KPICard
                title="Total Merchants"
                value={statsData?.totalMerchants?.toLocaleString() || "0"}
                icon={FiShoppingBag}
                iconColor="text-orange-600"
                iconBgColor="bg-orange-100"
                trend={
                  statsData?.merchantsTrend
                    ? {
                        value: statsData.merchantsTrend.value,
                        isPositive: statsData.merchantsTrend.isPositive,
                        label: "vs last month",
                      }
                    : undefined
                }
              />
              <KPICard
                title="Total Revenue"
                value={
                  statsData?.totalRevenue
                    ? `$${(statsData.totalRevenue / 1000).toFixed(1)}K`
                    : "$0"
                }
                icon={FiDollarSign}
                iconColor="text-emerald-600"
                iconBgColor="bg-emerald-100"
                trend={
                  statsData?.revenueTrend
                    ? {
                        value: statsData.revenueTrend.value,
                        isPositive: statsData.revenueTrend.isPositive,
                        label: "vs last month",
                      }
                    : undefined
                }
              />
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Token Distribution Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Token Distribution</h3>
            {tokenLoading ? (
              <ChartSkeleton height="h-48" />
            ) : tokenError ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-xs text-gray-500">Failed to load token distribution</p>
              </div>
            ) : !tokenDistribution || tokenDistribution.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-xs text-gray-500">No token distribution data</p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Revenue Metrics Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Revenue Metrics</h3>
            <p className="text-xs text-gray-500 mb-3">Last 7 days + today</p>
            {revenueLoading ? (
              <ChartSkeleton height="h-52" />
            ) : revenueError ? (
              <div className="h-52 flex items-center justify-center">
                <p className="text-xs text-gray-500">Failed to load revenue metrics</p>
              </div>
            ) : !revenueData || revenueData.length === 0 ? (
              <div className="h-52 flex items-center justify-center">
                <p className="text-xs text-gray-500">No revenue data available</p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default Overview;
