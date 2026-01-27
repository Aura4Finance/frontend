import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import KPICard from "./shared/KPICard";
import FilterBar from "./shared/FilterBar";
import Pagination from "./shared/Pagination";
import Modal from "./shared/Modal";
import { FiActivity, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Mock transaction count data (8 days)
const transactionCountData = [
  { date: "Jan 7", all: 145, successful: 130, pending: 10, failed: 5 },
  { date: "Jan 8", all: 168, successful: 150, pending: 12, failed: 6 },
  { date: "Jan 9", all: 132, successful: 118, pending: 8, failed: 6 },
  { date: "Jan 10", all: 189, successful: 170, pending: 14, failed: 5 },
  { date: "Jan 11", all: 156, successful: 140, pending: 11, failed: 5 },
  { date: "Jan 12", all: 201, successful: 185, pending: 9, failed: 7 },
  { date: "Jan 13", all: 178, successful: 160, pending: 12, failed: 6 },
  { date: "Jan 14", all: 145, successful: 128, pending: 13, failed: 4 },
];

// Mock transaction volume data
const transactionVolumeData = [
  { date: "Jan 7", ngn: 4500000, usdc: 12500 },
  { date: "Jan 8", ngn: 5200000, usdc: 14800 },
  { date: "Jan 9", ngn: 3800000, usdc: 10200 },
  { date: "Jan 10", ngn: 6100000, usdc: 17500 },
  { date: "Jan 11", ngn: 4900000, usdc: 13800 },
  { date: "Jan 12", ngn: 7200000, usdc: 20500 },
  { date: "Jan 13", ngn: 5600000, usdc: 15900 },
  { date: "Jan 14", ngn: 4200000, usdc: 11800 },
];

// Mock transactions list
const mockTransactions = [
  { id: "TXN-001", customer: "John Doe", email: "john@example.com", amount: 250.00, token: "USDC", type: "Payment", status: "Completed", date: "2025-01-14 10:23:45", merchant: "TechStore" },
  { id: "TXN-002", customer: "Jane Smith", email: "jane@example.com", amount: 85.50, token: "USDC", type: "Payment", status: "Pending", date: "2025-01-14 09:15:32", merchant: "FashionHub" },
  { id: "TXN-003", customer: "Mike Brown", email: "mike@example.com", amount: 520.00, token: "USDT", type: "Payout", status: "Completed", date: "2025-01-14 08:45:18", merchant: "GameZone" },
  { id: "TXN-004", customer: "Sarah Wilson", email: "sarah@example.com", amount: 175.25, token: "USDC", type: "Payment", status: "Failed", date: "2025-01-14 07:30:55", merchant: "BookWorld" },
  { id: "TXN-005", customer: "David Lee", email: "david@example.com", amount: 340.00, token: "SUI", type: "Refund", status: "Completed", date: "2025-01-13 22:10:12", merchant: "ElectroShop" },
  { id: "TXN-006", customer: "Emily Chen", email: "emily@example.com", amount: 95.75, token: "USDC", type: "Payment", status: "Completed", date: "2025-01-13 20:45:33", merchant: "FoodMart" },
];

interface Transaction {
  id: string;
  customer: string;
  email: string;
  amount: number;
  token: string;
  type: string;
  status: string;
  date: string;
  merchant: string;
}

const Transactions = () => {
  const [countFilter, setCountFilter] = useState<"all" | "successful" | "pending" | "failed">("all");
  const [volumeMode, setVolumeMode] = useState<"ngn" | "usdc">("usdc");
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const itemsPerPage = 5;

  const filterOptions = [
    { label: "All Status", value: "all" },
    { label: "Completed", value: "completed" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
  ];

  // Filter transactions
  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch =
      tx.customer.toLowerCase().includes(searchValue.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchValue.toLowerCase()) ||
      tx.merchant.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      tx.status.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-xs mt-0.5">Monitor and analyze all transactions</p>
      </div>

      <div className="p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <KPICard title="Total Transactions" value="12,847" icon={FiActivity} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
          <KPICard title="Successful" value="11,563" icon={FiCheckCircle} iconColor="text-green-600" iconBgColor="bg-green-100" />
          <KPICard title="Pending" value="856" icon={FiClock} iconColor="text-yellow-600" iconBgColor="bg-yellow-100" />
          <KPICard title="Failed" value="428" icon={FiXCircle} iconColor="text-red-600" iconBgColor="bg-red-100" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          {/* Transaction Count Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Transaction Count</h3>
              <div className="flex gap-1">
                {(["all", "successful", "pending", "failed"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCountFilter(filter)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                      countFilter === filter
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactionCountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey={countFilter} stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Volume Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Transaction Volume</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setVolumeMode("usdc")}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                    volumeMode === "usdc" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  USDC
                </button>
                <button
                  onClick={() => setVolumeMode("ngn")}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                    volumeMode === "ngn" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  NGN
                </button>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    tickFormatter={(value) => volumeMode === "ngn" ? `₦${(value/1000000).toFixed(1)}M` : `$${(value/1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value: number) => [volumeMode === "ngn" ? `₦${value.toLocaleString()}` : `$${value.toLocaleString()}`, "Volume"]}
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey={volumeMode} fill="#10b981" radius={[4, 4, 0, 0]} name={volumeMode.toUpperCase()} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Search by transaction ID, customer or merchant..."
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Merchant</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedTransaction(tx)}>
                    <td className="px-4 py-2.5 text-xs font-medium text-blue-600">{tx.id}</td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-xs text-gray-900">{tx.customer}</div>
                      <div className="text-[11px] text-gray-500">{tx.email}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{tx.amount.toLocaleString()} {tx.token}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{tx.type}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{tx.merchant}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(tx.status)}`}>{tx.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>

      {/* Transaction Detail Modal */}
      <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Transaction Details">
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900">{selectedTransaction.id}</span>
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTransaction.status)}`}>{selectedTransaction.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Amount</p>
                <p className="font-semibold text-sm text-gray-900">{selectedTransaction.amount} {selectedTransaction.token}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Type</p>
                <p className="font-medium text-xs text-gray-900">{selectedTransaction.type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Customer</p>
                <p className="font-medium text-xs text-gray-900">{selectedTransaction.customer}</p>
                <p className="text-[11px] text-gray-500">{selectedTransaction.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">Merchant</p>
                <p className="font-medium text-xs text-gray-900">{selectedTransaction.merchant}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                <p className="text-[11px] text-gray-500">Date & Time</p>
                <p className="font-medium text-xs text-gray-900">{selectedTransaction.date}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default Transactions;
