import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import FilterBar from "./shared/FilterBar";
import Pagination from "./shared/Pagination";
import Modal from "./shared/Modal";
import { TableRowSkeleton } from "./shared/Skeletons";
import ErrorState, { EmptyState } from "./shared/ErrorState";
import { useCustomers, useCustomer, type Customer } from "./hooks/useCustomers";
import { FiUsers } from "react-icons/fi";

// Mock customer data
const mockCustomers = [
  { id: "CUS-001", name: "John Doe", email: "john@example.com", walletAddress: "0x1234...5678", totalTransactions: 45, totalSpent: 2340.50, status: "Active", joinedDate: "2025-08-15" },
  { id: "CUS-002", name: "Jane Smith", email: "jane@example.com", walletAddress: "0x2345...6789", totalTransactions: 32, totalSpent: 1890.75, status: "Active", joinedDate: "2025-09-22" },
  { id: "CUS-003", name: "Michael Brown", email: "michael@example.com", walletAddress: "0x3456...7890", totalTransactions: 18, totalSpent: 956.25, status: "Inactive", joinedDate: "2025-07-10" },
  { id: "CUS-004", name: "Sarah Wilson", email: "sarah@example.com", walletAddress: "0x4567...8901", totalTransactions: 67, totalSpent: 4521.00, status: "Active", joinedDate: "2025-06-05" },
  { id: "CUS-005", name: "David Lee", email: "david@example.com", walletAddress: "0x5678...9012", totalTransactions: 23, totalSpent: 1245.80, status: "Active", joinedDate: "2025-10-18" },
  { id: "CUS-006", name: "Emily Chen", email: "emily@example.com", walletAddress: "0x6789...0123", totalTransactions: 89, totalSpent: 6780.45, status: "Active", joinedDate: "2025-05-20" },
  { id: "CUS-007", name: "Robert Garcia", email: "robert@example.com", walletAddress: "0x7890...1234", totalTransactions: 12, totalSpent: 567.90, status: "Inactive", joinedDate: "2025-11-02" },
  { id: "CUS-008", name: "Lisa Martinez", email: "lisa@example.com", walletAddress: "0x8901...2345", totalTransactions: 56, totalSpent: 3456.75, status: "Active", joinedDate: "2025-04-28" },
];

interface Customer {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  totalTransactions: number;
  totalSpent: number;
  status: string;
  joinedDate: string;
}

const Customers = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const itemsPerPage = 6;

  const filterOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  // Filter customers
  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      customer.status.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Paginate
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Wallet</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Txns</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Total Spent</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="px-4 py-2.5">
                      <div>
                        <div className="font-medium text-xs text-gray-900">{customer.name}</div>
                        <div className="text-[11px] text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 font-mono">{customer.walletAddress}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-900 font-medium">{customer.totalTransactions}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-900 font-medium">${customer.totalSpent.toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                          customer.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{customer.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedCustomers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No customers found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Customer ID</p>
                <p className="font-medium text-xs text-gray-900">{selectedCustomer.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    selectedCustomer.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {selectedCustomer.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Wallet Address</p>
                <p className="font-mono text-xs text-gray-900">{selectedCustomer.walletAddress}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Joined Date</p>
                <p className="font-medium text-xs text-gray-900">{selectedCustomer.joinedDate}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Total Transactions</p>
                <p className="font-medium text-xs text-gray-900">{selectedCustomer.totalTransactions}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Total Spent</p>
                <p className="font-medium text-xs text-gray-900">${selectedCustomer.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default Customers;
