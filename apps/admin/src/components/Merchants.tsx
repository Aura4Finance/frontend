import { useState } from "react";
import DashboardWrapper from "./layout/DashboardWrapper";
import KPICard from "./shared/KPICard";
import FilterBar from "./shared/FilterBar";
import Pagination from "./shared/Pagination";
import Modal from "./shared/Modal";
import { FiShoppingBag, FiCheckCircle, FiZap, FiTrendingUp } from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Mock leaderboard data
const leaderboardData = [
  { rank: 1, name: "TechStore Pro", revenue: 125000, transactions: 1245, growth: 23.5 },
  { rank: 2, name: "FashionHub", revenue: 98500, transactions: 987, growth: 18.2 },
  { rank: 3, name: "GameZone", revenue: 87200, transactions: 876, growth: 15.8 },
  { rank: 4, name: "ElectroShop", revenue: 76400, transactions: 654, growth: 12.4 },
  { rank: 5, name: "BookWorld", revenue: 54300, transactions: 543, growth: 9.1 },
];

// Mock merchants list
const mockMerchants = [
  { id: "MER-001", name: "TechStore Pro", email: "contact@techstore.com", category: "Electronics", status: "Live", onboarded: "2025-03-15", totalRevenue: 125000, totalTransactions: 1245 },
  { id: "MER-002", name: "FashionHub", email: "hello@fashionhub.com", category: "Fashion", status: "Live", onboarded: "2025-04-22", totalRevenue: 98500, totalTransactions: 987 },
  { id: "MER-003", name: "GameZone", email: "info@gamezone.com", category: "Gaming", status: "Test", onboarded: "2025-06-10", totalRevenue: 87200, totalTransactions: 876 },
  { id: "MER-004", name: "ElectroShop", email: "sales@electroshop.com", category: "Electronics", status: "Live", onboarded: "2025-02-28", totalRevenue: 76400, totalTransactions: 654 },
  { id: "MER-005", name: "BookWorld", email: "contact@bookworld.com", category: "Books", status: "Live", onboarded: "2025-05-18", totalRevenue: 54300, totalTransactions: 543 },
  { id: "MER-006", name: "FoodMart", email: "order@foodmart.com", category: "Food & Beverage", status: "Test", onboarded: "2025-07-05", totalRevenue: 32100, totalTransactions: 321 },
  { id: "MER-007", name: "SportyGear", email: "info@sportygear.com", category: "Sports", status: "Live", onboarded: "2025-01-20", totalRevenue: 67800, totalTransactions: 678 },
  { id: "MER-008", name: "HomeDecor", email: "hello@homedecor.com", category: "Home & Living", status: "Pending", onboarded: "2025-08-12", totalRevenue: 0, totalTransactions: 0 },
];

// Mock data for Live vs Test mode doughnut chart
const modeDistribution = [
  { name: "Live", value: 5, color: "#10b981" },
  { name: "Test", value: 2, color: "#f59e0b" },
  { name: "Pending", value: 1, color: "#9ca3af" },
];

// Mock data for merchant onboarding (8 days)
const onboardingData = [
  { date: "Jan 7", count: 3 },
  { date: "Jan 8", count: 5 },
  { date: "Jan 9", count: 2 },
  { date: "Jan 10", count: 7 },
  { date: "Jan 11", count: 4 },
  { date: "Jan 12", count: 6 },
  { date: "Jan 13", count: 8 },
  { date: "Today", count: 3 },
];

interface Merchant {
  id: string;
  name: string;
  email: string;
  category: string;
  status: string;
  onboarded: string;
  totalRevenue: number;
  totalTransactions: number;
}

