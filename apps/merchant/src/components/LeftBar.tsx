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

    useEffect(() => {
        if (supportedNetworks && supportedNetworks.length > 0) {
            const options = supportedNetworks.map((net) => ({
                label: net.symbol,
                value: net.symbol,
            }));
            setNetworkOptions(options);
            // Set first network as default if not already set
            if (!network && options.length > 0) {
                setNetwork(options[0].value as any);
            }
        }
    }, [supportedNetworks, network, setNetwork]);

    return (
        <div className="fixed z-0 top-0 min-h-screen transition-colors duration-300 w-screen pointer-events-none">
            <aside
                className={`pointer-events-auto ${collapsed ? "w-20" : "w-55"
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
                <div className="flex-1 overflow-y-hidden px-4 py-7 space-y-2">
                    {navItems.map((item, index) => {
                        const isActive = activeTab === item.name;
                        return (
                            <Link to={item.route} key={index} className="block">
                                <Card
                                    onClick={() => setActiveTab(item.name as any)}
                                    className={`border-none rounded-0 cursor-pointer transition-all duration-200 ${collapsed ? "py-2 px-2 flex justify-center" : "py-2 px-3"
                                        } ${isActive
                                            ? "bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700   shadow-md scale-[1.03]"
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
                <Select
                    value={network}
                    onChange={(e: any) => setNetwork(e?.value || e)}
                    placeholder="On-chain Network"
                    options={networkOptions} />
            </aside>
        </div>
    );
};

export default LeftBar;
