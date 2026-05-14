import { useState, useCallback, useEffect, useRef } from "react";
import { FiBriefcase } from "react-icons/fi";
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
import { isBrowser, parseNumberParam, updateQueryParams } from "../lib/queryState";
import {
  useRefund,
  useRetryRefund,
  useRetryPayout,
  useTransaction,
  useTransactions,
  useCreateCryptoPayout,
  useCreateFiatPayout,
} from "../hooks/mutations/useTransactions";
import { useBalance } from "../hooks/mutations/useDashboard";
import { useGetCryptoSettlements, useGetALLFiatSettlements, useListFiatBanks, useResolveFiatAccount } from "../hooks/mutations/useSettlements";

const TRANSACTION_QUERY_KEYS = [
  "type",
  "status",
  "token",
  "currency",
  "network",
  "paymentMethod",
  "paymentLinkId",
  "customerId",
  "userId",
  "search",
  "limit",
  "dateType",
  "dateInterval",
  "startDate",
  "endDate",
  "cursor",
  "page",
];

const Transactions = () => {
  const MIN_PAYOUT_AMOUNT = 2;
  const MAX_PAYOUT_AMOUNT = 200;
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchId, setSearchId] = useState("");

  // Payout dropdown state
  const [payoutDropdownOpen, setPayoutDropdownOpen] = useState(false);
  const [payoutType, setPayoutType] = useState<"crypto" | "fiat">("crypto");

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

  // Fiat payout modal state
  const [fiatPayoutUsingAccount, setFiatPayoutUsingAccount] = useState(true);
  const [fiatPayoutData, setFiatPayoutData] = useState({
    amount: "",
    accountId: "",
    bankCode: "",
    accountIdentifier: "",
    alias: "",
    save: false,
    twoFAKey: "",
  });

  // Fiat payout form UI state
  const [payoutBankNameInput, setPayoutBankNameInput] = useState("");
  const [showPayoutBankDropdown, setShowPayoutBankDropdown] = useState(false);
  const [resolvedPayoutAccountName, setResolvedPayoutAccountName] = useState<string | null>(null);
  const [payoutResolutionError, setPayoutResolutionError] = useState<string | null>(null);

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

  // Dropdown ref for click outside handling
  const payoutDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (payoutDropdownRef.current && !payoutDropdownRef.current.contains(event.target as Node)) {
        setPayoutDropdownOpen(false);
      }
    };

    if (payoutDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [payoutDropdownOpen]);

  const filters = useTransactionFilters();
  const setFromQueryParams = useTransactionFilters((state) => state.setFromQueryParams);
  const getQueryParams = useTransactionFilters((state) => state.getQueryParams);
  const [appliedParams, setAppliedParams] = useState(() => buildTransactionParams(filters, mode));

  useEffect(() => {
    setActiveTab("Transactions");
  }, [setActiveTab]);

  useEffect(() => {
    if (!isBrowser) return;
    const params = new URLSearchParams(window.location.search);
    setFromQueryParams(params);
    setCurrentPage(parseNumberParam(params.get("page"), 1));
    setAppliedParams(buildTransactionParams(useTransactionFilters.getState(), mode));
    setCursorHistory([]);
  }, [setFromQueryParams, mode]);

  useEffect(() => {
    if (!isBrowser) return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFromQueryParams(params);
      setCurrentPage(parseNumberParam(params.get("page"), 1));
      setAppliedParams(buildTransactionParams(useTransactionFilters.getState(), mode));
      setCursorHistory([]);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setFromQueryParams, mode]);

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
    updateQueryParams(
      {
        ...getQueryParams(),
        page: null,
        cursor: null,
      },
      { managedKeys: TRANSACTION_QUERY_KEYS, replace: false }
    );
  }, [filters, mode, getQueryParams]);


  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    isFetching,
  } = useTransactions(appliedParams);

  const { mutate: refundTransaction, isPending: isRefunding } = useRefund();
  const { mutate: retryRefundTransaction, isPending: isRetryingRefund } = useRetryRefund();
  
  // Determine payout type from selected transaction
  const getPayoutTypeFromTransaction = (transaction: Transaction | null): "crypto" | "fiat" => {
    if (!transaction || !transaction.payout) return "crypto";
    // Check if payout method indicates fiat (e.g., contains 'bank', 'fiat', or no walletAddress)
    const method = transaction.payout.method?.toLowerCase() || "";
    return method.includes("fiat") || method.includes("bank") ? "fiat" : "crypto";
  };

  const payoutTypeForRetry = getPayoutTypeFromTransaction(selectedTransaction);
  const { mutate: retryPayoutTransaction, isPending: isRetryingPayout } = useRetryPayout(payoutTypeForRetry);
  const { mutate: initiatePayoutTransaction, isPending: isInitiatingPayout } = usePayout();
  const { mutate: initiateFiatPayoutTransaction, isPending: isInitiatingFiatPayout } = useCreateFiatPayout();
  const { data: balances = [] } = useBalance();
  const { data: cryptoSettlements = [] } = useGetCryptoSettlements();
  const { data: fiatSettlements = [] } = useGetALLFiatSettlements();

  // Bank list and account resolution for fiat payouts
  const { data: banksList = [], isLoading: banksLoading } = useListFiatBanks();
  const { data: resolvedPayoutAccount, isFetching: isRefetchingPayoutResolve } = useResolveFiatAccount(
    fiatPayoutData.bankCode && fiatPayoutData.accountIdentifier.length === 10
      ? { accountNumber: fiatPayoutData.accountIdentifier, bankCode: fiatPayoutData.bankCode }
      : null
  );

  const handleNextPage = useCallback(() => {
    if (transactionsData?.hasNextPage && transactionsData.nextCursor) {
      const nextPage = currentPage + 1;
      setCursorHistory((prev) => [...prev, appliedParams.cursor || ""]);
      setAppliedParams((prev) => ({ ...prev, cursor: transactionsData.nextCursor }));
      setCurrentPage(nextPage);
      updateQueryParams(
        {
          ...getQueryParams(),
          page: String(nextPage),
          cursor: transactionsData.nextCursor,
        },
        { managedKeys: TRANSACTION_QUERY_KEYS, replace: false }
      );
    }
  }, [transactionsData, appliedParams.cursor, currentPage, getQueryParams]);

  const handlePreviousPage = useCallback(() => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      const nextPage = Math.max(1, currentPage - 1);
      const pageParam = nextPage === 1 ? null : String(nextPage);
      setCursorHistory(newHistory);
      setAppliedParams((prev) => ({ ...prev, cursor: previousCursor || undefined }));
      setCurrentPage(nextPage);
      updateQueryParams(
        {
          ...getQueryParams(),
          page: pageParam,
          cursor: previousCursor || null,
        },
        { managedKeys: TRANSACTION_QUERY_KEYS, replace: false }
      );
    }
  }, [cursorHistory, currentPage, getQueryParams]);

  const handleItemsPerPageChange = useCallback(
    (newLimit: number) => {
      filters.setLimit(newLimit);
      setAppliedParams((prev) => ({ ...prev, limit: newLimit, cursor: undefined }));
      setCursorHistory([]);
      setCurrentPage(1);
      updateQueryParams(
        {
          ...getQueryParams(),
          limit: newLimit === 10 ? null : String(newLimit),
          page: null,
          cursor: null,
        },
        { managedKeys: TRANSACTION_QUERY_KEYS, replace: false }
      );
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
    if (!refundData.walletAddress) {
      toast.error("Please provide wallet address");
      return;
    }
    if (mode === "live" && !refundData.twoFAKey) {
      toast.error("Please provide 2FA key");
      return;
    }
    refundTransaction(
      {
        originalTxId: selectedTransaction.id,
        to: refundData.walletAddress,
        ...(mode === "live" && { twoFAKey: refundData.twoFAKey }),
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
    if (mode === "live" && !retryRefundData.twoFAKey) {
      toast.error("Please provide 2FA key");
      return;
    }
    retryRefundTransaction(
      {
        transactionId: selectedTransaction.id,
        ...(mode === "live" && { twoFAKey: retryRefundData.twoFAKey }),
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
    if (mode === "live" && !retryPayoutData.twoFAKey) {
      toast.error("Please provide 2FA key");
      return;
    }
    retryPayoutTransaction(
      {
        transactionId: selectedTransaction.id,
        ...(mode === "live" && { twoFAKey: retryPayoutData.twoFAKey }),
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
    if (!payoutData.amount) {
      toast.error("Please provide amount");
      return;
    }
    const payoutAmount = Number.parseFloat(payoutData.amount);
    if (Number.isNaN(payoutAmount)) {
      toast.error("Please provide a valid amount");
      return;
    }
    if (payoutAmount < MIN_PAYOUT_AMOUNT) {
      toast.error(`Amount is below the minimum payout of $${MIN_PAYOUT_AMOUNT}`);
      return;
    }
    if (payoutAmount > MAX_PAYOUT_AMOUNT) {
      toast.error(`Amount exceeds the maximum payout of $${MAX_PAYOUT_AMOUNT}`);
      return;
    }
    if (payoutAmount > totalPayoutableBalance) {
      toast.error("Insufficient balance for this payout amount");
      return;
    }
    if (mode === "live" && !payoutData.twoFAKey) {
      toast.error("Please provide 2FA key");
      return;
    }

    if (payoutUsingAccount && !payoutData.cryptoSettlementAccountId) {
      toast.error("Please select a settlement account");
      return;
    }

    if (!payoutUsingAccount && !payoutData.walletAddress) {
      toast.error("Please provide a wallet address");
      return;
    }

    const payoutParams = payoutUsingAccount
      ? {
        amount: parseFloat(payoutData.amount),
        cryptoSettlementAccountId: payoutData.cryptoSettlementAccountId,
        ...(mode === "live" && { twoFAKey: payoutData.twoFAKey }),
      }
      : {
        amount: parseFloat(payoutData.amount),
        walletAddress: payoutData.walletAddress,
        network: "SUI", // For now, only SUI is supported
        ...(mode === "live" && { twoFAKey: payoutData.twoFAKey }),
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
        setPayoutUsingAccount(true);
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

  const handleInitiateFiatPayout = () => {
    if (!fiatPayoutData.amount) {
      toast.error("Please provide amount");
      return;
    }
    const payoutAmount = Number.parseFloat(fiatPayoutData.amount);
    if (Number.isNaN(payoutAmount)) {
      toast.error("Please provide a valid amount");
      return;
    }
    if (payoutAmount < MIN_PAYOUT_AMOUNT) {
      toast.error(`Amount is below the minimum payout of $${MIN_PAYOUT_AMOUNT}`);
      return;
    }
    if (payoutAmount > MAX_PAYOUT_AMOUNT) {
      toast.error(`Amount exceeds the maximum payout of $${MAX_PAYOUT_AMOUNT}`);
      return;
    }
    if (payoutAmount > totalPayoutableBalance) {
      toast.error("Insufficient balance for this payout amount");
      return;
    }
    if (mode === "live" && !fiatPayoutData.twoFAKey) {
      toast.error("Please provide 2FA key");
      return;
    }

    if (fiatPayoutUsingAccount && !fiatPayoutData.accountId) {
      toast.error("Please select a bank account");
      return;
    }

    if (!fiatPayoutUsingAccount && (!resolvedPayoutAccountName || !fiatPayoutData.bankCode || fiatPayoutData.accountIdentifier.length !== 10)) {
      toast.error("Please verify account details before proceeding");
      return;
    }

    const fiatPayoutParams: any = {
      amount: parseFloat(fiatPayoutData.amount),
      ...(mode === "live" && { twoFAKey: fiatPayoutData.twoFAKey }),
    };

    if (fiatPayoutUsingAccount) {
      fiatPayoutParams.accountId = fiatPayoutData.accountId;
    } else {
      fiatPayoutParams.bankCode = fiatPayoutData.bankCode;
      fiatPayoutParams.accountIdentifier = fiatPayoutData.accountIdentifier;

      if (fiatPayoutData.save && fiatPayoutData.alias) {
        fiatPayoutParams.save = true;
        fiatPayoutParams.alias = fiatPayoutData.alias;
      }
    }

    initiateFiatPayoutTransaction(fiatPayoutParams, {
      onSuccess: () => {
        setResultData({
          type: "success",
          title: "Fiat Payout Initiated",
          message: `Successfully initiated fiat payout of ${fiatPayoutData.amount}`,
        });
        setResultModalOpen(true);
        setPayoutModalOpen(false);
        setFiatPayoutData({
          amount: "",
          accountId: "",
          bankCode: "",
          accountIdentifier: "",
          alias: "",
          save: false,
          twoFAKey: "",
        });
        setFiatPayoutUsingAccount(true);
        setPayoutBankNameInput("");
        setResolvedPayoutAccountName(null);
        setPayoutResolutionError(null);
      },
      onError: (error: any) => {
        setResultData({
          type: "error",
          title: "Fiat Payout Failed",
          message: error?.response?.data?.message || "Failed to initiate fiat payout",
        });
        setResultModalOpen(true);
      },
    });
  };

  const handlePayoutBankNameChange = (value: string) => {
    setPayoutBankNameInput(value);
    setShowPayoutBankDropdown(true);
  };

  const handlePayoutBankSelect = (bank: { name: string; bankCode: string }) => {
    setPayoutBankNameInput(bank.name);
    setFiatPayoutData((prev) => ({
      ...prev,
      bankCode: bank.bankCode,
    }));
    setShowPayoutBankDropdown(false);
  };

  const handlePayoutAccountNumberChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 10);
    setFiatPayoutData((prev) => ({
      ...prev,
      accountIdentifier: numericValue,
    }));
  };

  // Auto-resolve account when both bank and 10-digit account number are entered
  useEffect(() => {
    if (fiatPayoutData.bankCode && fiatPayoutData.accountIdentifier.length === 10 && resolvedPayoutAccount?.accountName) {
      setResolvedPayoutAccountName(resolvedPayoutAccount.accountName);
      setPayoutResolutionError(null);
    }
  }, [resolvedPayoutAccount, fiatPayoutData.bankCode, fiatPayoutData.accountIdentifier]);

  // Handle resolution errors
  useEffect(() => {
    if (fiatPayoutData.bankCode && fiatPayoutData.accountIdentifier.length === 10 && isRefetchingPayoutResolve === false && !resolvedPayoutAccount?.accountName) {
      setPayoutResolutionError("Unable to resolve account. Please check the details.");
    }
  }, [isRefetchingPayoutResolve, resolvedPayoutAccount, fiatPayoutData.bankCode, fiatPayoutData.accountIdentifier]);

  // Filter banks based on input
  const filteredPayoutBanks = (Array.isArray(banksList) ? banksList : []).filter((bank: any) =>
    bank.name.toLowerCase().includes(payoutBankNameInput.toLowerCase())
  );

  const totalPayoutableBalance = balances.find((b) => b.coinType === "USDC")?.balance || 0;

  const truncateAddress = (address: string, start = 6, end = 4) => {
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  return (
    <DashboardWrapper>
      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Total Transactions: {totalCount.toLocaleString()}</p>
          <div className="relative" ref={payoutDropdownRef}>
            <button
              onClick={() => setPayoutDropdownOpen(!payoutDropdownOpen)}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              + Initiate Payout
            </button>

            {payoutDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                <button
                  onClick={() => {
                    setPayoutType("crypto");
                    setPayoutModalOpen(true);
                    setPayoutDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors border-b border-gray-100 first:rounded-t-lg $ hover:bg-gray-50`}
                >
                  <div className={mode === "test" ? "text-gray-600" : "font-medium text-gray-900"}>Crypto Payout</div>
                  <div className="text-xs text-gray-500">Send to wallet address</div>
                </button>
                <button
                  onClick={() => {
                    if (mode === "test") return;
                    setPayoutType("fiat");
                    setPayoutModalOpen(true);
                    setPayoutDropdownOpen(false);
                  }}
                  disabled={mode === "test"}
                  title={mode === "test" ? "Fiat payout is only available in live mode" : ""}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors rounded-b-lg ${mode === "test"
                      ? "bg-gray-50 text-gray-500 cursor-not-allowed opacity-60"
                      : "hover:bg-gray-50"
                    }`}
                >
                  <div className={mode === "test" ? "text-gray-600" : "font-medium text-gray-900"}>Fiat Payout</div>
                  <div className="text-xs text-gray-500">{mode === "test" ? "Available in live mode only" : "Send to bank account"}</div>
                </button>
              </div>
            )}
          </div>
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
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${tx.type === "PAYMENT"
                                  ? "bg-blue-100 text-blue-700"
                                  : tx.type === "PAYOUT"
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
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${hasPreviousPage && !isFetching
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
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${hasNextPage && !isFetching
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
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedTransaction.type == "PAYMENT"
                      ? "bg-blue-100 text-blue-700"
                      : selectedTransaction.type == "PAYOUT"
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
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedTransaction.mode === "live" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
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
              !selectedTransaction.payment?.refunded && (
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

            {mode === "live" && (
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
            )}

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
          {mode === "live" && (
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
          )}

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
          {mode === "live" && (
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
          )}

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
      <Modal
        isOpen={payoutModalOpen}
        onClose={() => {
          setPayoutModalOpen(false);
          setPayoutType("crypto");
        }}
        title={`Initiate ${payoutType === "crypto" ? "Crypto" : "Fiat"} Payout`}
        size="default"
      >
        {payoutType === "fiat" ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-[11px] text-blue-600">Available Balance</p>
              <p className="text-lg font-semibold text-gray-900">{totalPayoutableBalance.toLocaleString()} USDC</p>
            </div>

            {totalPayoutableBalance < MIN_PAYOUT_AMOUNT && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-2">
                <p className="text-xs text-yellow-700">Amount is below the withdrawal minimum of ${MIN_PAYOUT_AMOUNT}.</p>
              </div>
            )}

            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-[11px] text-blue-600">Note</p>
              <p className="text-sm text-blue-700">If you don't select a saved account or provide bank details, your primary account will be used.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payout Method</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiatPayoutUsingAccount(true)}
                  disabled={fiatSettlements.length === 0}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${fiatSettlements.length === 0
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : fiatPayoutUsingAccount
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Saved Account
                </button>
                <button
                  onClick={() => setFiatPayoutUsingAccount(false)}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${!fiatPayoutUsingAccount
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  New Bank Account
                </button>
              </div>
            </div>

            {fiatPayoutUsingAccount && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Select Bank Account</label>
                {fiatSettlements.length === 0 ? (
                  <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                    No saved bank accounts. Go to <span className="font-semibold">Settlements</span> to add one first.
                  </div>
                ) : (
                  <select
                    value={fiatPayoutData.accountId}
                    onChange={(e) => setFiatPayoutData({ ...fiatPayoutData, accountId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select an account...{fiatSettlements.find(s => s.isPrimary) ? " (primary)" : ""}</option>
                    {fiatSettlements.map((settlement) => (
                      <option key={settlement.id} value={settlement.id}>
                        {settlement.bankName} • {settlement.accountNumber} {settlement.isPrimary ? "(Primary)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {!fiatPayoutUsingAccount && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={payoutBankNameInput}
                      onChange={(e) => handlePayoutBankNameChange(e.target.value)}
                      onFocus={() => setShowPayoutBankDropdown(true)}
                      placeholder="Type bank name..."
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {showPayoutBankDropdown && !fiatPayoutData.bankCode && (Array.isArray(banksList) && banksList.length > 0 || banksLoading) && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                        {banksLoading ? (
                          <div className="px-3 py-2 text-xs text-gray-500">Loading banks...</div>
                        ) : filteredPayoutBanks.length > 0 ? (
                          filteredPayoutBanks.map((bank: any, index: number) => (
                            <button
                              key={`payout-bank-${bank.bankCode}-${index}`}
                              type="button"
                              onClick={() => handlePayoutBankSelect(bank)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-2"
                            >
                              <FiBriefcase size={16} className="text-gray-600 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900">{bank.name}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xs text-gray-500">No matching banks</div>
                        )}
                      </div>
                    )}


                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Account Number (10 digits)</label>
                  <input
                    type="text"
                    value={fiatPayoutData.accountIdentifier}
                    onChange={(e) => handlePayoutAccountNumberChange(e.target.value)}
                    placeholder="Enter 10-digit account number"
                    maxLength={10}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">{fiatPayoutData.accountIdentifier.length}/10 digits</span>
                    {fiatPayoutData.accountIdentifier.length === 10 && !fiatPayoutData.bankCode && (
                      <span className="text-[11px] text-yellow-600">⚠ Please select a bank first</span>
                    )}
                  </div>
                </div>

                {isRefetchingPayoutResolve && fiatPayoutData.accountIdentifier.length === 10 && fiatPayoutData.bankCode && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
                    <p className="text-xs text-blue-700">🔍 Verifying account details...</p>
                  </div>
                )}

                {resolvedPayoutAccountName && fiatPayoutData.accountIdentifier.length === 10 && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-2">
                    <p className="text-[11px] text-green-600 mb-0.5">✓ Account Verified</p>
                    <p className="text-xs font-semibold text-green-900">{resolvedPayoutAccountName}</p>
                    <p className="text-[11px] text-green-700 mt-1">Account: {fiatPayoutData.accountIdentifier}</p>
                  </div>
                )}

                {payoutResolutionError && fiatPayoutData.accountIdentifier.length === 10 && fiatPayoutData.bankCode && !isRefetchingPayoutResolve && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-2">
                    <p className="text-xs text-red-700">✗ {payoutResolutionError}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="save-fiat-payout-account"
                    checked={fiatPayoutData.save}
                    onChange={(e) => setFiatPayoutData({ ...fiatPayoutData, save: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="save-fiat-payout-account" className="text-xs text-gray-600">
                    Save this account for future payouts
                  </label>
                </div>


              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={fiatPayoutData.amount}
                onChange={(e) => setFiatPayoutData({ ...fiatPayoutData, amount: e.target.value })}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-[11px] text-gray-500">Payout limits: ${MIN_PAYOUT_AMOUNT} - ${MAX_PAYOUT_AMOUNT}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFiatPayoutData({ ...fiatPayoutData, amount: (totalPayoutableBalance * 0.25).toString() })}
                  className="flex-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => setFiatPayoutData({ ...fiatPayoutData, amount: (totalPayoutableBalance * 0.5).toString() })}
                  className="flex-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setFiatPayoutData({ ...fiatPayoutData, amount: totalPayoutableBalance.toString() })}
                  className="flex-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  100%
                </button>
              </div>
              {fiatPayoutData.amount && parseFloat(fiatPayoutData.amount) > totalPayoutableBalance && (
                <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-2">
                  <p className="text-xs text-red-700">✗ Insufficient balance. Available: {totalPayoutableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC</p>
                </div>
              )}
              {fiatPayoutData.amount && parseFloat(fiatPayoutData.amount) < MIN_PAYOUT_AMOUNT && (
                <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-2">
                  <p className="text-xs text-yellow-700">✗ Amount is below the withdrawal minimum of ${MIN_PAYOUT_AMOUNT}.</p>
                </div>
              )}
              {fiatPayoutData.amount && parseFloat(fiatPayoutData.amount) > MAX_PAYOUT_AMOUNT && (
                <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-2">
                  <p className="text-xs text-yellow-700">✗ Amount exceeds the maximum payout of ${MAX_PAYOUT_AMOUNT}.</p>
                </div>
              )}
            </div>

            {mode === "live" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">2FA Key</label>
                <input
                  type="password"
                  value={fiatPayoutData.twoFAKey}
                  onChange={(e) => setFiatPayoutData({ ...fiatPayoutData, twoFAKey: e.target.value })}
                  placeholder="Enter your 2FA key"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleInitiateFiatPayout}
                disabled={
                  isInitiatingFiatPayout ||
                  fiatPayoutData.amount.trim() === "" ||
                  (mode === "live" && !fiatPayoutData.twoFAKey) ||
                  (
                    !fiatPayoutUsingAccount &&
                    (!resolvedPayoutAccountName || fiatPayoutData.accountIdentifier.length !== 10)
                  ) ||
                  (
                    !!fiatPayoutData.amount &&
                    parseFloat(fiatPayoutData.amount) > totalPayoutableBalance
                  ) ||
                  (
                    !!fiatPayoutData.amount &&
                    (parseFloat(fiatPayoutData.amount) < MIN_PAYOUT_AMOUNT || parseFloat(fiatPayoutData.amount) > MAX_PAYOUT_AMOUNT)
                  )
                }
                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isInitiatingFiatPayout ? "Processing..." : "Initiate Fiat Payout"}
              </button>
              <button
                onClick={() => {
                  setPayoutModalOpen(false);
                  setFiatPayoutData({
                    amount: "",
                    accountId: "",
                    bankCode: "",
                    accountIdentifier: "",
                    alias: "",
                    save: false,
                    twoFAKey: "",
                  });
                  setFiatPayoutUsingAccount(true);
                  setPayoutBankNameInput("");
                  setResolvedPayoutAccountName(null);
                  setPayoutResolutionError(null);
                  setPayoutType("crypto");
                }}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-[11px] text-blue-600">Available Balance</p>
              <p className="text-lg font-semibold text-gray-900">{totalPayoutableBalance.toLocaleString()} USDC</p>
            </div>

            {totalPayoutableBalance < MIN_PAYOUT_AMOUNT && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-2">
                <p className="text-xs text-yellow-700">Amount is below the withdrawal minimum of ${MIN_PAYOUT_AMOUNT}.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payout Method</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPayoutUsingAccount(true)}
                  disabled={cryptoSettlements.length === 0}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${cryptoSettlements.length === 0
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : payoutUsingAccount
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Saved Account
                </button>
                <button
                  onClick={() => setPayoutUsingAccount(false)}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${!payoutUsingAccount
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
                <label className="block text-xs font-medium text-gray-700 mb-2">Select Settlement Account</label>
                {cryptoSettlements.length === 0 ? (
                  <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                    No saved settlement accounts. Go to <span className="font-semibold">Settlements</span> to add one first.
                  </div>
                ) : (
                  <select
                    value={payoutData.cryptoSettlementAccountId}
                    onChange={(e) => setPayoutData({ ...payoutData, cryptoSettlementAccountId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select an account...</option>
                    {cryptoSettlements.map((settlement) => (
                      <option key={settlement.id} value={settlement.id}>
                        {settlement.alias} • {truncateAddress(settlement.walletAddress)} ({settlement.network})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {!payoutUsingAccount && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Wallet Address</label>
                  <input
                    type="text"
                    value={payoutData.walletAddress}
                    onChange={(e) => setPayoutData({ ...payoutData, walletAddress: e.target.value })}
                    placeholder="Enter wallet address"
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
              <p className="mt-1 text-[11px] text-gray-500">Payout limits: ${MIN_PAYOUT_AMOUNT} - ${MAX_PAYOUT_AMOUNT}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutData({ ...payoutData, amount: (Math.ceil(totalPayoutableBalance * 0.25 * 100) / 100).toString() })}
                  className="flex-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutData({ ...payoutData, amount: (Math.ceil(totalPayoutableBalance * 0.5 * 100) / 100).toString() })}
                  className="flex-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutData({ ...payoutData, amount: (Math.ceil(totalPayoutableBalance * 100) / 100).toString() })}
                  className="flex-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  100%
                </button>
              </div>
              {payoutData.amount && parseFloat(payoutData.amount) > totalPayoutableBalance && (
                <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-2">
                  <p className="text-xs text-red-700">✗ Insufficient balance. Available: {totalPayoutableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC</p>
                </div>
              )}
              {payoutData.amount && parseFloat(payoutData.amount) < MIN_PAYOUT_AMOUNT && (
                <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-2">
                  <p className="text-xs text-yellow-700">✗ Amount is below the withdrawal minimum of ${MIN_PAYOUT_AMOUNT}.</p>
                </div>
              )}
              {payoutData.amount && parseFloat(payoutData.amount) > MAX_PAYOUT_AMOUNT && (
                <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-2">
                  <p className="text-xs text-yellow-700">✗ Amount exceeds the maximum payout of ${MAX_PAYOUT_AMOUNT}.</p>
                </div>
              )}
            </div>

            {mode === "live" && (
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
            )}

            <div className="flex gap-2">
              <button
                onClick={handleInitiatePayout}
                disabled={
                  isInitiatingPayout ||
                  (mode === "live" && !payoutData.twoFAKey) ||
                  payoutData.amount.trim() === "" ||
                  (
                    !payoutUsingAccount && !payoutData.walletAddress
                  ) ||
                  (
                    !!payoutData.amount &&
                    parseFloat(payoutData.amount) > totalPayoutableBalance
                  ) ||
                  (
                    !!payoutData.amount &&
                    (parseFloat(payoutData.amount) < MIN_PAYOUT_AMOUNT || parseFloat(payoutData.amount) > MAX_PAYOUT_AMOUNT)
                  )
                }
                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isInitiatingPayout ? "Processing..." : "Initiate Payout"}
              </button>
              <button
                onClick={() => {
                  setPayoutModalOpen(false);
                  setPayoutData({
                    amount: "",
                    walletAddress: "",
                    alias: "",
                    save: false,
                    twoFAKey: "",
                    cryptoSettlementAccountId: "",
                  });
                  setPayoutUsingAccount(true);
                  setPayoutType("crypto");
                }}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Result Modal */}
      <Modal isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)} title={resultData.title} size="default">
        <div className="space-y-4">
          <div
            className={`rounded-lg p-4 ${resultData.type === "success"
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