const Merchants = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const itemsPerPage = 5;

  const filterOptions = [
    { label: "All Status", value: "all" },
    { label: "Live", value: "live" },
    { label: "Test", value: "test" },
    { label: "Pending", value: "pending" },
  ];

  const filteredMerchants = mockMerchants.filter((merchant) => {
    const matchesSearch =
      merchant.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      merchant.id.toLowerCase().includes(searchValue.toLowerCase()) ||
      merchant.category.toLowerCase().includes(searchValue.toLowerCase());
    const matchesFilter = selectedFilter === "all" || merchant.status.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);
  const paginatedMerchants = filteredMerchants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "live": return "bg-green-100 text-green-700";
      case "test": return "bg-yellow-100 text-yellow-700";
      case "pending": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const liveMerchants = mockMerchants.filter(m => m.status === "Live").length;
  const onboardedMerchants = mockMerchants.filter(m => m.status !== "Pending").length;

  return (
    <DashboardWrapper>
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Merchants</h1>
        <p className="text-gray-500 text-xs mt-0.5">Manage merchant accounts and view performance</p>
      </div>

      <div className="p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <KPICard title="Total Merchants" value={mockMerchants.length} icon={FiShoppingBag} iconColor="text-blue-600" iconBgColor="bg-blue-100" trend={{ value: 8.3, isPositive: true, label: "vs last month" }} />
          <KPICard title="Onboarded" value={onboardedMerchants} icon={FiCheckCircle} iconColor="text-green-600" iconBgColor="bg-green-100" />
          <KPICard title="Live Mode" value={liveMerchants} icon={FiZap} iconColor="text-purple-600" iconBgColor="bg-purple-100" />
          <KPICard title="Avg. Revenue" value={`$${Math.round(mockMerchants.reduce((acc, m) => acc + m.totalRevenue, 0) / mockMerchants.length / 1000)}K`} icon={FiTrendingUp} iconColor="text-orange-600" iconBgColor="bg-orange-100" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {/* Mode Distribution Doughnut Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Mode Distribution</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {modeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, "Merchants"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {modeDistribution.map((mode) => (
                <div key={mode.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mode.color }} />
                  <span className="text-xs text-gray-600">{mode.name}</span>
                  <span className="text-xs font-medium text-gray-900">{mode.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Merchant Onboarding Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Merchant Onboarding</h3>
            <p className="text-xs text-gray-500 mb-3">Last 7 days + today</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={onboardingData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [value, "Merchants"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    name="Onboarded"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">🏆 Merchant Leaderboard</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] text-gray-500">
                  <th className="pb-2 font-medium">Rank</th>
                  <th className="pb-2 font-medium">Merchant</th>
                  <th className="pb-2 font-medium">Revenue</th>
                  <th className="pb-2 font-medium">Txns</th>
                  <th className="pb-2 font-medium">Growth</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((merchant) => (
                  <tr key={merchant.rank} className="border-t border-gray-100">
                    <td className="py-2">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[10px] ${
                        merchant.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                        merchant.rank === 2 ? "bg-gray-200 text-gray-700" :
                        merchant.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                      }`}>{merchant.rank}</span>
                    </td>
                    <td className="py-2 font-medium text-xs text-gray-900">{merchant.name}</td>
                    <td className="py-2 text-xs text-gray-900">${merchant.revenue.toLocaleString()}</td>
                    <td className="py-2 text-xs text-gray-600">{merchant.transactions}</td>
                    <td className="py-2"><span className="text-green-600 font-medium text-xs">+{merchant.growth}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <FilterBar searchPlaceholder="Search by merchant name, ID or category..." searchValue={searchValue} onSearchChange={setSearchValue} filterOptions={filterOptions} selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Merchant</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Revenue</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Txns</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-600 uppercase">Onboarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedMerchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedMerchant(merchant)}>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-xs text-gray-900">{merchant.name}</div>
                      <div className="text-[11px] text-gray-500">{merchant.email}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{merchant.category}</td>
                    <td className="px-4 py-2.5"><span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(merchant.status)}`}>{merchant.status}</span></td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900">${merchant.totalRevenue.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{merchant.totalTransactions}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{merchant.onboarded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>

      <Modal isOpen={!!selectedMerchant} onClose={() => setSelectedMerchant(null)} title="Merchant Details">
        {selectedMerchant && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">{selectedMerchant.name.charAt(0)}</div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{selectedMerchant.name}</h3>
                <p className="text-xs text-gray-500">{selectedMerchant.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Merchant ID</p><p className="font-medium text-xs text-gray-900">{selectedMerchant.id}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Status</p><span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(selectedMerchant.status)}`}>{selectedMerchant.status}</span></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Category</p><p className="font-medium text-xs text-gray-900">{selectedMerchant.category}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Onboarded</p><p className="font-medium text-xs text-gray-900">{selectedMerchant.onboarded}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Total Revenue</p><p className="font-semibold text-sm text-gray-900">${selectedMerchant.totalRevenue.toLocaleString()}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">Total Transactions</p><p className="font-semibold text-sm text-gray-900">{selectedMerchant.totalTransactions}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default Merchants;
