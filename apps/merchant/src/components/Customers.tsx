import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { FiTrash2, FiPlus, FiArrowRight } from "react-icons/fi";
import type { Customer } from "@orafi/customers";
import DashboardWrapper from "./DashboardWrapper";
import CustomerFilters from "./CustomerFilters";
import Modal from "./transactions/Modal";
import CopyButton from "./transactions/CopyButton";
import ErrorState from "./transactions/ErrorState";
import { useCustomers, useCustomer, useDeleteCustomer, useCreateCustomer } from "../hooks/mutations/useCustomers";
import { useCustomerFilters, buildCustomerParams } from "../store/customerFilters";
import { useActiveTabStore } from "../store/activeTab";
import { tokenStore } from "../store/client";
import { isBrowser, parseNumberParam, updateQueryParams } from "../lib/queryState";
import { useCustomerSubscriptions } from "../hooks/mutations/useSubscriptions";

const CUSTOMER_QUERY_KEYS = ["amountSpent", "limit", "cursor", "page"];

const Customers = () => {
  const [, setLocation] = useLocation();
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchId, setSearchId] = useState("");
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  // Create customer modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({ firstname: "", lastname: "", email: "" });
  
  const { setActiveTab } = useActiveTabStore();
  const { profile } = tokenStore();
  const mode = profile?.businessProfile?.isLive ? "live" : "test";

  // Filter store
  const filters = useCustomerFilters();
  const setFromQueryParams = useCustomerFilters((state) => state.setFromQueryParams);
  const getQueryParams = useCustomerFilters((state) => state.getQueryParams);
  const [appliedParams, setAppliedParams] = useState(() => buildCustomerParams(filters, mode));


  // Search by customer ID or email
  const { data: searchedCustomer, isFetching: searchFetching } = useCustomer(searchId, !!searchId);

  // Handle search input
  const handleSearch = useCallback((query: string) => {
    setSearchId(query);
  }, []);

  // Open modal when search finds a customer
  useEffect(() => {
    if (searchedCustomer && searchId) {
      setSelectedCustomer(searchedCustomer || null);
      setSearchId("");
    }
  }, [searchedCustomer, searchId]);

  // Apply filters handler
  const handleApplyFilters = useCallback(() => {
    const params = buildCustomerParams(filters, mode);
    setAppliedParams(params);
    setCursorHistory([]);
    setCurrentPage(1);

    updateQueryParams(
      {
        ...getQueryParams(),
        page: null,
      },
      { managedKeys: CUSTOMER_QUERY_KEYS, replace: false }
    );
  }, [filters, mode, getQueryParams]);

  // Set active tab
  useEffect(() => {
    setActiveTab("Customers");
  }, [setActiveTab]);

  // Initialize from URL on load
  useEffect(() => {
    if (!isBrowser) return;
    const params = new URLSearchParams(window.location.search);
    setFromQueryParams(params);
    setCurrentPage(parseNumberParam(params.get("page"), 1));
    setAppliedParams(buildCustomerParams(useCustomerFilters.getState(), mode));
  }, [setFromQueryParams, mode]);

  // Sync when navigating with browser history
  useEffect(() => {
    if (!isBrowser) return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFromQueryParams(params);
      setCurrentPage(parseNumberParam(params.get("page"), 1));
      setAppliedParams(buildCustomerParams(useCustomerFilters.getState(), mode));
      setCursorHistory([]);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setFromQueryParams, mode]);

  // API hooks
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
    isFetching,
  } = useCustomers(appliedParams);
  
  const { mutate: deleteCustomer, isPending: isDeletingCustomer } = useDeleteCustomer();
  const { mutate: createCustomer, isPending: isCreatingCustomer } = useCreateCustomer();
  const { data: selectedCustomerSubscriptions = [], isLoading: isLoadingCustomerSubscriptions } = useCustomerSubscriptions(
    selectedCustomer?.id || "",
    Boolean(selectedCustomer)
  );

  // Handle next page
  const handleNextPage = useCallback(() => {
    if (customersData?.hasNextPage && customersData.nextCursor) {
      const nextPage = currentPage + 1;
      setCursorHistory((prev) => [...prev, appliedParams.cursor || ""]);
      setAppliedParams((prev: any) => ({ ...prev, cursor: customersData.nextCursor }));
      setCurrentPage(nextPage);
      updateQueryParams(
        {
          ...getQueryParams(),
          page: String(nextPage),
          cursor: customersData.nextCursor,
        },
        { managedKeys: CUSTOMER_QUERY_KEYS, replace: false }
      );
    }
  }, [customersData, appliedParams.cursor, currentPage, getQueryParams]);

  // Handle previous page
  const handlePreviousPage = useCallback(() => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();
      const nextPage = Math.max(1, currentPage - 1);
      const pageParam = nextPage === 1 ? null : String(nextPage);
      setCursorHistory(newHistory);
      setAppliedParams((prev: any) => ({ ...prev, cursor: previousCursor || undefined }));
      setCurrentPage(nextPage);
      updateQueryParams(
        {
          ...getQueryParams(),
          page: pageParam,
          cursor: previousCursor || null,
        },
        { managedKeys: CUSTOMER_QUERY_KEYS, replace: false }
      );
    }
  }, [cursorHistory, currentPage, getQueryParams]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newLimit: number) => {
    filters.setLimit(newLimit);
    setAppliedParams((prev: any) => ({ ...prev, limit: newLimit, cursor: undefined }));
    setCursorHistory([]);
    setCurrentPage(1);
    updateQueryParams(
      {
        ...getQueryParams(),
        limit: newLimit === 10 ? null : String(newLimit),
        page: null,
        cursor: null,
      },
      { managedKeys: CUSTOMER_QUERY_KEYS, replace: false }
    );
  }, [filters]);

  // Handle delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setCustomerToDelete(null);
        },
      });
    }
  };

  // Handle create customer
  const handleCreateCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!createFormData.firstname.trim() || !createFormData.lastname.trim() || !createFormData.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    createCustomer(createFormData, {
      onSuccess: () => {
        setCreateFormData({ firstname: "", lastname: "", email: "" });
        setShowCreateModal(false);
      },
    });
  };

  const customers = customersData?.customers || [];
  const totalCount = customersData?.count || 0;
  const hasNextPage = customersData?.hasNextPage || false;
  const hasPreviousPage = cursorHistory.length > 0;

  // Mode badge color helper
  const getModeColor = (m: string) => {
    switch (m) {
      case "live":
        return "bg-green-100 text-green-700";
      case "test":
        return "bg-yellow-100 text-yellow-700";
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
            <p className="text-gray-500 text-xs mt-0.5">Total Customers: {totalCount.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus size={16} />
              Create Customer
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Filter Bar */}
        <div className="mb-4">
          <CustomerFilters onApply={handleApplyFilters} onSearch={handleSearch} searchLoading={searchFetching} />
        </div>

        {/* Items per page selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show:</span>
            <select
              value={filters.limit || 10}
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

        {customersLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : customersError ? (
          <ErrorState message="Failed to load customers" type="error" />
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          <>
            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Total Spent</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Mode</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                      <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map((customer: Customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                              {customer.firstname?.charAt(0) || "C"}
                            </div>
                            <div className="font-medium text-xs text-gray-900">
                              {customer.firstname} {customer.lastname}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{customer.email}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-900 font-medium">
                          ${Number(customer.totalSpent || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {customer.mode && customer.mode.length > 0 ? (
                              customer.mode.map((m: string) => (
                                <span
                                  key={m}
                                  className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getModeColor(m)}`}
                                >
                                  {m}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomer(customer);
                            }}
                            disabled={isDeletingCustomer}
                            className="rounded-md p-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <FiTrash2 size={16} />
                          </button>
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
                Page {currentPage} • Showing {customers.length} of {totalCount.toLocaleString()} customers
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
              
              {isFetching && !customersLoading && (
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

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Details"
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {selectedCustomer.firstname?.charAt(0) || "C"}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedCustomer.firstname} {selectedCustomer.lastname}
                </h3>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                  <CopyButton text={selectedCustomer.email} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Customer ID</p>
                <div className="flex items-center gap-1">
                  <p className="font-medium text-xs text-gray-900 break-all">{selectedCustomer.id}</p>
                  <CopyButton text={selectedCustomer.id} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Total Spent</p>
                <p className="font-semibold text-sm text-gray-900">
                  ${Number(selectedCustomer.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Mode</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCustomer.mode && selectedCustomer.mode.length > 0 ? (
                    selectedCustomer.mode.map((m: string) => (
                      <span key={m} className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getModeColor(m)}`}>
                        {m}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-[11px] text-gray-500">Joined Date</p>
                <p className="font-medium text-xs text-gray-900">
                  {selectedCustomer.createdAt
                    ? new Date(selectedCustomer.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => {
                    setLocation(`/subscriptions?customerId=${selectedCustomer.id}`);
                    setSelectedCustomer(null);
                  }}
                  disabled={isLoadingCustomerSubscriptions}
                  className="flex-1 px-4 py-2.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiArrowRight size={16} />
                  Show Subscriptions
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700 ring-1 ring-blue-100">
                    {selectedCustomerSubscriptions.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setLocation(`/transactions?customerId=${selectedCustomer.id}`);
                    setSelectedCustomer(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                >
                  <FiArrowRight size={16} />
                  View All Transactions
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Customer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateFormData({ firstname: "", lastname: "", email: "" });
        }}
        title="Create Customer"
        size="default"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={createFormData.firstname}
              onChange={(e) => setCreateFormData({ ...createFormData, firstname: e.target.value })}
              placeholder="Enter first name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={createFormData.lastname}
              onChange={(e) => setCreateFormData({ ...createFormData, lastname: e.target.value })}
              placeholder="Enter last name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={createFormData.email}
              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              placeholder="Enter email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isCreatingCustomer}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreatingCustomer ? "Creating..." : "Create Customer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setCreateFormData({ firstname: "", lastname: "", email: "" });
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
          setCustomerToDelete(null);
        }}
        title="Delete Customer"
        size="default"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
          </div>

          {customerToDelete && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Customer Details</p>
              <p className="text-sm font-semibold text-gray-900">
                {customerToDelete.firstname} {customerToDelete.lastname}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {customerToDelete.email}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={confirmDeleteCustomer}
              disabled={isDeletingCustomer}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeletingCustomer ? "Deleting..." : "Delete Customer"}
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setCustomerToDelete(null);
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

export default Customers;