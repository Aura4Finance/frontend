import { useState, useCallback, useEffect } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import KPICard from "./shared/KPICard";
import { KPICardSkeleton, ChartSkeleton } from "./shared/Skeletons";
import ErrorState from "./shared/ErrorState";
import MerchantFilters from "./filters/MerchantFilters";
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
  useMerchant,
  useMerchantStats,
  useUpdateMerchantStatus,
  type Merchant,
} from "./hooks/useMerchants";
import { useMerchantFilters, buildMerchantParams } from "../store/merchantFilters";

const Merchants = () => {
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [searchId, setSearchId] = useState("");

  // Filter store
  const filters = useMerchantFilters();
  const [appliedParams, setAppliedParams] = useState(() => buildMerchantParams(filters));

  // Search by merchant ID or email
  const { data: searchedMerchant, isFetching: searchFetching } = useMerchant(searchId, !!searchId);

  // Handle search input
  const handleSearch = useCallback((query: string) => {
    setSearchId(query);
  }, []);

  // Open modal when search finds a merchant
  useEffect(() => {
    if (searchedMerchant && searchId) {
      setSelectedMerchant(searchedMerchant);
      setSearchId("");
    }
  }, [searchedMerchant, searchId]);

  // Apply filters handler
  const handleApplyFilters = useCallback(() => {
    const params = buildMerchantParams(filters);
    setAppliedParams(params);
    setCursorHistory([]);
    setCurrentPage(1);
  }, [filters]);

  // Fetch data using hooks
  const {
    data: merchantsData,
    isLoading: merchantsLoading,
    error: merchantsError,
    isFetching,
  } = useMerchants(appliedParams);

  const { data: statsData, isLoading: statsLoading } = useMerchantStats();
  const updateStatus = useUpdateMerchantStatus();

  // Handle next page
  const handleNextPage = useCallback(() => {
    if (merchantsData?.hasNextPage && merchantsData.nextCursor) {
      setCursorHistory((prev) => [...prev, appliedParams.cursor || ""]);
      setAppliedParams((prev) => ({ ...prev, cursor: merchantsData.nextCursor }));
      setCurrentPage((prev) => prev + 1);
    }
  }, [merchantsData, appliedParams.cursor]);

  // Handle previous page
  const handlePreviousPage = useCallback(() => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      setCursorHistory(newHistory);
      setAppliedParams((prev) => ({ ...prev, cursor: previousCursor || undefined }));
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  }, [cursorHistory]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newLimit: number) => {
    filters.setLimit(newLimit);
    setAppliedParams((prev) => ({ ...prev, limit: newLimit, cursor: undefined }));
    setCursorHistory([]);
    setCurrentPage(1);
  }, [filters]);

  const merchants = merchantsData?.merchants || [];
  const hasNextPage = merchantsData?.hasNextPage || false;
  const hasPreviousPage = cursorHistory.length > 0;

  const totalMerchants = statsData?.total || 0;
  const liveMerchants = statsData?.live || 0;
  const onboardedMerchants = statsData?.onboarded || 0;
  const leaderboard = statsData?.leaderboard || [];
  const onboardingStats = statsData?.stats || [];
  const revenueByMerchant = statsData?.revenueByMerchant;

  const handleStatusToggle = (merchantId: string, isDisabled: boolean) => {
    const action = isDisabled ? "enable" : "disable";
    updateStatus.mutate({ merchantId, action });
  };

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Merchants</h1>
            <p className="text-gray-500 text-xs mt-0.5">Manage merchant accounts and view performance</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{totalMerchants.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Merchants</p>
          </div>
        </div>
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

        {/* Filter Bar */}
        <div className="mb-4">
          <MerchantFilters onApply={handleApplyFilters} onSearch={handleSearch} searchLoading={searchFetching} />
        </div>

        {/* Items per page selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show:</span>
            <select
              value={filters.limit}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs text-gray-500">per page</span>
          </div>
        </div>

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
            {/* Merchants Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Merchant</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Sector</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Country</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {merchants.map((merchant) => (
                      <tr
                        key={merchant.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedMerchant(merchant)}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                              {merchant.businessProfile?.businessName?.charAt(0) || "M"}
                            </div>
                            <div className="font-medium text-xs text-gray-900">
                              {merchant.businessProfile?.businessName || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{merchant.email}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{merchant.businessProfile?.businessSector || "N/A"}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{merchant.businessProfile?.country || "N/A"}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                            merchant.disabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}>
                            {merchant.disabled ? "Disabled" : "Active"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                            merchant.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {merchant.emailVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cursor-based Pagination */}
            <div className="mt-4 flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-3">
              <div className="text-xs text-gray-500">
                Page {currentPage} • Showing {merchants.length} merchants
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={!hasPreviousPage || isFetching}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    hasPreviousPage && !isFetching
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  ← Previous
                </button>

                <span className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md">
                  {currentPage}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || isFetching}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    hasNextPage && !isFetching
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Next →
                </button>
              </div>

              {isFetching && !merchantsLoading && (
                <div className="text-xs text-blue-600 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Merchant Detail Modal - uses data from list or search */}
      <Modal
        isOpen={!!selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        title="Merchant Details"
      >
        {selectedMerchant && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                {selectedMerchant.businessProfile?.businessName?.charAt(0) || "M"}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedMerchant.businessProfile?.businessName || "N/A"}
                </h3>
                <p className="text-xs text-gray-500">{selectedMerchant.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Merchant ID</p>
                <p className="font-medium text-xs text-gray-900 break-all">{selectedMerchant.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                  selectedMerchant.disabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}>
                  {selectedMerchant.disabled ? "Disabled" : "Active"}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Business Sector</p>
                <p className="font-medium text-xs text-gray-900">{selectedMerchant.businessProfile?.businessSector || "N/A"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Country</p>
                <p className="font-medium text-xs text-gray-900">{selectedMerchant.businessProfile?.country || "N/A"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Email Verified</p>
                <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                  selectedMerchant.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {selectedMerchant.emailVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleStatusToggle(selectedMerchant.id, selectedMerchant.disabled)}
                disabled={updateStatus.isPending}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  !selectedMerchant.disabled
                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {updateStatus.isPending ? "Processing..." : !selectedMerchant.disabled ? "Disable Merchant" : "Enable Merchant"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default Merchants;
