import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import FilterBar from "./shared/FilterBar";
import Pagination from "./shared/Pagination";
import Modal from "./shared/Modal";
import ErrorState from "./shared/ErrorState";
import { useCustomers, useCustomer } from "./hooks/useCustomers";
const Customers = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // API hooks
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
  } = useCustomers({
    page: currentPage,
    limit: itemsPerPage,
    search: searchValue || undefined,
    status: selectedFilter === "all" ? undefined : selectedFilter,
  });

  const { data: customerDetail } = useCustomer(selectedCustomerId || "");

  const filterOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "Suspended", value: "Suspended" },
  ];

  const customers = customersData?.data || [];
  const pagination = customersData?.pagination;

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-xs mt-0.5">Manage and view customer information</p>
      </div>

      <div className="p-4">
        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Search customers by name, email or ID..."
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

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
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Txns</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Total Spent</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Status</th>
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
                          <div className="font-medium text-xs text-gray-900">{customer.name}</div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{customer.email}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-900 font-medium">{customer.totalTransactions || 0}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-900 font-medium">${customer.totalSpent?.toLocaleString() || 0}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                              customer.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : customer.status === "Suspended"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{customer.joinedDate || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            )}
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
                {customerDetail.name?.charAt(0) || 'C'}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{customerDetail.name}</h3>
                <p className="text-xs text-gray-500">{customerDetail.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Customer ID</p>
                <p className="font-medium text-xs text-gray-900">{customerDetail.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    customerDetail.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : customerDetail.status === "Suspended"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {customerDetail.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Total Transactions</p>
                <p className="font-medium text-xs text-gray-900">{customerDetail.totalTransactions || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Total Spent</p>
                <p className="font-medium text-xs text-gray-900">${customerDetail.totalSpent?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-[11px] text-gray-500">Joined Date</p>
                <p className="font-medium text-xs text-gray-900">{customerDetail.joinedDate || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default Customers;
