import { Button } from "@orafi/ui";
import { Card, CardContent } from "@orafi/ui";
import { MdOutlineMenu, MdDashboard, MdSettings } from "react-icons/md";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import {
    RiMoneyDollarCircleLine,
    RiCustomerService2Line,
    RiExchangeDollarLine,
    RiWallet3Line,
    RiBankLine,
    RiRepeat2Line,
} from "react-icons/ri";
import logo from "@orafi/ui/assets/OraFi.png";
import { useActiveTabStore } from "../store/activeTab";

const navItems = [
    { name: "Dashboard", icon: <MdDashboard size={22} />, color: "text-blue-600", route: "/" },
    { name: "Transactions", icon: <RiExchangeDollarLine size={22} />, color: "text-emerald-600", route: "/transactions" },
    { name: "Subscriptions", icon: <RiRepeat2Line size={22} />, color: "text-cyan-600", route: "/subscriptions" },
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
        setCollapsed,
        setActiveTab,
        toggleCollapse
    } = useActiveTabStore();

    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");

        const syncSidebarState = () => {
            setCollapsed(!mediaQuery.matches);
        };

        syncSidebarState();
        mediaQuery.addEventListener("change", syncSidebarState);

        return () => mediaQuery.removeEventListener("change", syncSidebarState);
    }, [setCollapsed]);

    return (
        <>
            {/* Desktop Sidebar - Left */}
            <div className="hidden md:block md:fixed md:top-0 md:left-0 md:min-h-screen md:transition-colors md:duration-300 md:w-screen md:pointer-events-none">
                <aside
                    className={`pointer-events-auto ${collapsed ? "md:w-20" : "md:w-55"
                        } h-screen bg-blue-950 border-r border-slate-200 dark:border-gray-700 transition-all duration-300 flex flex-col shadow-sm relative`}
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
                                <div
                                    key={index}
                                    className={`relative group ${collapsed ? "flex justify-center" : ""}`}
                                    onMouseEnter={() => setHoveredItem(item.name)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <Link
                                        to={item.route}
                                        className={collapsed ? "relative inline-block" : "block"}
                                    >
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

                                        {/* Floating Label - Desktop */}
                                        {hoveredItem === item.name && collapsed && (
                                            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg dark:bg-gray-800">
                                                {item.name}
                                                <div className="absolute right-full -top-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45"></div>
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </aside>
            </div>

            {/* Mobile Bottom Navigation - Floating */}
            <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden pointer-events-none">
                <div className="pointer-events-auto mx-2 mb-2">
                    <div className="grid grid-cols-8 items-center gap-0.5 bg-blue-950 rounded-2xl p-2 shadow-lg border border-blue-900/50">
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
                                            className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                                                isActive
                                                    ? "bg-blue-100 text-indigo-600"
                                                    : "text-slate-400 hover:text-slate-200 hover:bg-blue-900/50"
                                            }`}
                                            title={item.name}
                                        >
                                            <span className="scale-90">{item.icon}</span>
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
