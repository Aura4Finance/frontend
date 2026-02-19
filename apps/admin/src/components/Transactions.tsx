import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import KPICard from "./shared/KPICard";
import { KPICardSkeleton, ChartSkeleton } from "./shared/Skeletons";
import ErrorState from "./shared/ErrorState";
import FilterBar from "./shared/FilterBar";
import Pagination from "./shared/Pagination";
import Modal from "./shared/Modal";
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
  Legend,
} from "recharts";
import {
  useTransactions,
  useTransaction,
  useTransactionStats,
  useTransactionCountData,
  useRefundTransaction,
} from "./hooks/useTransactions";
import { useActiveMode } from "../store/mode";
import { toast } from "sonner";

const Transactions = () => {
  const [countFilter, setCountFilter] = useState<"all" | "successful" | "pending" | "failed">("all");
  const [volumeMode, setVolumeMode] = useState<"ngn" | "usdc">("usdc");
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const { mode } = useActiveMode();
  const itemsPerPage = 5;

  // API hooks
  const { data: statsData, isLoading: statsLoading, error: statsError } = useTransactionStats(mode);
  const { data: countData, isLoading: countLoading } = useTransactionCountData(mode);
  
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useTransactions({
    limit: itemsPerPage,
    mode,
    status: selectedFilter === "all" ? undefined : selectedFilter.toUpperCase(),
  });

  const { data: transactionDetail } = useTransaction(selectedTransactionId || "");
  const { mutate: refundTransaction, isPending: isRefunding } = useRefundTransaction();

  const filterOptions = [
    { label: "All Status", value: "all" },
    { label: "Completed", value: "completed" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
  ];

  const transactions = transactionsData?.transactions || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-xs mt-0.5">Monitor and analyze all transactions</p>
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
              <KPICard title="Total Transactions" value={countData?.total?.toLocaleString() || "0"} icon={FiActivity} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
              <KPICard title="Successful" value={countData?.successful?.toLocaleString() || "0"} icon={FiCheckCircle} iconColor="text-green-600" iconBgColor="bg-green-100" />
              <KPICard title="Pending" value={countData?.pending?.toLocaleString() || "0"} icon={FiClock} iconColor="text-yellow-600" iconBgColor="bg-yellow-100" />
              <KPICard title="Failed" value={countData?.failed?.toLocaleString() || "0"} icon={FiXCircle} iconColor="text-red-600" iconBgColor="bg-red-100" />
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          {/* Transaction Count Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Transaction Count</h3>
              <div className="flex gap-1">
                {(["all", "successful", "pending", "failed"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCountFilter(filter)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
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
              <ChartSkeleton height="h-44" />
            ) : statsData?.length === 0 ? (
              <div className="h-44 flex items-center justify-center">
                <p className="text-xs text-gray-500">No transaction count data available</p>
              </div>
            ) : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "11px" }} />
                    <Line type="monotone" dataKey={countFilter} stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Transaction Volume Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Transaction Volume</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setVolumeMode("usdc")}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                    volumeMode === "usdc" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  USDC
                </button>
                <button
                  onClick={() => setVolumeMode("ngn")}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                    volumeMode === "ngn" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  NGN
                </button>
              </div>
            </div>
            {statsLoading ? (
              <ChartSkeleton height="h-44" />
            ) : statsData?.length === 0 ? (
              <div className="h-44 flex items-center justify-center">
                <p className="text-xs text-gray-500">No transaction volume data available</p>
              </div>
            ) : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      tickFormatter={(value) => volumeMode === "ngn" ? `₦${(value/1000000).toFixed(1)}M` : `$${(value/1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      formatter={(value: number) => [volumeMode === "ngn" ? `₦${value.toLocaleString()}` : `$${value.toLocaleString()}`, "Volume"]}
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "11px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey={volumeMode} fill="#10b981" radius={[4, 4, 0, 0]} name={volumeMode.toUpperCase()} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Search by transaction ID, customer or merchant..."
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {transactionsLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : transactionsError ? (
          <ErrorState message="Failed to load transactions" type="error" />
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">ID</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Customer</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Amount</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Merchant</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedTransactionId(tx.id)}>
                        <td className="px-4 py-2.5 text-xs font-medium text-blue-600">{tx.id}</td>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-xs text-gray-900">
                            {typeof tx.customer === 'object' && tx.customer 
                              ? `${tx.customer.firstname || ''} ${tx.customer.lastname || ''}`.trim() || 'N/A'
                              : tx.customer || 'N/A'}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {typeof tx.customer === 'object' && tx.customer 
                              ? tx.customer.email || 'N/A'
                              : tx.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{tx.amount?.toLocaleString() || 0} {tx.token}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{tx.type}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{tx.merchant || 'N/A'}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(tx.status)}`}>{tx.status}</span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{tx.date ? new Date(tx.date).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {transactionsData?.hasNextPage && (
              <Pagination currentPage={currentPage} totalPages={Math.ceil(transactionsData?.count / 10)} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Modal isOpen={!!transactionDetail} onClose={() => setSelectedTransactionId(null)} title="Transaction Details">
        {transactionDetail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900">{transactionDetail.id}</span>
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(transactionDetail.status)}`}>{transactionDetail.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Amount</p>
                <p className="font-semibold text-sm text-gray-900">{transactionDetail.amount} {transactionDetail.token}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Type</p>
                <p className="font-medium text-xs text-gray-900">{transactionDetail.type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Customer</p>
                <p className="font-medium text-xs text-gray-900">{transactionDetail.customer || 'N/A'}</p>
                <p className="text-[11px] text-gray-500">{transactionDetail.email || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Merchant</p>
                <p className="font-medium text-xs text-gray-900">{transactionDetail.merchant || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-[11px] text-gray-500">Date & Time</p>
                <p className="font-medium text-xs text-gray-900">{transactionDetail.date ? new Date(transactionDetail.date).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            {transactionDetail.status === 'Completed' && transactionDetail.type === 'Payment' && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    refundTransaction({ transactionId: transactionDetail.id }, {
                      onSuccess: () => {
                        toast.success('Transaction refunded successfully');
                        setSelectedTransactionId(null);
                      },
                      onError: (error: any) => {
                        toast.error(error?.response?.data?.message || 'Failed to refund transaction');
                      },
                    });
                  }}
                  disabled={isRefunding}
                  className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefunding ? 'Processing...' : 'Refund Transaction'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default Transactions;
