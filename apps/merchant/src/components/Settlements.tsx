import DashboardWrapper from "./DashboardWrapper";
import { useEffect, useState } from "react";
import { useActiveTabStore } from "../store/activeTab";
import { useGetCryptoSettlements, useAddCryptoSettlements, useDeleteCryptoSettlementAccount } from "../hooks/mutations/useSettlements";
import { useGetSupoortedNetworks } from "../hooks/mutations/useTransactions";
import Modal from "./transactions/Modal";
import { FiTrash2, FiCopy, FiCheck } from "react-icons/fi";

const Settlements = () => {
  const { setActiveTab } = useActiveTabStore();
  const [activeTab, setActiveTabValue] = useState("crypto");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [settlementToDelete, setSettlementToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ walletAddress: "", network: "", alias: "" });

  // Crypto Settlements
  const { data: cryptoSettlements = [], isLoading: cryptoLoading, refetch: refetchCryptoSettlements } = useGetCryptoSettlements();
  const { mutate: addCryptoSettlement, isPending: isAddingCrypto } = useAddCryptoSettlements();
  const { mutate: deleteCryptoSettlement, isPending: isDeletingCrypto } = useDeleteCryptoSettlementAccount();
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
                    onClick={() => setShowAddModal(true)}
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
            <section className="rounded-2xl border border-gray-100 bg-white p-12 shadow-sm">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Fiat Settlements Coming Soon</h3>
                <p className="mt-2 text-sm text-gray-500">Bank account and fiat currency settlement options will be available soon.</p>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Add Settlement Account Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ walletAddress: "", network: "", alias: "" });
        }}
        title="Add Settlement Account"
        size="default"
      >
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

          {settlementToDelete &&
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

          <div className="flex gap-2">
            <button
              onClick={confirmDeleteCryptoSettlement}
              disabled={isDeletingCrypto}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeletingCrypto ? "Deleting..." : "Delete Account"}
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