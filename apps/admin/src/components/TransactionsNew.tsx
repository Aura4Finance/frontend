import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import KPICard from "./shared/KPICard";
import FilterBar from "./shared/FilterBar";
import Pagination from "./shared/Pagination";
import Modal from "./shared/Modal";
import { KPICardSkeleton, TableRowSkeleton, ChartSkeleton } from "./shared/Skeletons";
import ErrorState, { EmptyState } from "./shared/ErrorState";
import { FiActivity, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useTransactions,
  useTransaction,
  useTransactionCountData,
  useTransactionVolumeData,
  useTransactionStats,
} from "./hooks/useTransactions";

const TransactionsNew = () => {
  const [countFilter, setCountFilter] = useState<"all" | "successful" | "pending" | "failed">("all");
  const [volumeMode, setVolumeMode] = useState<"ngn" | "usdc">("usdc");
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const filterOptions = [
    { label: "All Status", value: "all" },
    { label: "Completed", value: "Completed" },
    { label: "Pending", value: "Pending" },
    { label: "Failed", value: "Failed" },
  ];

  // Fetch data
  const { data: statsData, isLoading: statsLoading, error: statsError } = useTransactionStats();
  const { data: countData, isLoading: countLoading } = useTransactionCountData(8);
  const { data: volumeData, isLoading: volumeLoading } = useTransactionVolumeData(8);
  const {
    data: transactionsResponse,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch,
  } = useTransactions({
    page: currentPage,
    limit: itemsPerPage,
    search: searchValue,
    status: selectedFilter === "all" ? undefined : selectedFilter,
  });

  const { data: selectedTransaction } = useTransaction(
    selectedTransactionId || "",
    !!selectedTransactionId
  );

  const transactions = transactionsResponse?.data || [];
  const pagination = transactionsResponse?.pagination;

  // Filter count data based on selection
  const filteredCountData = countData?.map((item) => ({
    ...item,
    value: countFilter === "all" ? item.all : item[countFilter],
  }));

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  };

  return (
    <DashboardWrapper>
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-xs mt-0.5">Monitor and manage all transactions</p>
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
          ) : statsError ? (
            <div className="col-span-full">
              <ErrorState message="Failed to load transaction statistics" type="warning" />
            </div>
          ) : (
            <>
              <KPICard
                title="All Transactions"
                value={statsData?.total?.toLocaleString() || "0"}
                icon={FiActivity}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-100"
              />
              <KPICard
                title="Successful"
                value={statsData?.successful?.toLocaleString() || "0"}
                icon={FiCheckCircle}
                iconColor="text-green-600"
                iconBgColor="bg-green-100"
              />
              <KPICard
                title="Pending"
                value={statsData?.pending?.toLocaleString() || "0"}
                icon={FiClock}
                iconColor="text-yellow-600"
                iconBgColor="bg-yellow-100"
              />
              <KPICard
                title="Failed"
                value={statsData?.failed?.toLocaleString() || "0"}
                icon={FiXCircle}
                iconColor="text-red-600"
                iconBgColor="bg-red-100"
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          {/* Transaction Count Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Transaction Count (8 Days)</h3>
              <div className="flex gap-1">
                {["all", "successful", "pending", "failed"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCountFilter(filter as typeof countFilter)}
                    className={`px-2 py-1 text-[10px] rounded-md font-medium transition-colors ${
                      countFilter === filter
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {countLoading ? (
              <ChartSkeleton height="h-48" />
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredCountData}>
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
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Transaction Volume Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Transaction Volume (8 Days)</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setVolumeMode("usdc")}
                  className={`px-2 py-1 text-[10px] rounded-md font-medium ${
                    volumeMode === "usdc" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  USDC
                </button>
                <button
                  onClick={() => setVolumeMode("ngn")}
                  className={`px-2 py-1 text-[10px] rounded-md font-medium ${
                    volumeMode === "ngn" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  NGN
                </button>
              </div>
            </div>
            {volumeLoading ? (
              <ChartSkeleton height="h-48" />
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
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
                      tickFormatter={(value) =>
                        volumeMode === "ngn"
                          ? `₦${(value / 1000000).toFixed(1)}M`
                          : `$${(value / 1000).toFixed(1)}K`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        volumeMode === "ngn"
                          ? `₦${value.toLocaleString()}`
                          : `$${value.toLocaleString()}`,
                        volumeMode.toUpperCase(),
                      ]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey={volumeMode}
                      fill={volumeMode === "ngn" ? "#10b981" : "#3b82f6"}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Search by customer, ID, or merchant..."
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Transactions Table */}
        {transactionsError ? (
          <ErrorState message="Failed to load transactions" onRetry={refetch} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactionsLoading ? (
                    <>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <TableRowSkeleton key={idx} columns={6} />
                      ))}
                    </>
                  ) : transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedTransactionId(tx.id)}
                      >
                        <td className="px-4 py-2.5 text-xs font-mono text-gray-900">{tx.id}</td>
                        <td className="px-4 py-2.5">
                          <div className="text-xs font-medium text-gray-900">{tx.customer}</div>
                          <div className="text-[11px] text-gray-500">{tx.email}</div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="text-xs font-medium text-gray-900">${tx.amount.toLocaleString()}</div>
                          <div className="text-[11px] text-gray-500">{tx.token}</div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{tx.type}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                              tx.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : tx.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">
                          {new Date(tx.date).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : null}
                </tbody>
              </table>
            </div>

            {!transactionsLoading && transactions.length === 0 && (
              <EmptyState
                icon={<FiActivity className="w-12 h-12" />}
                title="No transactions found"
                message="No transactions match your search criteria."
              />
            )}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={!!selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
        title="Transaction Details"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Transaction ID</p>
                <p className="font-mono text-xs text-gray-900">{selectedTransaction.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    selectedTransaction.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : selectedTransaction.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedTransaction.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Customer</p>
                <p className="font-medium text-xs text-gray-900">{selectedTransaction.customer}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Merchant</p>
                <p className="font-medium text-xs text-gray-900">{selectedTransaction.merchant}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Amount</p>
                <p className="font-medium text-xs text-gray-900">
                  ${selectedTransaction.amount.toLocaleString()} {selectedTransaction.token}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Type</p>
                <p className="font-medium text-xs text-gray-900">{selectedTransaction.type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-[11px] text-gray-500">Date & Time</p>
                <p className="font-medium text-xs text-gray-900">
                  {new Date(selectedTransaction.date).toLocaleString()}
                </p>
              </div>
              {selectedTransaction.hash && (
                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                  <p className="text-[11px] text-gray-500">Transaction Hash</p>
                  <p className="font-mono text-xs text-gray-900 break-all">{selectedTransaction.hash}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default TransactionsNew;
