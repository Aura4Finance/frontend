import { Button } from "@orafi/ui";
import { Card, CardContent, Select } from "@orafi/ui";
import { MdOutlineMenu, MdDashboard, MdSettings } from "react-icons/md";
import { Link } from "wouter";
import {
    RiMoneyDollarCircleLine,
    RiCustomerService2Line,
    RiExchangeDollarLine,
    RiWallet3Line,
    RiBankLine,
} from "react-icons/ri";
import logo from "@orafi/ui/assets/OraFi.png";
import { useActiveTabStore } from "../store/activeTab";

const navItems = [
    { name: "Dashboard", icon: <MdDashboard size={22} />, color: "text-blue-600", route: "/dashboard" },
    { name: "Transactions", icon: <RiExchangeDollarLine size={22} />, color: "text-emerald-600", route: "/dashboard/transactions" },
    { name: "Customers", icon: <RiCustomerService2Line size={22} />, color: "text-purple-600", route: "/dashboard/customers" },
    { name: "Balances", icon: <RiWallet3Line size={22} />, color: "text-orange-600", route: "/dashboard/balances" },
    { name: "Payment Links", icon: <RiMoneyDollarCircleLine size={22} />, color: "text-teal-600", route: "/dashboard/payment-links" },
    { name: "Bank Accounts", icon: <RiBankLine size={22} />, color: "text-rose-600", route: "/dashboard/fiats" },
    { name: "Settings", icon: <MdSettings size={22} />, color: "text-slate-600", route: "/dashboard/settings" },
];

const networks = [
  {
    label: "SUI",
    value: "SUI",
  },
  {
    label: "BASE",
    value: "BASE",
  },
  {
    label: "ETH",
    value: "ETH", 
  },
  {
    label: "BNB",
    value: "BNB",
  },
  {
    label: "SOLANA",
    value: "SOLANA",
  },
]


const LeftBar = () => {
    const {
        activeTab,
        collapsed,
        network,
        setNetwork,
        setActiveTab,
        toggleCollapse
    } = useActiveTabStore();

    return (
        <div className="fixed z-0 top-0 min-h-screen transition-colors duration-300 w-screen">
            <aside
                className={`${collapsed ? "w-20" : "w-55"
                    } h-screen bg-blue-950 border-r border-slate-200 dark:border-gray-700 transition-all duration-300 flex flex-col shadow-sm`}
            >
                <div className="p-4 border-b border-slate-200 dark:border-gray-700 flex items-center gap-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleCollapse()}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 pl-3"
                    >
                        <MdOutlineMenu className="w-6 h-6" />
                    </Button>

                    {!collapsed && (
                        <div className="flex items-center space-x-3">
                            <img
                                src={logo}
                                alt="OraFi Logo"
                                className="w-10 h-10 rounded-full object-cover shadow-md"
                            />
                            <span className="text-lg font-semibold tracking-wide text-slate-700 dark:text-slate-100">
                                OraFi
                            </span>
                        </div>
                    )}
                </div>

                {/* Navigation Cards */}
                <div className="flex-1 overflow-y-hidden px-3 py-6 space-y-3">
                    {navItems.map((item, index) => {
                        const isActive = activeTab === item.name;
                        return (
                            <Link to={item.route} key={index}>
                                <Card
                                    onClick={() => setActiveTab(item.name as any)}
                                    className={`border-none rounded-0 cursor-pointer transition-all duration-200 ${collapsed ? "p-4 flex justify-center" : "p-4"
                                        } ${isActive
                                            ? "bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700   shadow-md scale-[1.03]"
                                            : "hover:shadow-md hover:scale-[1.02]"
                                        }`}
                                >
                                    <CardContent
                                        className={`flex items-center ${collapsed ? "justify-center" : "justify-start gap-x-4"
                                            }`}
                                    >
                                        <span
                                            className={`${isActive
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : item.color
                                                }`}
                                        >
                                            {item.icon}
                                        </span>
                                        {!collapsed && (
                                            <span
                                                className={`text-sm font-medium ${isActive
                                                    ? "text-indigo-700 dark:text-indigo-300"
                                                    : "text-slate-700 dark:text-slate-200"
                                                    }`}
                                            >
                                                {item.name}
                                            </span>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
                <Select
                    value={network}
                    onChange={(e: any) => setNetwork(e?.valueOf)}
                    placeholder="On-chain Network"
                    options={networks} />
            </aside>
        </div>
    );
};

export default LeftBar;
