import { useState, useCallback } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import FilterBar from "./shared/FilterBar";
import Modal from "./shared/Modal";
import ErrorState from "./shared/ErrorState";
import { useCustomers, useCustomer } from "./hooks/useCustomers";
import { useActiveMode } from "../store/mode";

const Customers = () => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { mode } = useActiveMode();

  // Debounce search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    // Reset pagination when search changes
    setCursor(undefined);
    setCursorHistory([]);
    setCurrentPage(1);
    
    // Debounce the actual search
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // API hooks with cursor
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
    isFetching,
  } = useCustomers({
    mode,
    limit: itemsPerPage,
    cursor,
  });

  // Search for a specific customer by ID using useCustomer
  const { 
    data: searchedCustomer, 
    isLoading: searchLoading,
    error: searchError,
  } = useCustomer(debouncedSearch, !!debouncedSearch);

  const { data: customerDetail } = useCustomer(selectedCustomerId || "", !!selectedCustomerId && selectedCustomerId !== debouncedSearch);

  // Handle next page
  const handleNextPage = useCallback(() => {
    if (customersData?.hasNextPage && customersData.nextCursor) {
      setCursorHistory((prev) => [...prev, cursor || ""]);
      setCursor(customersData.nextCursor);
      setCurrentPage((prev) => prev + 1);
    }
  }, [customersData, cursor]);

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

  const filterOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "Suspended", value: "Suspended" },
  ];

  // API shape correction - show searched customer or paginated list
  const customers = debouncedSearch && searchedCustomer 
    ? [searchedCustomer] 
    : (customersData?.customers || []);
  const totalCount = debouncedSearch && searchedCustomer 
    ? 1 
    : (customersData?.count || 0);
  const hasNextPage = debouncedSearch ? false : (customersData?.hasNextPage || false);
  const hasPreviousPage = debouncedSearch ? false : (cursorHistory.length > 0);
  const isLoading = debouncedSearch ? searchLoading : customersLoading;
  const hasError = debouncedSearch ? searchError : customersError;

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500 text-xs mt-0.5">Manage and view customer information</p>
          </div>
          {/* Show count */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{totalCount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Customers</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Search customer by ID..."
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {/* Items per page selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              disabled={!!debouncedSearch}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs text-gray-500">per page</span>
          </div>
          
          {/* Search indicator */}
          {debouncedSearch && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Searching for: <span className="font-medium text-gray-700">"{debouncedSearch}"</span>
              </span>
              <button
                onClick={() => {
                  setSearchValue("");
                  setDebouncedSearch("");
                  setCursor(undefined);
                  setCursorHistory([]);
                  setCurrentPage(1);
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : hasError ? (
          <ErrorState message={debouncedSearch ? "Customer not found" : "Failed to load customers"} type="error" />
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
                        onClick={() => setSelectedCustomerId(customer.id)}
                      >
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-xs text-gray-900">
                            {customer.firstname} {customer.lastname}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{customer.email}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-900 font-medium">
                          {customer.mode?.join(", ") || "N/A"}
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

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!customerDetail}
        onClose={() => setSelectedCustomerId(null)}
        title="Customer Details"
      >
        {customerDetail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {customerDetail.firstname?.charAt(0) || "C"}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {customerDetail.firstname} {customerDetail.lastname}
                </h3>
                <p className="text-xs text-gray-500">{customerDetail.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Customer ID</p>
                <p className="font-medium text-xs text-gray-900">{customerDetail.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Mode</p>
                <p className="font-medium text-xs text-gray-900">
                  {customerDetail.mode?.join(", ") || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Total Spent</p>
                <p className="font-medium text-xs text-gray-900">
                  ${Number(customerDetail.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-[11px] text-gray-500">Joined Date</p>
                <p className="font-medium text-xs text-gray-900">
                  {customerDetail.createdAt
                    ? new Date(customerDetail.createdAt).toLocaleDateString()
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
