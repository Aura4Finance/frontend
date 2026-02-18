import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import FilterBar from "./shared/FilterBar";
import Pagination from "./shared/Pagination";
import Modal from "./shared/Modal";
import ErrorState from "./shared/ErrorState";
import { useCustomers, useCustomer } from "./hooks/useCustomers";
import { useActiveMode } from "../store/mode";

const Customers = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const itemsPerPage = 10;

    const { mode } = useActiveMode();

  // API hooks (fixed params)
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
  } = useCustomers({
    mode,
    limit: itemsPerPage,
  });

  const { data: customerDetail } = useCustomer(selectedCustomerId || "", !!selectedCustomerId);

  const filterOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "Suspended", value: "Suspended" },
  ];

  // API shape correction
  const customers = customersData?.customers || [];

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-xs mt-0.5">Manage and view customer information</p>
      </div>

      <div className="p-4">
        {/* Filter Bar (UI kept but not wired to API because backend doesn't support it yet) */}
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

            {/* Pagination (derived from count) */}
            {customersData?.hasNextPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(customersData.count / itemsPerPage)}
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
