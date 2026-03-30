import { Button } from "@orafi/ui";
import { Card, CardContent, Select } from "@orafi/ui";
import { MdOutlineMenu, MdDashboard, MdSettings } from "react-icons/md";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import {
    RiMoneyDollarCircleLine,
    RiCustomerService2Line,
    RiExchangeDollarLine,
    RiWallet3Line,
    RiBankLine,
} from "react-icons/ri";
import logo from "@orafi/ui/assets/OraFi.png";
import { useActiveTabStore } from "../store/activeTab";
import { useGetSupoortedNetworks } from "../hooks/mutations/useTransactions";

const navItems = [
    { name: "Dashboard", icon: <MdDashboard size={22} />, color: "text-blue-600", route: "/" },
    { name: "Transactions", icon: <RiExchangeDollarLine size={22} />, color: "text-emerald-600", route: "/transactions" },
    { name: "Customers", icon: <RiCustomerService2Line size={22} />, color: "text-purple-600", route: "/customers" },
    { name: "Settlements", icon: <RiWallet3Line size={22} />, color: "text-orange-600", route: "/settlements" },
    { name: "Payment Links", icon: <RiMoneyDollarCircleLine size={22} />, color: "text-teal-600", route: "/payment-links" },
    { name: "Webhook", icon: <RiBankLine size={22} />, color: "text-rose-600", route: "/webhook" },
    { name: "Settings", icon: <MdSettings size={22} />, color: "text-slate-600", route: "/settings" },
];

const LeftBar = () => {
    const {
        activeTab,
        collapsed,
        network,
        setNetwork,
        setActiveTab,
        toggleCollapse
    } = useActiveTabStore();

    const { data: supportedNetworks = [] } = useGetSupoortedNetworks();
    const [networkOptions, setNetworkOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    useEffect(() => {
        if (supportedNetworks && supportedNetworks.length > 0) {
            const options = supportedNetworks.map((net) => ({
                label: net.symbol,
                value: net.symbol,
            }));
            setNetworkOptions(options);
            if (!network && options.length > 0) {
                setNetwork(options[0].value as any);
            }
        }
    }, [supportedNetworks, network, setNetwork]);

    return (
        <>
            {/* Desktop Sidebar - Left */}
            <div className="hidden md:block md:fixed md:z-40 md:top-0 md:left-0 md:min-h-screen md:transition-colors md:duration-300 md:w-screen md:pointer-events-none">
                <aside
                    className={`pointer-events-auto ${collapsed ? "md:w-20" : "md:w-55"
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

                    <div className="flex-1 overflow-y-hidden px-4 py-7 space-y-2">
                        {navItems.map((item, index) => {
                            const isActive = activeTab === item.name;
                            return (
                                <Link to={item.route} key={index} className="block">
                                    <Card
                                        onClick={() => setActiveTab(item.name as any)}
                                        className={`border-none rounded-0 cursor-pointer transition-all duration-200 ${collapsed ? "py-2 px-2 flex justify-center" : "py-2 px-3"
                                            } ${isActive
                                                ? "bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 shadow-md scale-[1.03]"
                                                : "hover:shadow-md hover:scale-[1.02]"
                                            }`}
                                    >
                                        <CardContent
                                            className={`p-0 flex items-center ${collapsed ? "justify-center" : "justify-start gap-x-4"
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
                    <div className="px-4 pb-4">
                        <Select
                            value={network}
                            onChange={(e: any) => setNetwork(e?.value || e)}
                            placeholder="On-chain Network"
                            options={networkOptions} />
                    </div>
                </aside>
            </div>

            {/* Mobile Bottom Navigation - Floating */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none">
                <div className="pointer-events-auto mx-4 mb-4">
                    <div className="flex items-center justify-center gap-2 bg-blue-950 rounded-2xl p-3 shadow-lg border border-blue-900/50">
                        {navItems.map((item, index) => {
                            const isActive = activeTab === item.name;
                            return (
                                <div
                                    key={index}
                                    className="relative"
                                    onMouseEnter={() => setHoveredItem(item.name)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <Link to={item.route} className="block">
                                        <button
                                            onClick={() => setActiveTab(item.name as any)}
                                            className={`relative p-3 rounded-xl transition-all duration-200 ${
                                                isActive
                                                    ? "bg-blue-100 text-indigo-600"
                                                    : "text-slate-400 hover:text-slate-200 hover:bg-blue-900/50"
                                            }`}
                                            title={item.name}
                                        >
                                            {item.icon}
                                        </button>
                                    </Link>

                                    {/* Tooltip */}
                                    {hoveredItem === item.name && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded whitespace-nowrap pointer-events-none shadow-lg">
                                            {item.name}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeftBar;
