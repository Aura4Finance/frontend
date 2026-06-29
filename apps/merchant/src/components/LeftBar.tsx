import { Button } from "@orafi/ui";
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
import { useActiveTabStore } from "@/store/activeTab";

const navItems = [
    { name: "Dashboard", icon: <MdDashboard size={22} />, color: "text-blue-400", route: "/" },
    { name: "Transactions", icon: <RiExchangeDollarLine size={22} />, color: "text-emerald-400", route: "/transactions" },
    { name: "Subscriptions", icon: <RiRepeat2Line size={22} />, color: "text-cyan-400", route: "/subscriptions" },
    { name: "Customers", icon: <RiCustomerService2Line size={22} />, color: "text-purple-400", route: "/customers" },
    { name: "Settlements", icon: <RiWallet3Line size={22} />, color: "text-orange-400", route: "/settlements" },
    { name: "Payment Links", icon: <RiMoneyDollarCircleLine size={22} />, color: "text-teal-400", route: "/payment-links" },
    { name: "Webhook", icon: <RiBankLine size={22} />, color: "text-rose-400", route: "/webhook" },
    { name: "Settings", icon: <MdSettings size={22} />, color: "text-slate-400", route: "/settings" },
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
}, []); 

    return (
        <>
            {/* Desktop Sidebar - Left */}
            <div className="hidden md:block md:fixed md:top-0 md:left-0 md:min-h-screen md:transition-colors md:duration-300 md:w-fit md:pointer-events-none z-50">
                <aside
                    className={`pointer-events-auto ${collapsed ? "md:w-20" : "md:w-55"
                        } h-screen bg-blue-950 border-r border-slate-800 transition-all duration-300 flex flex-col relative`}
                >
                    <div className="p-4 border-b border-slate-800 flex items-center gap-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleCollapse()}
                            className="text-slate-400 hover:text-slate-200 pl-3 hover:bg-blue-900/50"
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
                                <span className="text-lg font-semibold tracking-wide text-slate-100">
                                    OraFi
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
                        {navItems.map((item, index) => {
                            const isActive = activeTab === item.name;
                            return (
                                <div
                                    key={index}
                                    className={`relative flex items-center ${collapsed ? "justify-center" : ""}`}
                                    onMouseEnter={() => setHoveredItem(item.name)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <Link
                                        to={item.route}
                                        onClick={() => setActiveTab(item.name as any)}
                                        className={`w-full flex items-center rounded-xl transition-all duration-200 ${
                                            collapsed ? "p-2.5 justify-center" : "p-3 gap-x-4"
                                        } ${
                                            isActive
                                                ? "bg-blue-900/60 text-white"
                                                : "text-slate-300 hover:bg-blue-900/30 hover:text-white"
                                        }`}
                                    >
                                        <span className={isActive ? "text-blue-400" : item.color}>
                                            {item.icon}
                                        </span>
                                        {!collapsed && (
                                            <span className="text-sm font-medium">
                                                {item.name}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Floating Label - Desktop */}
                                    {hoveredItem === item.name && collapsed && (
                                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-950 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-xl z-50 border border-slate-800">
                                            {item.name}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-950"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </aside>
            </div>

            {/* Mobile Bottom Navigation - Floating */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none">
                <div className="pointer-events-auto mx-2 mb-2">
                    <div className="grid grid-cols-8 items-center gap-0.5 bg-blue-950 rounded-2xl p-2 shadow-xl border border-blue-900/50">
                        {navItems.map((item, index) => {
                            const isActive = activeTab === item.name;
                            return (
                                <div
                                    key={index}
                                    className="relative flex justify-center"
                                    onMouseEnter={() => setHoveredItem(item.name)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <Link to={item.route} className="block w-full">
                                        <button
                                            onClick={() => setActiveTab(item.name as any)}
                                            className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                                                isActive
                                                    ? "bg-blue-900 text-blue-400"
                                                    : "text-slate-400 hover:text-slate-200 hover:bg-blue-900/50"
                                            }`}
                                        >
                                            <span className="scale-95">{item.icon}</span>
                                        </button>
                                    </Link>

                                    {/* Tooltip - Mobile */}
                                    {hoveredItem === item.name && (
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-950 text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap pointer-events-none shadow-xl z-100 border border-slate-800">
                                            {item.name}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-950"></div>
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