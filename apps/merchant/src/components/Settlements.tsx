import DashboardWrapper from "./DashboardWrapper";
import { useEffect, useState } from "react";
import { useActiveTabStore } from "../store/activeTab";
import { 
  useGetCryptoSettlements, 
  useAddCryptoSettlements, 
  useDeleteCryptoSettlementAccount,
  useGetALLFiatSettlements,
  useAddFiatSettlement,
  useDeleteFiatSettlementAccount,
  useUpdatePrimaryFiatSettlementAccount,
  useListFiatBanks,
  useResolveFiatAccount,
} from "../hooks/mutations/useSettlements";
import { useGetSupoortedNetworks } from "../hooks/mutations/useTransactions";
import Modal from "./transactions/Modal";
import { FiTrash2, FiCopy, FiCheck, FiStar, FiBriefcase } from "react-icons/fi";

const Settlements = () => {
  const { setActiveTab } = useActiveTabStore();
  const [activeTab, setActiveTabValue] = useState("crypto");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [settlementToDelete, setSettlementToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"crypto" | "fiat">("crypto");
  const [formData, setFormData] = useState({ walletAddress: "", network: "", alias: "" });
  
  // Fiat form data
  const [fiatFormData, setFiatFormData] = useState({ 
    bankCode: "", 
    accountNumber: "", 
    bankName: "",
    isPrimary: false,
  });

  // Fiat form UI state
  const [bankNameInput, setBankNameInput] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(null);
  const [resolutionError, setResolutionError] = useState<string | null>(null);

  // Crypto Settlements
  const { data: cryptoSettlements = [], isLoading: cryptoLoading, refetch: refetchCryptoSettlements } = useGetCryptoSettlements();
  const { mutate: addCryptoSettlement, isPending: isAddingCrypto } = useAddCryptoSettlements();
  const { mutate: deleteCryptoSettlement, isPending: isDeletingCrypto } = useDeleteCryptoSettlementAccount();
  
  // Fiat Settlements
  const { data: fiatSettlements = [], isLoading: fiatLoading, refetch: refetchFiatSettlements } = useGetALLFiatSettlements();
  const { mutate: addFiatSettlement, isPending: isAddingFiat } = useAddFiatSettlement();
  const { mutate: deleteFiatSettlement, isPending: isDeletingFiat } = useDeleteFiatSettlementAccount();
  const { mutate: updatePrimaryFiatSettlement, isPending: isUpdatingPrimary } = useUpdatePrimaryFiatSettlementAccount();
  
  // Bank list and account resolution
  const { data: banksList = [], isLoading: banksLoading } = useListFiatBanks();
  const { data: resolvedAccount, isFetching: isRefetchingResolve } = useResolveFiatAccount(
    fiatFormData.bankCode && fiatFormData.accountNumber.length === 10
      ? { accountNumber: fiatFormData.accountNumber, bankCode: fiatFormData.bankCode }
      : null
  );
  
  const { data: supportedNetworks = [] } = useGetSupoortedNetworks();

  useEffect(() => {
    setActiveTab("Settlements");
  }, [setActiveTab]);

  const handleAddCryptoSettlement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.walletAddress.trim() || !formData.alias.trim() || !formData.network) {
      return;
    }
    addCryptoSettlement(formData, {
      onSuccess: () => {
        setFormData({ walletAddress: "", network: "", alias: "" });
        setShowAddModal(false);
        refetchCryptoSettlements();
      },
    });
  };

  const handleDeleteCryptoSettlement = (id: string) => {
    setSettlementToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteCryptoSettlement = () => {
    if (settlementToDelete) {
      deleteCryptoSettlement(settlementToDelete, {
        onSuccess: () => {
          refetchCryptoSettlements();
          setShowDeleteModal(false);
          setSettlementToDelete(null);
        },
      });
    }
  };  

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(address);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getNetworkBySymbol = (symbol: string) => {
    return supportedNetworks.find((net: any) => net.symbol === symbol);
  };

  // Fiat Settlement Handlers
  const handleAddFiatSettlement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fiatFormData.bankCode.trim() || !fiatFormData.accountNumber.trim() || !resolvedAccountName) {
      return;
    }
    addFiatSettlement(fiatFormData, {
      onSuccess: () => {
        setFiatFormData({ bankCode: "", accountNumber: "", bankName: "", isPrimary: false });
        setBankNameInput("");
        setResolvedAccountName(null);
        setResolutionError(null);
        setShowBankDropdown(false);
        setShowAddModal(false);
        refetchFiatSettlements();
      },
    });
  };

  const handleBankNameChange = (value: string) => {
    setBankNameInput(value);
    setShowBankDropdown(true);
  };

  const handleBankSelect = (bank: { name: string; bankCode: string }) => {
    setBankNameInput(bank.name);
    setFiatFormData((prev) => ({
      ...prev,
      bankCode: bank.bankCode,
      bankName: bank.name,
    }));
    setShowBankDropdown(false);
  };

  const handleAccountNumberChange = (value: string) => {
    setFiatFormData((prev) => ({
      ...prev,
      accountNumber: value,
    }));
  };

  // Auto-resolve account when both bank and 10-digit account number are entered
  useEffect(() => {
    if (fiatFormData.bankCode && fiatFormData.accountNumber.length === 10 && resolvedAccount?.accountName) {
      setResolvedAccountName(resolvedAccount.accountName);
      setResolutionError(null);
    }
  }, [resolvedAccount, fiatFormData.bankCode, fiatFormData.accountNumber]);

  // Handle resolution errors
  useEffect(() => {
    if (fiatFormData.bankCode && fiatFormData.accountNumber.length === 10 && isRefetchingResolve === false && !resolvedAccount?.accountName) {
      setResolutionError("Unable to resolve account. Please check the details.");
    }
  }, [isRefetchingResolve, resolvedAccount, fiatFormData.bankCode, fiatFormData.accountNumber]);

  // Filter banks based on input
  const filteredBanks = (Array.isArray(banksList) ? banksList : []).filter((bank: any) =>
    bank.name.toLowerCase().includes(bankNameInput.toLowerCase())
  );

  const handleDeleteFiatSettlement = (id: string) => {
    setSettlementToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteFiatSettlement = () => {
    if (settlementToDelete) {
      deleteFiatSettlement(settlementToDelete, {
        onSuccess: () => {
          refetchFiatSettlements();
          setShowDeleteModal(false);
          setSettlementToDelete(null);
        },
      });
    }
  };

  const handleSetPrimaryFiatSettlement = (id: string) => {
    updatePrimaryFiatSettlement(id, {
      onSuccess: () => {
        refetchFiatSettlements();
      },
    });
  };


  const tabs = [
    { id: "crypto", label: "Crypto Settlements" },
    { id: "fiat", label: "Fiat Settlements" },
  ];

  return (
    <DashboardWrapper>
      <div className="space-y-6 bg-gray-50 p-4 sm:p-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabValue(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
                activeTab === tab.id
                  ? "border-blue-950 text-blue-950"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* CRYPTO SETTLEMENTS TAB */}
          {activeTab === "crypto" && (
            <>
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Crypto Settlements</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your crypto wallet addresses for payouts.</p>
                  </div>
                  <button
                    onClick={() => {
                      setModalType("crypto");
                      setShowAddModal(true);
                    }}
                    className="rounded-md bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors"
                  >
                    + Add Account
                  </button>
                </div>
              </section>

              {/* Crypto Settlements List */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900">Saved Accounts</h2>
                <p className="mt-1 text-sm text-gray-500">Your registered crypto settlement accounts.</p>

                {cryptoLoading ? (
                  <div className="mt-6 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
                    ))}
                  </div>
                ) : cryptoSettlements.length === 0 ? (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">No settlement accounts configured yet.</p>
                    <p className="mt-1 text-xs text-gray-400">Add your first crypto wallet above to get started.</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {cryptoSettlements.map((settlement) => (
                      <div
                        key={settlement.id}
                        className="flex items-start justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{settlement.alias}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <p className="break-all text-xs text-gray-600 max-w-xs">{settlement.walletAddress}</p>
                            <button
                              onClick={() => handleCopyAddress(settlement.walletAddress)}
                              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {copiedId === settlement.walletAddress ? (
                                <FiCheck size={14} className="text-green-600" />
                              ) : (
                                <FiCopy size={14} />
                              )}
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {getNetworkBySymbol(settlement.network)?.logoUrl && (
                              <img
                                src={getNetworkBySymbol(settlement.network)?.logoUrl}
                                alt={settlement.network}
                                className="w-4 h-4 rounded-full"
                              />
                            )}
                            <p className="text-xs text-gray-500">{settlement.network}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCryptoSettlement(settlement.id)}
                          disabled={isDeletingCrypto}
                          className="flex-shrink-0 rounded-md p-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* FIAT SETTLEMENTS TAB */}
          {activeTab === "fiat" && (
            <>
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Fiat Settlements</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your bank accounts for fiat payouts.</p>
                  </div>
                  <button
                    onClick={() => {
                      setModalType("fiat");
                      setShowAddModal(true);
                    }}
                    className="rounded-md bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors"
                  >
                    + Add Account
                  </button>
                </div>
              </section>

              {/* Fiat Settlements List */}
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900">Saved Accounts</h2>
                <p className="mt-1 text-sm text-gray-500">Your registered bank accounts for fiat payouts.</p>

                {fiatLoading ? (
                  <div className="mt-6 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
                    ))}
                  </div>
                ) : fiatSettlements.length === 0 ? (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">No bank accounts configured yet.</p>
                    <p className="mt-1 text-xs text-gray-400">Add your first bank account above to get started.</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {fiatSettlements.map((settlement) => (
                      <div
                        key={settlement.id}
                        className={`flex items-start justify-between gap-4 rounded-lg border p-4 ${
                          settlement.isPrimary
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{settlement.bankName}</p>
                            {settlement.isPrimary && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                <FiStar size={12} />
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-600">Bank Code: <span className="font-semibold">{settlement.bankCode}</span></p>
                          <div className="mt-2 flex items-center gap-2">
                            <p className="break-all text-xs text-gray-600 max-w-xs">{settlement.accountNumber}</p>
                            <button
                              onClick={() => handleCopyAddress(settlement.accountNumber)}
                              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {copiedId === settlement.accountNumber ? (
                                <FiCheck size={14} className="text-green-600" />
                              ) : (
                                <FiCopy size={14} />
                              )}
                            </button>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">Account Name: {settlement.accountName}</p>
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
                          {!settlement.isPrimary && (
                            <button
                              onClick={() => handleSetPrimaryFiatSettlement(settlement.id)}
                              disabled={isUpdatingPrimary}
                              className="flex-shrink-0 rounded-md p-2 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                              title="Set as primary"
                            >
                              <FiStar size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFiatSettlement(settlement.id)}
                            disabled={isDeletingFiat}
                            className="flex-shrink-0 rounded-md p-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* Add Settlement Account Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ walletAddress: "", network: "", alias: "" });
          setFiatFormData({ bankCode: "", accountNumber: "", bankName: "", isPrimary: false });
          setBankNameInput("");
          setResolvedAccountName(null);
          setResolutionError(null);
          setShowBankDropdown(false);
          setModalType("crypto");
        }}
        title={`Add ${modalType === "crypto" ? "Crypto" : "Fiat"} Settlement Account`}
        size="default"
      >
        {modalType === "crypto" ? (
          <form onSubmit={handleAddCryptoSettlement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                placeholder="Enter wallet address"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
              {supportedNetworks.length === 0 ? (
                <div className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500">
                  Loading networks...
                </div>
              ) : (
                <select
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a network...</option>
                  {supportedNetworks.map((network: any) => (
                    <option key={network.code} value={network.symbol}>
                      {network.name} ({network.symbol})
                    </option>
                  ))}
                </select>
              )}
              {formData.network && getNetworkBySymbol(formData.network) && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-gray-50 p-2">
                  {getNetworkBySymbol(formData.network)?.logoUrl && (
                    <img
                      src={getNetworkBySymbol(formData.network)?.logoUrl}
                      alt={formData.network}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span className="text-xs font-medium text-gray-700">{getNetworkBySymbol(formData.network)?.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Alias</label>
              <input
                type="text"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                placeholder="e.g., My Main Wallet"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isAddingCrypto || !formData.walletAddress.trim() || !formData.alias.trim() || !formData.network}
                className="flex-1 rounded-md bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingCrypto ? "Adding..." : "Add Settlement Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ walletAddress: "", network: "", alias: "" });
                }}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddFiatSettlement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={bankNameInput}
                  onChange={(e) => handleBankNameChange(e.target.value)}
                  onFocus={() => setShowBankDropdown(true)}
                  placeholder="Type bank name..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {showBankDropdown && !fiatFormData.bankCode && (Array.isArray(banksList) && banksList.length > 0 || banksLoading) && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {banksLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Loading banks...</div>
                    ) : filteredBanks.length > 0 ? (
                      filteredBanks.map((bank: any, index: number) => (
                        <button
                          key={`bank-${bank.bankCode}-${index}`}
                          type="button"
                          onClick={() => handleBankSelect(bank)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                        >
                          <FiBriefcase size={18} className="text-gray-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">{bank.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No matching banks</div>
                    )}
                  </div>
                )}


              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number (10 digits)</label>
              <input
                type="text"
                value={fiatFormData.accountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  handleAccountNumberChange(value);
                }}
                placeholder="Enter 10-digit account number"
                maxLength={10}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-500">{fiatFormData.accountNumber.length}/10 digits</span>
                {fiatFormData.accountNumber.length === 10 && !fiatFormData.bankCode && (
                  <span className="text-xs text-yellow-600">⚠ Please select a bank first</span>
                )}
              </div>
            </div>

            {isRefetchingResolve && fiatFormData.accountNumber.length === 10 && fiatFormData.bankCode && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-sm text-blue-700">🔍 Verifying account details...</p>
              </div>
            )}

            {resolvedAccountName && fiatFormData.accountNumber.length === 10 && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-xs text-green-600 mb-1">✓ Account Verified</p>
                <p className="text-sm font-semibold text-green-900">{resolvedAccountName}</p>
                <p className="text-xs text-green-700 mt-1">Account: {fiatFormData.accountNumber}</p>
              </div>
            )}

            {resolutionError && fiatFormData.accountNumber.length === 10 && fiatFormData.bankCode && !isRefetchingResolve && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">✗ {resolutionError}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="set-primary"
                checked={fiatFormData.isPrimary}
                onChange={(e) => setFiatFormData({ ...fiatFormData, isPrimary: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="set-primary" className="text-sm text-gray-600">
                Set as primary account
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isAddingFiat || !fiatFormData.bankCode || fiatFormData.accountNumber.length !== 10 || !resolvedAccountName}
                className="flex-1 rounded-md bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingFiat ? "Saving..." : "Save Settlement Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setFiatFormData({ bankCode: "", accountNumber: "", bankName: "", isPrimary: false });
                  setBankNameInput("");
                  setResolvedAccountName(null);
                  setResolutionError(null);
                }}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSettlementToDelete(null);
        }}
        title="Delete Settlement Account"
        size="default"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Are you sure you want to delete this settlement account? This action cannot be undone.
            </p>
          </div>

          {settlementToDelete && activeTab === "crypto" &&
            cryptoSettlements.find((s) => s.id === settlementToDelete) && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500 mb-1">Account Details</p>
                <p className="text-sm font-semibold text-gray-900">
                  {cryptoSettlements.find((s) => s.id === settlementToDelete)?.alias}
                </p>
                <p className="text-xs text-gray-600 mt-1 break-all">
                  {cryptoSettlements.find((s) => s.id === settlementToDelete)?.walletAddress}
                </p>
              </div>
            )}

          {settlementToDelete && activeTab === "fiat" &&
            fiatSettlements.find((s) => s.id === settlementToDelete) && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500 mb-1">Account Details</p>
                <p className="text-sm font-semibold text-gray-900">
                  {fiatSettlements.find((s) => s.id === settlementToDelete)?.bankName}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Bank Code: {fiatSettlements.find((s) => s.id === settlementToDelete)?.bankCode}
                </p>
                <p className="text-xs text-gray-600 mt-1 break-all">
                  Account: {fiatSettlements.find((s) => s.id === settlementToDelete)?.accountNumber}
                </p>
              </div>
            )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (activeTab === "crypto") {
                  confirmDeleteCryptoSettlement();
                } else {
                  confirmDeleteFiatSettlement();
                }
              }}
              disabled={isDeletingCrypto || isDeletingFiat}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeletingCrypto || isDeletingFiat ? "Deleting..." : "Delete Account"}
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSettlementToDelete(null);
              }}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </DashboardWrapper>
  );
};

export default Settlements;