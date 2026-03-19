import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Transaction } from "@orafi/transactions";
import DashboardWrapper from "./DashboardWrapper";
import ErrorState from "./transactions/ErrorState";
import Modal from "./transactions/Modal";
import CopyButton from "./transactions/CopyButton";
import TransactionFilters from "./transactions/TransactionFilters";
import { tokenStore } from "../store/client";
import { useActiveTabStore } from "../store/activeTab";
import { buildTransactionParams, useTransactionFilters } from "../store/transactionFilters";
import {
  useRefund,
  useRetryRefund,
  useRetryPayout,
  usePayout,
  useTransaction,
  useTransactions,
} from "../hooks/mutations/useTransactions";
import { useBalance } from "../hooks/mutations/useDashboard";

const Transactions = () => {
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchId, setSearchId] = useState("");
  
  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundData, setRefundData] = useState({ walletAddress: "", twoFAKey: "" });
  
  // Retry refund modal state
  const [retryRefundModalOpen, setRetryRefundModalOpen] = useState(false);
  const [retryRefundData, setRetryRefundData] = useState({ twoFAKey: "" });
  
  // Retry payout modal state
  const [retryPayoutModalOpen, setRetryPayoutModalOpen] = useState(false);
  const [retryPayoutData, setRetryPayoutData] = useState({ twoFAKey: "" });
  
  // Payout modal state
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutUsingAccount, setPayoutUsingAccount] = useState(true);
  const [payoutData, setPayoutData] = useState({
    amount: "",
    walletAddress: "",
    alias: "",
    save: false,
    twoFAKey: "",
    cryptoSettlementAccountId: "",
  });
  
  // Success/Failure modal state
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultData, setResultData] = useState<{
    type: "success" | "error";
    message: string;
    title: string;
    data?: any;
    action?: "refund" | "retry_refund" | "retry_payout" | "refund_payment";
  }>({
    type: "success",
    message: "",
    title: "",
  });

  const { profile } = tokenStore();
  const { setActiveTab } = useActiveTabStore();
  const mode = profile?.businessProfile?.isLive ? "live" : "test";

  const filters = useTransactionFilters();
  const setFromQueryParams = useTransactionFilters((state) => state.setFromQueryParams);
  const getQueryParams = useTransactionFilters((state) => state.getQueryParams);
  const [appliedParams, setAppliedParams] = useState(() => buildTransactionParams(filters, mode));

  useEffect(() => {
    setActiveTab("Transactions");
  }, [setActiveTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFromQueryParams(params);
  }, [setFromQueryParams]);

  const syncUrlWithFilters = useCallback(() => {
    const params = new URLSearchParams(getQueryParams());
    const query = params.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, [getQueryParams]);

  const { data: searchedTransaction, isFetching: searchFetching } = useTransaction(searchId, !!searchId);

  const handleSearch = useCallback((id: string) => {
    setSearchId(id);
  }, []);

  useEffect(() => {
    if (searchedTransaction && searchId) {
      setSelectedTransaction(searchedTransaction);
      setSearchId("");
    }
  }, [searchedTransaction, searchId]);

  const handleApplyFilters = useCallback(() => {
    const params = buildTransactionParams(filters, mode);
    setAppliedParams(params);
    setCursorHistory([]);
    setCurrentPage(1);
    syncUrlWithFilters();
  }, [filters, mode, syncUrlWithFilters]);

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    isFetching,
  } = useTransactions(appliedParams);

  const { mutate: refundTransaction, isPending: isRefunding } = useRefund();
  const { mutate: retryRefundTransaction, isPending: isRetryingRefund } = useRetryRefund();
  const { mutate: retryPayoutTransaction, isPending: isRetryingPayout } = useRetryPayout();
  const { mutate: initiatePayoutTransaction, isPending: isInitiatingPayout } = usePayout();
  const { data: balances = [] } = useBalance();

  const handleNextPage = useCallback(() => {
    if (transactionsData?.hasNextPage && transactionsData.nextCursor) {
      setCursorHistory((prev) => [...prev, appliedParams.cursor || ""]);
      setAppliedParams((prev) => ({ ...prev, cursor: transactionsData.nextCursor }));
      setCurrentPage((prev) => prev + 1);
    }
  }, [transactionsData, appliedParams.cursor]);

  const handlePreviousPage = useCallback(() => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      setCursorHistory(newHistory);
      setAppliedParams((prev) => ({ ...prev, cursor: previousCursor || undefined }));
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  }, [cursorHistory]);

  const handleItemsPerPageChange = useCallback(
    (newLimit: number) => {
      filters.setLimit(newLimit);
      setAppliedParams((prev) => ({ ...prev, limit: newLimit, cursor: undefined }));
      setCursorHistory([]);
      setCurrentPage(1);
      const params = new URLSearchParams(getQueryParams());
      if (newLimit === 10) {
        params.delete("limit");
      } else {
        params.set("limit", String(newLimit));
      }
      const query = params.toString();
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, "", nextUrl);
    },
    [filters, getQueryParams]
  );

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

  const handleRefund = () => {
    if (!selectedTransaction) return;
    if (!refundData.walletAddress || !refundData.twoFAKey) {
      toast.error("Please provide wallet address and 2FA key");
      return;
    }
    refundTransaction(
      {
        originalTxId: selectedTransaction.id,
        to: refundData.walletAddress,
        twoFAKey: refundData.twoFAKey,
      },
      {
        onSuccess: (data: any) => {
          setResultData({
            type: "success",
            title: "Refund Successful",
            message: "The refund has been processed successfully.",
            data: data,
            action: "refund",
          });
          setResultModalOpen(true);
          setRefundModalOpen(false);
          setRefundData({ walletAddress: "", twoFAKey: "" });
          setSelectedTransaction(null);
        },
        onError: (error: any) => {
          setResultData({
            type: "error",
            title: "Refund Failed",
            message: error?.response?.data?.message || "Failed to process refund",
            action: "refund",
          });
          setResultModalOpen(true);
        },
      }
    );
  };

  const handleRetryRefund = () => {
    if (!selectedTransaction) return;
    if (!retryRefundData.twoFAKey) {
      toast.error("Please provide 2FA key");
      return;
    }
    retryRefundTransaction(
      {
        transactionId: selectedTransaction.id,
        twoFAKey: retryRefundData.twoFAKey,
      },
      {
        onSuccess: () => {
          setResultData({
            type: "success",
            title: "Refund Retry Successful",
            message: "The refund retry has been processed successfully.",
          });
          setResultModalOpen(true);
          setRetryRefundModalOpen(false);
          setRetryRefundData({ twoFAKey: "" });
          setSelectedTransaction(null);
        },
        onError: (error: any) => {
          setResultData({
            type: "error",
            title: "Refund Retry Failed",
            message: error?.response?.data?.message || "Failed to process refund retry",
          });
          setResultModalOpen(true);
        },
      }
    );
  };

  const handleRetryPayout = () => {
    if (!selectedTransaction) return;
    if (!retryPayoutData.twoFAKey) {
      toast.error("Please provide 2FA key");
      return;
    }
    retryPayoutTransaction(
      {
        transactionId: selectedTransaction.id,
        twoFAKey: retryPayoutData.twoFAKey,
      },
      {
        onSuccess: () => {
          setResultData({
            type: "success",
            title: "Payout Retry Successful",
            message: "The payout retry has been processed successfully.",
          });
          setResultModalOpen(true);
          setRetryPayoutModalOpen(false);
          setRetryPayoutData({ twoFAKey: "" });
          setSelectedTransaction(null);
        },
        onError: (error: any) => {
          setResultData({
            type: "error",
            title: "Payout Retry Failed",
            message: error?.response?.data?.message || "Failed to process payout retry",
          });
          setResultModalOpen(true);
        },
      }
    );
  };

  const handleInitiatePayout = () => {
    if (!payoutData.amount || !payoutData.twoFAKey) {
      toast.error("Please provide amount and 2FA key");
      return;
    }

    const payoutParams = payoutUsingAccount
      ? {
          amount: parseFloat(payoutData.amount),
          cryptoSettlementAccountId: payoutData.cryptoSettlementAccountId,
          twoFAKey: payoutData.twoFAKey,
        }
      : {
          amount: parseFloat(payoutData.amount),
          walletAddress: payoutData.walletAddress,
          network: "SUI", // For now, only SUI is supported
          twoFAKey: payoutData.twoFAKey,
          ...(payoutData.save && { alias: payoutData.alias }),
          ...(payoutData.save && { save: true }),
        };

    initiatePayoutTransaction(payoutParams as any, {
      onSuccess: () => {
        setResultData({
          type: "success",
          title: "Payout Initiated",
          message: `Successfully initiated payout of ${payoutData.amount} USDC`,
        });
        setResultModalOpen(true);
        setPayoutModalOpen(false);
        setPayoutData({
          amount: "",
          walletAddress: "",
          alias: "",
          save: false,
          twoFAKey: "",
          cryptoSettlementAccountId: "",
        });
      },
      onError: (error: any) => {
        //console.log(error)
        setResultData({
          type: "error",
          title: "Payout Failed",
          message: error?.response?.data?.message || "Failed to initiate payout",
        });
        setResultModalOpen(true);
      },
    });
  };

  const totalPayoutableBalance = balances.find((b) => b.coinType === "USDC")?.balance || 0;

  return (
    <DashboardWrapper>
      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Total Transactions: {totalCount.toLocaleString()}</p>
            <button
              onClick={() => setPayoutModalOpen(true)}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              + Initiate Payout
            </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <TransactionFilters onApply={handleApplyFilters} onSearch={handleSearch} searchLoading={searchFetching} />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show:</span>
            <select
              value={filters.limit}
              onChange={(event) => handleItemsPerPageChange(Number(event.target.value))}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>
          </div>
        ) : transactionsError ? (
          <ErrorState message="Failed to load transactions" type="error" />
        ) : transactions.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase text-gray-600">ID</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase text-gray-600">Customer</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase text-gray-600">Amount</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase text-gray-600">Currency</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase text-gray-600">Network</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase text-gray-600">Type</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase text-gray-600">Status</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => {
                      const getRowBgColor = (type: string) => {
                        switch (type) {
                          case "payment":
                            return "bg-blue-50 hover:bg-blue-100";
                          case "payout":
                            return "bg-purple-50 hover:bg-purple-100";
                          case "refund":
                            return "bg-orange-50 hover:bg-orange-100";
                          default:
                            return "hover:bg-gray-50";
                        }
                      };
                      return (
                      <tr
                        key={tx.id}
                        className={`cursor-pointer transition-colors ${getRowBgColor(tx.type)}`}
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        <td className="px-4 py-2.5 text-xs font-medium text-blue-600">{tx.id.slice(0, 8)}...</td>
                        <td className="px-4 py-2.5">
                          <div className="text-xs font-medium text-gray-900">
                            {tx.customer
                              ? `${tx.customer.firstname || ""} ${tx.customer.lastname || ""}`.trim() || "N/A"
                              : "N/A"}
                          </div>
                          <div className="text-[11px] text-gray-500">{tx.customer?.email || "N/A"}</div>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-medium text-gray-900">
                          {tx.amount?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{tx.currency || "N/A"}</td>
                        <td className="px-4 py-2.5">
                          {tx.network ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                              {tx.network.logo && (
                                <img src={tx.network.logo} alt={tx.network.symbol} className="w-3 h-3 rounded-full" />
                              )}
                              {tx.network.symbol}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              tx.type === "payment"
                                ? "bg-blue-100 text-blue-700"
                                : tx.type === "payout"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "N/A"}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3">
              <div className="text-xs text-gray-500">
                Page {currentPage} • Showing {transactions.length} of {totalCount.toLocaleString()} transactions
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={!hasPreviousPage || isFetching}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    hasPreviousPage && !isFetching
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "cursor-not-allowed bg-gray-50 text-gray-300"
                  }`}
                >
                  ← Previous
                </button>

                <span className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">{currentPage}</span>

                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || isFetching}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    hasNextPage && !isFetching
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "cursor-not-allowed bg-gray-50 text-gray-300"
                  }`}
                >
                  Next →
                </button>
              </div>

              {isFetching && !transactionsLoading && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
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

      <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Transaction Details" size="wide">
        {selectedTransaction && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-500">Transaction ID</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-gray-900">{selectedTransaction.id}</span>
                  <CopyButton text={selectedTransaction.id} />
                </div>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                {selectedTransaction.status}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {selectedTransaction.type === "PAYMENT" && selectedTransaction.status.toLowerCase() == "completed" && !selectedTransaction.payment?.refunded && (
                <button
                  onClick={() => setRefundModalOpen(true)}
                  disabled={isRefunding}
                  className="flex-1 rounded-md bg-orange-600 px-3 py-2 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {isRefunding ? "Processing..." : "Refund Payment"}
                </button>
              )}
              {selectedTransaction.type === "REFUND" && selectedTransaction.status.toLowerCase() === "failed" && (
                <button
                  onClick={() => setRetryRefundModalOpen(true)}
                  disabled={isRetryingRefund}
                  className="flex-1 rounded-md bg-yellow-600 px-3 py-2 text-xs font-medium text-white hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  {isRetryingRefund ? "Processing..." : "Retry Refund"}
                </button>
              )}
              {selectedTransaction.type === "PAYOUT" && selectedTransaction.status.toLowerCase() === "failed" && (
                <button
                  onClick={() => setRetryPayoutModalOpen(true)}
                  disabled={isRetryingPayout}
                  className="flex-1 rounded-md bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {isRetryingPayout ? "Processing..." : "Retry Payout"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500">Amount</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedTransaction.amount?.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500">Amount in USDC</p>
                <p className="text-sm font-semibold text-gray-900">${selectedTransaction.amountInUSDC?.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500">Type</p>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    selectedTransaction.type === "PAYMENT"
                      ? "bg-blue-100 text-blue-700"
                      : selectedTransaction.type === "PAYOUT"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {selectedTransaction.type}
                </span>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500">Currency</p>
                <p className="text-sm font-semibold text-gray-900">{selectedTransaction.currency || "N/A"}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500">Network</p>
                {selectedTransaction.network ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                    {selectedTransaction.network.logo && (
                      <img src={selectedTransaction.network.logo} alt={selectedTransaction.network.symbol} className="w-3 h-3 rounded-full" />
                    )}
                    {selectedTransaction.network.symbol}
                  </span>
                ) : (
                  <p className="text-sm font-semibold text-gray-400">N/A</p>
                )}
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500">Mode</p>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    selectedTransaction.mode === "live" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {selectedTransaction.mode}
                </span>
              </div>
            </div>

            {selectedTransaction.customer && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="mb-2 text-[11px] text-gray-500">Customer</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                    {selectedTransaction.customer.firstname?.charAt(0) || "C"}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      {selectedTransaction.customer.firstname} {selectedTransaction.customer.lastname}
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="text-[11px] text-gray-500">{selectedTransaction.customer.email}</p>
                      <CopyButton text={selectedTransaction.customer.email} />
                    </div>
                    {selectedTransaction.customer.id && (
                      <div className="mt-0.5 flex items-center gap-1">
                        <p className="text-[10px] text-gray-400">ID: {selectedTransaction.customer.id}</p>
                        <CopyButton text={selectedTransaction.customer.id} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedTransaction.profile && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="mb-1 text-[11px] text-gray-500">Merchant</p>
                <p className="text-xs font-medium text-gray-900">{selectedTransaction.profile.businessName}</p>
                <div className="flex items-center gap-1">
                  <p className="text-[11px] text-gray-500">{selectedTransaction.profile.user?.email}</p>
                  {selectedTransaction.profile.user?.email && <CopyButton text={selectedTransaction.profile.user.email} />}
                </div>
                {selectedTransaction.profile.id && (
                  <div className="mt-0.5 flex items-center gap-1">
                    <p className="text-[10px] text-gray-400">ID: {selectedTransaction.profile.id}</p>
                    <CopyButton text={selectedTransaction.profile.id} />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500">Created At</p>
                <p className="text-xs font-medium text-gray-900">
                  {selectedTransaction.createdAt ? new Date(selectedTransaction.createdAt).toLocaleString() : "N/A"}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500">Confirmed At</p>
                <p className="text-xs font-medium text-gray-900">
                  {selectedTransaction.confirmedAt ? new Date(selectedTransaction.confirmedAt).toLocaleString() : "Pending"}
                </p>
              </div>
            </div>

            {selectedTransaction.payment && (
              <div className="border-t border-gray-200 pt-3">
                <p className="mb-2 text-xs font-semibold text-gray-700">Payment Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-[11px] text-blue-600">Payment ID</p>
                    <div className="flex items-center gap-1">
                      <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.payment.id}</p>
                      <CopyButton text={selectedTransaction.payment.id} />
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-[11px] text-blue-600">Payment Method</p>
                    <p className="text-xs font-medium text-gray-900">{selectedTransaction.payment.paymentMethod || "N/A"}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-[11px] text-blue-600">Refunded</p>
                    <p className="text-xs font-medium text-gray-900">{selectedTransaction.payment.refunded ? "Yes" : "No"}</p>
                  </div>
                  {selectedTransaction.payment.txRef && (
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-[11px] text-blue-600">Transaction Reference</p>
                      <div className="flex items-center gap-1">
                        <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.payment.txRef}</p>
                        <CopyButton text={selectedTransaction.payment.txRef} />
                      </div>
                    </div>
                  )}
                  {selectedTransaction.payment.depositAddress && (
                    <div className="col-span-2 rounded-lg bg-blue-50 p-3">
                      <p className="text-[11px] text-blue-600">Deposit Address</p>
                      <div className="flex items-center gap-1">
                        <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.payment.depositAddress}</p>
                        <CopyButton text={selectedTransaction.payment.depositAddress} />
                      </div>
                    </div>
                  )}
                  {selectedTransaction.payment.wallet?.address && (
                    <div className="col-span-2 rounded-lg bg-blue-50 p-3">
                      <p className="text-[11px] text-blue-600">Wallet Public Key</p>
                      <div className="flex items-center gap-1">
                        <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.payment.wallet.address}</p>
                        <CopyButton text={selectedTransaction.payment.wallet.address} />
                      </div>
                    </div>
                  )}
                  {selectedTransaction.payment.redirectUrl && (
                    <div className="col-span-2 rounded-lg bg-blue-50 p-3">
                      <p className="text-[11px] text-blue-600">Redirect URL</p>
                      <div className="flex items-center gap-1">
                        <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.payment.redirectUrl}</p>
                        <CopyButton text={selectedTransaction.payment.redirectUrl} />
                      </div>
                    </div>
                  )}
                  {selectedTransaction.payment.paylinkId && (
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-[11px] text-blue-600">Paylink ID</p>
                      <div className="flex items-center gap-1">
                        <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.payment.paylinkId}</p>
                        <CopyButton text={selectedTransaction.payment.paylinkId} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTransaction.payout && (
              <div className="border-t border-gray-200 pt-3">
                <p className="mb-2 text-xs font-semibold text-gray-700">Payout Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-purple-50 p-3">
                    <p className="text-[11px] text-purple-600">Payout ID</p>
                    <div className="flex items-center gap-1">
                      <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.payout.id}</p>
                      <CopyButton text={selectedTransaction.payout.id} />
                    </div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-3">
                    <p className="text-[11px] text-purple-600">Method</p>
                    <p className="text-xs font-medium text-gray-900">{selectedTransaction.payout.method || "N/A"}</p>
                  </div>
                  {selectedTransaction.payout.walletAddress && (
                    <div className="col-span-2 rounded-lg bg-purple-50 p-3">
                      <p className="text-[11px] text-purple-600">Wallet Address</p>
                      <div className="flex items-center gap-1">
                        <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.payout.walletAddress}</p>
                        <CopyButton text={selectedTransaction.payout.walletAddress} />
                      </div>
                    </div>
                  )}
                  {selectedTransaction.payout.txDigest && (
                    <div className="col-span-2 rounded-lg bg-purple-50 p-3">
                      <p className="text-[11px] text-purple-600">Transaction Digest</p>
                      <div className="flex items-center gap-1">
                        <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.payout.txDigest}</p>
                        <CopyButton text={selectedTransaction.payout.txDigest} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTransaction.refund && (
              <div className="border-t border-gray-200 pt-3">
                <p className="mb-2 text-xs font-semibold text-gray-700">Refund Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-orange-50 p-3">
                    <p className="text-[11px] text-orange-600">Refund ID</p>
                    <div className="flex items-center gap-1">
                      <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.refund.id}</p>
                      <CopyButton text={selectedTransaction.refund.id} />
                    </div>
                  </div>
                  {selectedTransaction.refund.reason && (
                    <div className="rounded-lg bg-orange-50 p-3">
                      <p className="text-[11px] text-orange-600">Reason</p>
                      <p className="text-xs font-medium text-gray-900">{selectedTransaction.refund.reason}</p>
                    </div>
                  )}
                  {selectedTransaction.refund.originalTxId && (
                    <div className="col-span-2 rounded-lg bg-orange-50 p-3">
                      <p className="text-[11px] text-orange-600">Original Transaction ID</p>
                      <div className="flex items-center gap-1">
                        <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.refund.originalTxId}</p>
                        <CopyButton text={selectedTransaction.refund.originalTxId} />
                      </div>
                    </div>
                  )}
                  {selectedTransaction.refund.walletAddress && (
                    <div className="col-span-2 rounded-lg bg-orange-50 p-3">
                      <p className="text-[11px] text-orange-600">Wallet Address</p>
                      <div className="flex items-center gap-1">
                        <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.refund.walletAddress}</p>
                        <CopyButton text={selectedTransaction.refund.walletAddress} />
                      </div>
                    </div>
                  )}
                  {selectedTransaction.refund.txDigest && (
                    <div className="col-span-2 rounded-lg bg-orange-50 p-3">
                      <p className="text-[11px] text-orange-600">Transaction Digest</p>
                      <div className="flex items-center gap-1">
                        <p className="break-all text-xs font-medium text-gray-900">{selectedTransaction.refund.txDigest}</p>
                        <CopyButton text={selectedTransaction.refund.txDigest} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {selectedTransaction.status.toLowerCase() === "completed" &&
              selectedTransaction.type === "payment" &&
              !selectedTransaction.payment?.refunded  && (
                <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-600">
                  Click the "Refund Payment" button above to initiate a refund for this transaction.
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal isOpen={refundModalOpen} onClose={() => setRefundModalOpen(false)} title="Refund Payment" size="default">
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-[11px] text-blue-600">Network</p>
              <div className="flex items-center gap-2">
                {selectedTransaction.network?.logo && (
                  <img src={selectedTransaction.network.logo} alt={selectedTransaction.network.symbol} className="w-4 h-4 rounded-full" />
                )}
                <p className="text-sm font-semibold text-gray-900">{selectedTransaction.network?.symbol || "N/A"}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Wallet Address</label>
              <input
                type="text"
                value={refundData.walletAddress}
                onChange={(e) => setRefundData({ ...refundData, walletAddress: e.target.value })}
                placeholder={`Enter ${selectedTransaction.network?.symbol || "wallet"} address`}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">2FA Key</label>
              <input
                type="password"
                value={refundData.twoFAKey}
                onChange={(e) => setRefundData({ ...refundData, twoFAKey: e.target.value })}
                placeholder="Enter your 2FA key"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRefund}
                disabled={isRefunding}
                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isRefunding ? "Processing..." : "Confirm Refund"}
              </button>
              <button
                onClick={() => setRefundModalOpen(false)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Retry Refund Modal */}
      <Modal isOpen={retryRefundModalOpen} onClose={() => setRetryRefundModalOpen(false)} title="Retry Refund" size="default">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">2FA Key</label>
            <input
              type="password"
              value={retryRefundData.twoFAKey}
              onChange={(e) => setRetryRefundData({ ...retryRefundData, twoFAKey: e.target.value })}
              placeholder="Enter your 2FA key"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRetryRefund}
              disabled={isRetryingRefund}
              className="flex-1 rounded-md bg-yellow-600 px-3 py-2 text-xs font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {isRetryingRefund ? "Processing..." : "Retry Refund"}
            </button>
            <button
              onClick={() => setRetryRefundModalOpen(false)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Retry Payout Modal */}
      <Modal isOpen={retryPayoutModalOpen} onClose={() => setRetryPayoutModalOpen(false)} title="Retry Payout" size="default">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">2FA Key</label>
            <input
              type="password"
              value={retryPayoutData.twoFAKey}
              onChange={(e) => setRetryPayoutData({ ...retryPayoutData, twoFAKey: e.target.value })}
              placeholder="Enter your 2FA key"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRetryPayout}
              disabled={isRetryingPayout}
              className="flex-1 rounded-md bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {isRetryingPayout ? "Processing..." : "Retry Payout"}
            </button>
            <button
              onClick={() => setRetryPayoutModalOpen(false)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Payout Modal */}
      <Modal isOpen={payoutModalOpen} onClose={() => setPayoutModalOpen(false)} title="Initiate Payout" size="default">
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-[11px] text-blue-600">Available Balance (SUI)</p>
            <p className="text-lg font-semibold text-gray-900">{totalPayoutableBalance.toLocaleString()} USDC</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Payout Method</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPayoutUsingAccount(true)}
                className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  payoutUsingAccount
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Saved Account
              </button>
              <button
                onClick={() => setPayoutUsingAccount(false)}
                className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  !payoutUsingAccount
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                New Address
              </button>
            </div>
          </div>

          {payoutUsingAccount && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Saved Account</label>
              <div className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-500">
                No saved accounts
              </div>
            </div>
          )}

          {!payoutUsingAccount && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Wallet Address (SUI Network)</label>
                <input
                  type="text"
                  value={payoutData.walletAddress}
                  onChange={(e) => setPayoutData({ ...payoutData, walletAddress: e.target.value })}
                  placeholder="Enter SUI wallet address"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="save-account"
                  checked={payoutData.save}
                  onChange={(e) => setPayoutData({ ...payoutData, save: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="save-account" className="text-xs text-gray-600">
                  Save this account for future payouts
                </label>
              </div>

              {payoutData.save && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Account Alias</label>
                  <input
                    type="text"
                    value={payoutData.alias}
                    onChange={(e) => setPayoutData({ ...payoutData, alias: e.target.value })}
                    placeholder="e.g., My Wallet"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Amount (USDC)</label>
            <input
              type="number"
              value={payoutData.amount}
              onChange={(e) => setPayoutData({ ...payoutData, amount: e.target.value })}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">2FA Key</label>
            <input
              type="password"
              value={payoutData.twoFAKey}
              onChange={(e) => setPayoutData({ ...payoutData, twoFAKey: e.target.value })}
              placeholder="Enter your 2FA key"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleInitiatePayout}
              disabled={isInitiatingPayout}
              className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isInitiatingPayout ? "Processing..." : "Initiate Payout"}
            </button>
            <button
              onClick={() => setPayoutModalOpen(false)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Result Modal */}
      <Modal isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)} title={resultData.title} size="default">
        <div className="space-y-4">
          <div
            className={`rounded-lg p-4 ${
              resultData.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <p className="text-sm">{resultData.message}</p>
          </div>

          <button
            onClick={() => setResultModalOpen(false)}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </Modal>
    </DashboardWrapper>
  );
};

export default Transactions;
