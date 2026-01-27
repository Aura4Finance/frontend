import { useState } from "react";
import DashboardWrapper from "./DashboardWrapper";
import {
  Card,
  CardDescription,
  CardContent
} from "@orafi/ui";
import {
  FiCopy,
  FiMenu,
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiSend,
  FiUsers,
  FiBarChart2,
  FiLink,
  FiCreditCard,
  FiHeadphones
} from "react-icons/fi";

const Dashboard = () => {
  const network = "Testnet";
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DashboardWrapper>
      <div className="flex justify-between items-center px-6 py-4 shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-2xl text-black sm:text-xl">
            Hi, Emmanuel
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-semibold px-3 py-1.5 rounded-full text-sm cursor-default select-none bg-gray-100 text-black w-fit">
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${network == "Testnet"
              ? "bg-red-600 text-white"
              : "bg-blue-950 text-white"
              }`}
          >
            {network}
          </span>
          <span>0x32344....3456</span>
          <FiCopy className="text-blue-950 cursor-pointer" />
        </div>

        <div className="flex sm:hidden items-center gap-2 relative">
          <FiMenu
            className="text-blue-950 text-xl cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          />
          {isOpen && (
            <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-md w-48 p-3 flex flex-col gap-2 z-50">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${network === "Testnet"
                  ? "bg-blue-950 text-white"
                  : "bg-gray-200 text-gray-800"
                  }`}
              >
                {network}
              </span>
              <div className="flex items-center justify-between text-sm font-semibold text-black bg-gray-100 px-2 py-1 rounded-md">
                <span>0x32344....3456</span>
                <FiCopy className="text-blue-950 cursor-pointer" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center items-center px-4 py-4 bg-transparent w-full gap-3 sm:gap-4 md:gap-6 overflow-x-hidden">
        <Card className="bg-white w-full sm:w-[45%] lg:w-[20%] p-4 flex flex-col justify-between">
          <CardDescription className="font-semibold text-gray-600">Total Revenue</CardDescription>
          <CardContent className="flex justify-between items-center mt-2">
            <div>
              <span className="font-semibold">234 USDC</span>
              <div className="flex font-thin">
                <FiArrowDownLeft className="text-red-400" />
                <span className="text-[12px]">+12.5% vs last month</span>
              </div>
            </div>
            <FiDollarSign className="font-bold text-3xl text-blue-700 p-1.5 bg-blue-200 rounded" />
          </CardContent>
        </Card>

        <Card className="bg-white w-full sm:w-[45%] lg:w-[20%] p-4 flex flex-col justify-between">
          <CardDescription className="font-semibold text-gray-600">Total Transactions</CardDescription>
          <CardContent className="flex justify-between items-center mt-2">
            <div>
              <span className="font-semibold">156</span>
              <div className="flex font-thin">
                <FiArrowUpRight className="text-green-400" />
                <span className="text-[12px]">+8.5% vs last month</span>
              </div>
            </div>
            <FiDollarSign className="font-bold text-3xl text-blue-700 p-1.5 bg-blue-200 rounded" />
          </CardContent>
        </Card>

        <Card className="bg-white w-full sm:w-[45%] lg:w-[20%] p-4 flex flex-col justify-between">
          <CardDescription className="font-semibold text-gray-600">Refunds Processed</CardDescription>
          <CardContent className="flex justify-between items-center mt-2">
            <div>
              <span className="font-semibold">14</span>
              <div className="flex font-thin">
                <FiArrowUpRight className="text-green-400" />
                <span className="text-[12px]">+8.5% vs last month</span>
              </div>
            </div>
            <FiDollarSign className="font-bold text-3xl text-blue-700 p-1.5 bg-blue-200 rounded" />
          </CardContent>
        </Card>

        <Card className="bg-white w-full sm:w-[45%] lg:w-[20%] p-4 flex flex-col justify-between">
          <CardDescription className="font-semibold text-gray-600">Active Customers</CardDescription>
          <CardContent className="flex justify-between items-center mt-2">
            <div>
              <span className="font-semibold">86</span>
              <div className="flex font-thin">
                <FiArrowUpRight className="text-green-400" />
                <span className="text-[12px]">+4.1% vs last month</span>
              </div>
            </div>
            <FiDollarSign className="font-bold text-3xl text-blue-700 p-1.5 bg-blue-200 rounded" />
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center font-semibold mt-16 mb-5"> Quick Actions</div>
      <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 px-4 pb-8 text-center">
        <div className="w-1/2 sm:w-1/3 lg:w-1/6 flex flex-col items-center mb-4">
          <FiSend className="text-black text-2xl mb-1" />
          <span className="text-sm font-medium text-gray-700">Initiate Payout</span>
        </div>

        <div className="w-1/2 sm:w-1/3 lg:w-1/6 flex flex-col items-center mb-4">
          <FiUsers className="text-black text-2xl mb-1" />
          <span className="text-sm font-medium text-gray-700">Refund Customer</span>
        </div>

        <div className="w-1/2 sm:w-1/3 lg:w-1/6 flex flex-col items-center mb-4">
          <FiBarChart2 className="text-black text-2xl mb-1" />
          <span className="text-sm font-medium text-gray-700">Check Balances</span>
        </div>
        <div className="w-1/2 sm:w-1/3 lg:w-1/6 flex flex-col items-center mb-4">
          <FiLink className="text-black text-2xl mb-1" />
          <span className="text-sm font-medium text-gray-700">Create Payment Link</span>
        </div>

        <div className="w-1/2 sm:w-1/3 lg:w-1/6 flex flex-col items-center mb-4">
          <FiCreditCard className="text-black text-2xl mb-1" />
          <span className="text-sm font-medium text-gray-700">Add Fiat Account</span>
        </div>

        <div className="w-1/2 sm:w-1/3 lg:w-1/6 flex flex-col items-center mb-4">
          <FiHeadphones className="text-black text-2xl mb-1" />
          <span className="text-sm font-medium text-gray-700">Customer Service</span>
        </div>
      </div>
      <div className="px-4 mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Token</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
              </tr>
            </thead>

            <tbody>
              {[
                {
                  id: "TXN-001",
                  customer: { name: "John Doe", email: "john@example.com" },
                  amount: "120.50",
                  token: "USDC",
                  type: "Payment",
                  status: "Completed",
                  date: "2025-10-25",
                },
                {
                  id: "TXN-002",
                  customer: { name: "Jane Smith", email: "jane@example.com" },
                  amount: "85.00",
                  token: "USDC",
                  type: "Payout",
                  status: "Pending",
                  date: "2025-10-27",
                },
                {
                  id: "TXN-003",
                  customer: { name: "Michael Brown", email: "mike@example.com" },
                  amount: "240.75",
                  token: "USDC",
                  type: "Refund",
                  status: "Failed",
                  date: "2025-10-29",
                },
                {
                  id: "TXN-004",
                  customer: { name: "Sarah Lee", email: "sarah@example.com" },
                  amount: "310.00",
                  token: "USDC",
                  type: "Payment",
                  status: "Completed",
                  date: "2025-10-30",
                },
              ].map((tx) => (
                <tr
                  key={tx.id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {tx.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <div className="font-semibold text-black">{tx.customer.name}</div>
                    <div className="text-xs text-gray-500">{tx.customer.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 flex items-center gap-1">
                    <span>{tx.amount}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{tx.token}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{tx.type}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                  ${tx.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default Dashboard;
