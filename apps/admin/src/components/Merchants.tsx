import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import KPICard from "./shared/KPICard";
import { KPICardSkeleton, ChartSkeleton } from "./shared/Skeletons";
import ErrorState from "./shared/ErrorState";
import FilterBar from "./shared/FilterBar";
import Pagination from "./shared/Pagination";
import Modal from "./shared/Modal";
import { FiShoppingBag, FiCheckCircle, FiZap, FiTrendingUp } from "react-icons/fi";
import {
  useMerchants,
  useMerchantStats,
  useMerchantLeaderboard,
  useMerchantModeDistribution,
  useMerchantOnboardingData,
  useUpdateMerchantStatus,
} from "./hooks/useMerchants";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Merchants = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch data using hooks
  const { data: merchantsData, isLoading: merchantsLoading, error: merchantsError } = useMerchants({
    page: currentPage,
    limit: itemsPerPage,
    search: searchValue,
    status: selectedFilter || undefined,
  });

  const { data: statsData } = useMerchantStats();
  const { data: leaderboardData } = useMerchantLeaderboard(5);
  const { data: modeDistribution } = useMerchantModeDistribution();
  const { data: onboardingData } = useMerchantOnboardingData();
  const updateStatus = useUpdateMerchantStatus();

  const merchants = merchantsData?.data || [];
  const pagination = merchantsData?.pagination;
  const selectedMerchant = merchants.find(m => m.id === selectedMerchantId);

  const filterOptions = [
    { label: "All Status", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Disabled", value: "DISABLED" },
    { label: "Pending", value: "PENDING" },
    { label: "Suspended", value: "SUSPENDED" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "Live": return "bg-green-100 text-green-700";
      case "DISABLED":
      case "Test": return "bg-yellow-100 text-yellow-700";
      case "PENDING":
      case "Pending": return "bg-gray-100 text-gray-600";
      case "SUSPENDED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const handleStatusToggle = (merchantId: string, currentStatus: string) => {
    const action = currentStatus === "ACTIVE" ? "disable" : "enable";
    updateStatus.mutate({ merchantId, action });
  };

  const totalMerchants = statsData?.totalMerchants || pagination?.total || 0;
  const liveMerchants = statsData?.activeMerchants || 0;
  const avgRevenue = statsData?.averageRevenue || 0;

  return (
    <DashboardWrapper>
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Merchants</h1>
        <p className="text-gray-500 text-xs mt-0.5">Manage merchant accounts and view performance</p>
      </div>

      <div className="p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {merchantsLoading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : (
            <>
              <KPICard title="Total Merchants" value={totalMerchants} icon={FiShoppingBag} iconColor="text-blue-600" iconBgColor="bg-blue-100" trend={statsData?.trend} />
              <KPICard title="Onboarded" value={statsData?.onboardedMerchants || totalMerchants} icon={FiCheckCircle} iconColor="text-green-600" iconBgColor="bg-green-100" />
              <KPICard title="Active" value={liveMerchants} icon={FiZap} iconColor="text-purple-600" iconBgColor="bg-purple-100" />
              <KPICard title="Avg. Revenue" value={`$${Math.round(avgRevenue / 1000)}K`} icon={FiTrendingUp} iconColor="text-orange-600" iconBgColor="bg-orange-100" />
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {/* Mode Distribution Doughnut Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Mode Distribution</h3>
            {modeDistribution ? (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {modeDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value, "Merchants"]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {modeDistribution.map((mode: any) => (
                    <div key={mode.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mode.color }} />
                      <span className="text-xs text-gray-600">{mode.name}</span>
                      <span className="text-xs font-medium text-gray-900">{mode.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <ChartSkeleton />
            )}
          </div>

          {/* Merchant Onboarding Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Merchant Onboarding</h3>
            <p className="text-xs text-gray-500 mb-3">Last 7 days + today</p>
            {onboardingData ? (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={onboardingData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, "Merchants"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar
                      dataKey="count"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      name="Onboarded"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartSkeleton />
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">🏆 Merchant Leaderboard</h3>
          {leaderboardData && leaderboardData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[11px] text-gray-500">
                    <th className="pb-2 font-medium">Rank</th>
                    <th className="pb-2 font-medium">Merchant</th>
                    <th className="pb-2 font-medium">Revenue</th>
                    <th className="pb-2 font-medium">Txns</th>
                    <th className="pb-2 font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((merchant) => (
                    <tr key={merchant.rank} className="border-t border-gray-100">
                      <td className="py-2">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[10px] ${
                          merchant.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                          merchant.rank === 2 ? "bg-gray-200 text-gray-700" :
                          merchant.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                        }`}>{merchant.rank}</span>
                      </td>
                      <td className="py-2 font-medium text-xs text-gray-900">{merchant.name}</td>
                      <td className="py-2 text-xs text-gray-900">${merchant.revenue.toLocaleString()}</td>
                      <td className="py-2 text-xs text-gray-600">{merchant.transactions}</td>
                      <td className="py-2"><span className="text-green-600 font-medium text-xs">+{merchant.growth}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">No leaderboard data available</div>
          )}
        </div>

        <FilterBar searchPlaceholder="Search by merchant name, ID or category..." searchValue={searchValue} onSearchChange={setSearchValue} filterOptions={filterOptions} selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

        {merchantsLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : merchantsError ? (
          <ErrorState message="Failed to load merchants" type="error" />
        ) : merchants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No merchants found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Merchant</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Revenue</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Txns</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Onboarded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {merchants.map((merchant) => (
                      <tr key={merchant.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedMerchantId(merchant.id)}>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-xs text-gray-900">{merchant.name}</div>
                          <div className="text-[11px] text-gray-500">{merchant.email}</div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{merchant.category || 'N/A'}</td>
                        <td className="px-4 py-2.5"><span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(merchant.status)}`}>{merchant.status}</span></td>
                        <td className="px-4 py-2.5 text-xs font-medium text-gray-900">${merchant.totalRevenue?.toLocaleString() || 0}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{merchant.totalTransactions || 0}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{merchant.onboarded ? new Date(merchant.onboarded).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </div>

      <Modal isOpen={!!selectedMerchant} onClose={() => setSelectedMerchantId(null)} title="Merchant Details">
        {selectedMerchant && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">{selectedMerchant.name.charAt(0)}</div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{selectedMerchant.name}</h3>
                <p className="text-xs text-gray-500">{selectedMerchant.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Merchant ID</p><p className="font-medium text-xs text-gray-900">{selectedMerchant.id}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Status</p><span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(selectedMerchant.status)}`}>{selectedMerchant.status}</span></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Category</p><p className="font-medium text-xs text-gray-900">{selectedMerchant.category || 'N/A'}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Onboarded</p><p className="font-medium text-xs text-gray-900">{selectedMerchant.onboarded ? new Date(selectedMerchant.onboarded).toLocaleDateString() : 'N/A'}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Total Revenue</p><p className="font-semibold text-sm text-gray-900">${selectedMerchant.totalRevenue?.toLocaleString() || 0}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Total Transactions</p><p className="font-semibold text-sm text-gray-900">{selectedMerchant.totalTransactions || 0}</p></div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => handleStatusToggle(selectedMerchant.id, selectedMerchant.status)}
                disabled={updateStatus.isPending}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  selectedMerchant.status === 'Live' 
                    ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {updateStatus.isPending ? 'Processing...' : selectedMerchant.status === 'Live' ? 'Disable Merchant' : 'Enable Merchant'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default Merchants;
