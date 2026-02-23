import { useState, useCallback, useEffect } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import CustomerFilters from "./filters/CustomerFilters";
import Modal from "./shared/Modal";
import ErrorState from "./shared/ErrorState";
import { useCustomers, useCustomer, type Customer } from "./hooks/useCustomers";
import { useCustomerFilters, buildCustomerParams } from "../store/customerFilters";
import { useActiveMode } from "../store/mode";

const Customers = () => {
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchId, setSearchId] = useState("");
  const { mode } = useActiveMode();

  // Filter store
  const filters = useCustomerFilters();
  const [appliedParams, setAppliedParams] = useState(() => buildCustomerParams(filters, mode as "test" | "live"));

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
    const params = buildCustomerParams(filters, mode as "test" | "live");
    setAppliedParams(params);
    setCursorHistory([]);
    setCurrentPage(1);
  }, [filters, mode]);

  // API hooks
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
    isFetching,
  } = useCustomers(appliedParams);

  // Handle next page
  const handleNextPage = useCallback(() => {
    if (customersData?.hasNextPage && customersData.nextCursor) {
      setCursorHistory((prev) => [...prev, appliedParams.cursor || ""]);
      setAppliedParams((prev) => ({ ...prev, cursor: customersData.nextCursor }));
      setCurrentPage((prev) => prev + 1);
    }
  }, [customersData, appliedParams.cursor]);

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
            <h1 className="text-lg font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500 text-xs mt-0.5">Manage and view customer information</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{totalCount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Customers</p>
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
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Mode</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Total Spent</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map((customer) => (
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
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {customer.mode?.length > 0 ? customer.mode.map((m) => (
                              <span key={m} className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getModeColor(m)}`}>
                                {m}
                              </span>
                            )) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-900 font-medium">
                          ${Number(customer.totalSpent || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString()
                            : "N/A"}
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

      {/* Customer Detail Modal - uses already fetched data from list or search */}
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
                <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Customer ID</p>
                <p className="font-medium text-xs text-gray-900 break-all">{selectedCustomer.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Mode</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCustomer.mode?.length > 0 ? selectedCustomer.mode.map((m) => (
                    <span key={m} className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getModeColor(m)}`}>
                      {m}
                    </span>
                  )) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Total Spent</p>
                <p className="font-semibold text-sm text-gray-900">
                  ${Number(selectedCustomer.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Joined Date</p>
                <p className="font-medium text-xs text-gray-900">
                  {selectedCustomer.createdAt
                    ? new Date(selectedCustomer.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default Customers;
