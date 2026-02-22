import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import KPICard from "./shared/KPICard";
import { KPICardSkeleton, ChartSkeleton } from "./shared/Skeletons";
import ErrorState from "./shared/ErrorState";
import FilterBar from "./shared/FilterBar";
import Pagination from "./shared/Pagination";
import Modal from "./shared/Modal";
import { FiShoppingBag, FiCheckCircle, FiZap, FiDollarSign } from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useMerchants,
  useMerchantStats,
  useUpdateMerchantStatus,
} from "./hooks/useMerchants";

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

  const { data: statsData, isLoading: statsLoading } = useMerchantStats();
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

  const totalMerchants = statsData?.total || pagination?.total || 0;
  const liveMerchants = statsData?.live || 0;
  const onboardedMerchants = statsData?.onboarded || 0;
  const leaderboard = statsData?.leaderboard || [];
  const onboardingStats = statsData?.stats || [];
  const revenueByMerchant = statsData?.revenueByMerchant;

  return (
    <DashboardWrapper>
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Merchants</h1>
        <p className="text-gray-500 text-xs mt-0.5">Manage merchant accounts and view performance</p>
      </div>

      <div className="p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {statsLoading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : (
            <>
              <KPICard title="Total Merchants" value={totalMerchants} icon={FiShoppingBag} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
              <KPICard title="Onboarded" value={onboardedMerchants} icon={FiCheckCircle} iconColor="text-green-600" iconBgColor="bg-green-100" />
              <KPICard title="Live" value={liveMerchants} icon={FiZap} iconColor="text-purple-600" iconBgColor="bg-purple-100" />
              <KPICard title="Avg Revenue / Merchant" value={`$${(revenueByMerchant?.averageRevenueInUSDC ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={FiDollarSign} iconColor="text-orange-600" iconBgColor="bg-orange-100" />
            </>
          )}
        </div>

        {/* Merchant Onboarding Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Merchant Onboarding (Past 10 Days)</h3>
          {statsLoading ? (
            <ChartSkeleton height="h-44" />
          ) : !onboardingStats || onboardingStats.length === 0 ? (
            <div className="h-44 flex items-center justify-center">
              <p className="text-xs text-gray-500">No onboarding data available</p>
            </div>
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={onboardingStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "11px" }}
                    formatter={(value: number) => [value, "Merchants"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Onboarded" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">🏆 Merchant Leaderboard</h3>
          {leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[11px] text-gray-500">
                    <th className="pb-2 font-medium">Rank</th>
                    <th className="pb-2 font-medium">Merchant</th>
                    <th className="pb-2 font-medium">Country</th>
                    <th className="pb-2 font-medium">Volume</th>
                    <th className="pb-2 font-medium">Txns</th>
                    <th className="pb-2 font-medium">Customers</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((merchant, index) => (
                    <tr key={merchant.profileId} className="border-t border-gray-100">
                      <td className="py-2">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[10px] ${
                          index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-gray-200 text-gray-700" :
                          index === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                        }`}>{index + 1}</span>
                      </td>
                      <td className="py-2 font-medium text-xs text-gray-900">{merchant.profile?.businessName || "N/A"}</td>
                      <td className="py-2 text-xs text-gray-600">{merchant.profile?.country || "N/A"}</td>
                      <td className="py-2 text-xs text-gray-900">${Number(merchant.totalVolume || 0).toLocaleString()}</td>
                      <td className="py-2 text-xs text-gray-600">{merchant.transactionCount}</td>
                      <td className="py-2 text-xs text-gray-600">{merchant.activeCustomers}</td>
                      <td className="py-2">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                          merchant.profile?.isLive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {merchant.profile?.isLive ? "Live" : "Test"}
                        </span>
                      </td>
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
