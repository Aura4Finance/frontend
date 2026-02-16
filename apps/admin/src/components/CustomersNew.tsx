import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import FilterBar from "./shared/FilterBar";
import Pagination from "./shared/Pagination";
import Modal from "./shared/Modal";
import { TableRowSkeleton } from "./shared/Skeletons";
import ErrorState, { EmptyState } from "./shared/ErrorState";
import { useCustomers, useCustomer, useUpdateCustomerStatus, useCustomerTransactions, type Customer } from "./hooks/useCustomers";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";

const CustomersNew = () => {
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
    refetch: refetchCustomers,
  } = useCustomers({
    page: currentPage,
    limit: itemsPerPage,
    search: searchValue || undefined,
    status: selectedFilter === "all" ? undefined : selectedFilter,
  });

  const { data: customerDetailData, isLoading: customerDetailLoading } = useCustomer(
    selectedCustomerId || ""
  );

  const { data: customerTransactionsData, isLoading: transactionsLoading } = useCustomerTransactions(
    selectedCustomerId || "",
    { page: 1, limit: 5 }
  );

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateCustomerStatus();

  const filterOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "Suspended", value: "Suspended" },
  ];

  const customers = customersData?.data || [];
  const pagination = customersData?.pagination;
  const customerDetail = customerDetailData;
  const customerTransactions = customerTransactionsData?.data || [];

  const handleStatusChange = (customerId: string, newStatus: string) => {
    updateStatus(
      { customerId, status: newStatus },
      {
        onSuccess: () => {
          toast.success("Customer status updated successfully");
          setSelectedCustomerId(null);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to update status");
        },
      }
    );
  };

  // Loading state
  if (customersLoading && currentPage === 1) {
    return (
      <DashboardWrapper>
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-xs mt-0.5">Manage and view customer information</p>
        </div>
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Txns
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
              </tbody>
            </table>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  // Error state
  if (customersError) {
    return (
      <DashboardWrapper>
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-xs mt-0.5">Manage and view customer information</p>
        </div>
        <div className="p-4">
          <ErrorState
            message={(customersError as any)?.response?.data?.message || "Failed to load customers"}
            onRetry={refetchCustomers}
          />
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Manage and view customer information ({pagination?.total || 0} total)
            </p>
          </div>
          <button
            onClick={() => refetchCustomers()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 ${customersLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
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

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {customers.length === 0 ? (
            <EmptyState
              title="No customers found"
              message={
                searchValue || selectedFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Customer data will appear here once available."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Wallet
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Txns
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer: Customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedCustomerId(customer.id)}
                    >
                      <td className="px-4 py-2.5">
                        <div>
                          <div className="font-medium text-xs text-gray-900">{customer.name}</div>
                          <div className="text-[11px] text-gray-500">{customer.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 font-mono">
                        {customer.walletAddress?.slice(0, 6)}...{customer.walletAddress?.slice(-4)}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-900 font-medium">
                        {customer.totalTransactions}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-900 font-medium">
                        ${customer.totalSpent?.toLocaleString()}
                      </td>
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
                      <td className="px-4 py-2.5 text-xs text-gray-600">
                        {new Date(customer.joinedDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        title="Customer Details"
      >
        {customerDetailLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        ) : customerDetail ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {customerDetail.name?.charAt(0) || "?"}
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
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {customerDetail.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-[11px] text-gray-500">Wallet Address</p>
                <p className="font-mono text-xs text-gray-900 break-all">
                  {customerDetail.walletAddress}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Phone Number</p>
                <p className="font-medium text-xs text-gray-900">
                  {customerDetail.phoneNumber || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Country</p>
                <p className="font-medium text-xs text-gray-900">{customerDetail.country || "N/A"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Joined Date</p>
                <p className="font-medium text-xs text-gray-900">
                  {new Date(customerDetail.joinedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Last Active</p>
                <p className="font-medium text-xs text-gray-900">
                  {customerDetail.lastActive
                    ? new Date(customerDetail.lastActive).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Total Transactions</p>
                <p className="font-medium text-xs text-gray-900">{customerDetail.totalTransactions}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Total Spent</p>
                <p className="font-medium text-xs text-gray-900">
                  ${customerDetail.totalSpent?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent Transactions</h4>
              {transactionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : customerTransactions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerTransactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-gray-900">{tx.id}</p>
                        <p className="text-[11px] text-gray-500">
                          {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-900">
                          ${tx.amount?.toLocaleString()}
                        </p>
                        <span
                          className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                            tx.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : tx.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">No transactions found</p>
              )}
            </div>

            {/* Status Update Actions */}
            {customerDetail.status !== "Suspended" && (
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleStatusChange(customerDetail.id, "Suspended")}
                  disabled={isUpdatingStatus}
                  className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isUpdatingStatus ? "Updating..." : "Suspend Customer"}
                </button>
              </div>
            )}
            {customerDetail.status === "Suspended" && (
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleStatusChange(customerDetail.id, "Active")}
                  disabled={isUpdatingStatus}
                  className="w-full px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isUpdatingStatus ? "Updating..." : "Activate Customer"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState title="Customer not found" message="Unable to load customer details" />
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default CustomersNew;
