import { useState, useCallback } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import KPICard from "./shared/KPICard";
import { KPICardSkeleton, ChartSkeleton } from "./shared/Skeletons";
import ErrorState from "./shared/ErrorState";
import TransactionFilters from "./filters/TransactionFilters";
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
  useTransactionStats,
  useTransactionCountData,
  useRefundTransaction,
  type Transaction,
} from "./hooks/useTransactions";
import { useActiveMode } from "../store/mode";
import { toast } from "sonner";

const Transactions = () => {
  const [countFilter, setCountFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  const [volumeMode, setVolumeMode] = useState<"ngn" | "usdc">("usdc");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { mode } = useActiveMode();

  // API hooks
  const { data: statsData, isLoading: statsLoading, error: statsError } = useTransactionStats(mode, (countFilter === "all" ? undefined : countFilter.toUpperCase()) as any);
  const { data: countData } = useTransactionCountData(mode);
  
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    isFetching,
  } = useTransactions({
    limit: itemsPerPage,
    mode,
    cursor,
  });

  const { mutate: refundTransaction, isPending: isRefunding } = useRefundTransaction();

  // Handle next page
  const handleNextPage = useCallback(() => {
    if (transactionsData?.hasNextPage && transactionsData.nextCursor) {
      setCursorHistory((prev) => [...prev, cursor || ""]);
      setCursor(transactionsData.nextCursor);
      setCurrentPage((prev) => prev + 1);
    }
  }, [transactionsData, cursor]);

  // Handle previous page
  const handlePreviousPage = useCallback(() => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      setCursorHistory(newHistory);
      setCursor(previousCursor || undefined);
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  }, [cursorHistory]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newLimit: number) => {
    setItemsPerPage(newLimit);
    setCursor(undefined);
    setCursorHistory([]);
    setCurrentPage(1);
  }, []);

  const transactions = transactionsData?.transactions || [];
  const totalCount = transactionsData?.count || 0;
  const hasNextPage = transactionsData?.hasNextPage || false;
  const hasPreviousPage = cursorHistory.length > 0;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-500 text-xs mt-0.5">Monitor and analyze all transactions</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{totalCount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Transactions</p>
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
                {(["all", "completed", "pending", "failed"] as const).map((filter) => (
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
            {statsLoading ? (
              <ChartSkeleton height="h-44" />
            ) : !statsData || statsData?.length === 0 ? (
              <div className="h-44 flex items-center justify-center">
                <p className="text-xs text-gray-500">No transaction count data available</p>
              </div>
            ) : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "11px" }}
                      formatter={(value: number) => [value.toLocaleString(), "Transactions"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} name="Count" />
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
            ) : !statsData || statsData?.length === 0 ? (
              <div className="h-44 flex items-center justify-center">
                <p className="text-xs text-gray-500">No transaction volume data available</p>
              </div>
            ) : (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      tickFormatter={(value) => volumeMode === "ngn" ? `₦${value.toLocaleString()}` : `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [volumeMode === "ngn" ? `₦${value.toLocaleString()}` : `$${value.toLocaleString()}`, "Volume"]}
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "11px" }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar 
                      dataKey={volumeMode === "usdc" ? "volumeInUSDC" : "volume"} 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]} 
                      name={volumeMode === "usdc" ? "Volume (USDC)" : "Volume (NGN)"} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-4">
          <TransactionFilters />
        </div>

        {/* Items per page selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show:</span>
            <select
              value={itemsPerPage}
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
                      <tr key={tx.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedTransaction(tx)}>
                        <td className="px-4 py-2.5 text-xs font-medium text-blue-600">{tx.id.slice(0, 8)}...</td>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-xs text-gray-900">
                            {tx.customer 
                              ? `${tx.customer.firstname || ''} ${tx.customer.lastname || ''}`.trim() || 'N/A'
                              : 'N/A'}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {tx.customer?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{tx.amount?.toLocaleString() || 0} {tx.token}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                            tx.type === 'payment' ? 'bg-blue-100 text-blue-700' : 
                            tx.type === 'payout' ? 'bg-purple-100 text-purple-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}>{tx.type}</span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{tx.profile?.businessName || 'N/A'}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(tx.status)}`}>{tx.status}</span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cursor-based Pagination */}
            <div className="mt-4 flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-3">
              <div className="text-xs text-gray-500">
                Page {currentPage} • Showing {transactions.length} of {totalCount.toLocaleString()} transactions
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
              
              {isFetching && !transactionsLoading && (
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

      {/* Transaction Detail Modal */}
      <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Transaction Details">
        {selectedTransaction && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-500">Transaction ID</p>
                <span className="text-sm font-semibold text-gray-900">{selectedTransaction.id}</span>
              </div>
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTransaction.status)}`}>{selectedTransaction.status}</span>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Amount</p>
                <p className="font-semibold text-sm text-gray-900">{selectedTransaction.amount?.toLocaleString()} {selectedTransaction.token}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Amount in USDC</p>
                <p className="font-semibold text-sm text-gray-900">${selectedTransaction.amountInUSDC?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Type</p>
                <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                  selectedTransaction.type === 'payment' ? 'bg-blue-100 text-blue-700' : 
                  selectedTransaction.type === 'payout' ? 'bg-purple-100 text-purple-700' : 
                  'bg-orange-100 text-orange-700'
                }`}>{selectedTransaction.type}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Mode</p>
                <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                  selectedTransaction.mode === 'live' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{selectedTransaction.mode}</span>
              </div>
            </div>

            {/* Customer Info */}
            {selectedTransaction.customer && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500 mb-2">Customer</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {selectedTransaction.customer.firstname?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="font-medium text-xs text-gray-900">
                      {selectedTransaction.customer.firstname} {selectedTransaction.customer.lastname}
                    </p>
                    <p className="text-[11px] text-gray-500">{selectedTransaction.customer.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Merchant/Profile Info */}
            {selectedTransaction.profile && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500 mb-1">Merchant</p>
                <p className="font-medium text-xs text-gray-900">{selectedTransaction.profile.businessName}</p>
                <p className="text-[11px] text-gray-500">{selectedTransaction.profile.user?.email}</p>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Created At</p>
                <p className="font-medium text-xs text-gray-900">
                  {selectedTransaction.createdAt ? new Date(selectedTransaction.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Confirmed At</p>
                <p className="font-medium text-xs text-gray-900">
                  {selectedTransaction.confirmedAt ? new Date(selectedTransaction.confirmedAt).toLocaleString() : 'Pending'}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            {selectedTransaction.payment && (
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Payment Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-[11px] text-blue-600">Payment ID</p>
                    <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.payment.id}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-[11px] text-blue-600">Payment Method</p>
                    <p className="font-medium text-xs text-gray-900">{selectedTransaction.payment.paymentMethod || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-[11px] text-blue-600">Refunded</p>
                    <p className="font-medium text-xs text-gray-900">{selectedTransaction.payment.refunded ? 'Yes' : 'No'}</p>
                  </div>
                  {selectedTransaction.payment.txRef && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-[11px] text-blue-600">Transaction Reference</p>
                      <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.payment.txRef}</p>
                    </div>
                  )}
                  {selectedTransaction.payment.depositAddress && (
                    <div className="bg-blue-50 rounded-lg p-3 col-span-2">
                      <p className="text-[11px] text-blue-600">Deposit Address</p>
                      <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.payment.depositAddress}</p>
                    </div>
                  )}
                  {selectedTransaction.payment.wallet?.pubKey && (
                    <div className="bg-blue-50 rounded-lg p-3 col-span-2">
                      <p className="text-[11px] text-blue-600">Wallet Public Key</p>
                      <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.payment.wallet.pubKey}</p>
                    </div>
                  )}
                  {selectedTransaction.payment.redirectUrl && (
                    <div className="bg-blue-50 rounded-lg p-3 col-span-2">
                      <p className="text-[11px] text-blue-600">Redirect URL</p>
                      <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.payment.redirectUrl}</p>
                    </div>
                  )}
                  {selectedTransaction.payment.paylinkId && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-[11px] text-blue-600">Paylink ID</p>
                      <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.payment.paylinkId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payout Details */}
            {selectedTransaction.payout && (
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Payout Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-[11px] text-purple-600">Payout ID</p>
                    <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.payout.id}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-[11px] text-purple-600">Method</p>
                    <p className="font-medium text-xs text-gray-900">{selectedTransaction.payout.method || 'N/A'}</p>
                  </div>
                  {selectedTransaction.payout.walletAddress && (
                    <div className="bg-purple-50 rounded-lg p-3 col-span-2">
                      <p className="text-[11px] text-purple-600">Wallet Address</p>
                      <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.payout.walletAddress}</p>
                    </div>
                  )}
                  {selectedTransaction.payout.txDigest && (
                    <div className="bg-purple-50 rounded-lg p-3 col-span-2">
                      <p className="text-[11px] text-purple-600">Transaction Digest</p>
                      <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.payout.txDigest}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refund Details */}
            {selectedTransaction.refund && (
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Refund Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-[11px] text-orange-600">Refund ID</p>
                    <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.refund.id}</p>
                  </div>
                  {selectedTransaction.refund.reason && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-[11px] text-orange-600">Reason</p>
                      <p className="font-medium text-xs text-gray-900">{selectedTransaction.refund.reason}</p>
                    </div>
                  )}
                  {selectedTransaction.refund.originalTxId && (
                    <div className="bg-orange-50 rounded-lg p-3 col-span-2">
                      <p className="text-[11px] text-orange-600">Original Transaction ID</p>
                      <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.refund.originalTxId}</p>
                    </div>
                  )}
                  {selectedTransaction.refund.walletAddress && (
                    <div className="bg-orange-50 rounded-lg p-3 col-span-2">
                      <p className="text-[11px] text-orange-600">Wallet Address</p>
                      <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.refund.walletAddress}</p>
                    </div>
                  )}
                  {selectedTransaction.refund.txDigest && (
                    <div className="bg-orange-50 rounded-lg p-3 col-span-2">
                      <p className="text-[11px] text-orange-600">Transaction Digest</p>
                      <p className="font-medium text-xs text-gray-900 break-all">{selectedTransaction.refund.txDigest}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refund Action for Payments */}
            {selectedTransaction.status.toLowerCase() === 'completed' && 
             selectedTransaction.type === 'payment' && 
             !selectedTransaction.payment?.refunded && (
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    refundTransaction({ transactionId: selectedTransaction.id }, {
                      onSuccess: () => {
                        toast.success('Transaction refunded successfully');
                        setSelectedTransaction(null);
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
