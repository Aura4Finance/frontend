import { Button } from "@orafi/ui";
import { Card, CardContent } from "@orafi/ui";
import { MdOutlineMenu, MdDashboard, MdSettings, MdHealthAndSafety, MdClose } from "react-icons/md";
import { Link } from "wouter";
import {
  RiCustomerService2Line,
  RiExchangeDollarLine,
  RiStore2Line,
} from "react-icons/ri";
import logo from "@orafi/ui/assets/OraFi.png";
import { useActiveTabStore, type TabName } from "../../store/activeTab";
import { useState } from "react";

interface NavItem {
  name: TabName;
  icon: React.ReactNode;
  color: string;
  route: string;
}

const navItems: NavItem[] = [
  { name: "Overview", icon: <MdDashboard size={20} />, color: "text-blue-400", route: "/" },
  { name: "Customers", icon: <RiCustomerService2Line size={20} />, color: "text-purple-400", route: "/customers" },
  { name: "Transactions", icon: <RiExchangeDollarLine size={20} />, color: "text-emerald-400", route: "/transactions" },
  { name: "Merchants", icon: <RiStore2Line size={20} />, color: "text-orange-400", route: "/merchants" },
  { name: "System Health", icon: <MdHealthAndSafety size={20} />, color: "text-teal-400", route: "/system-health" },
  { name: "Settings", icon: <MdSettings size={20} />, color: "text-slate-400", route: "/settings" },
];

const LeftBar = () => {
  const { activeTab, collapsed, setActiveTab, toggleCollapse } = useActiveTabStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-blue-950 border-b border-blue-900 z-50 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-2">
          <img src={logo} alt="OraFi Logo" className="w-8 h-8 rounded-full shadow-md" />
          <span className="text-white font-semibold text-lg tracking-wide">OraFi Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-white hover:bg-blue-900">
          {mobileMenuOpen ? <MdClose size={24} /> : <MdOutlineMenu size={24} />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-blue-950 z-40 border-b border-blue-900 shadow-xl overflow-y-auto max-h-[calc(100vh-4rem)] p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item, index) => {
            const isActive = activeTab === item.name;
            return (
              <Link to={item.route} key={index} onClick={() => { setActiveTab(item.name); setMobileMenuOpen(false); }}>
                <Card className={`border-none cursor-pointer transition-all duration-200 p-3 ${
                  isActive ? "bg-blue-600 shadow-md" : "bg-blue-900/40 hover:bg-blue-800/60"
                }`}>
                  <CardContent className="flex items-center gap-3 p-0">
                    <span className={isActive ? "text-white" : item.color}>{item.icon}</span>
                    <span className={`text-sm font-medium ${isActive ? "text-white" : "text-slate-300"}`}>{item.name}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex ${collapsed ? "w-20" : "w-64"} 
        h-screen bg-blue-950 border-r border-blue-900 transition-all duration-300 flex-col shadow-xl fixed left-0 top-0 z-50`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-900 bg-blue-950/50 backdrop-blur-sm">
           {!collapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
              <img src={logo} alt="OraFi Logo" className="w-8 h-8 rounded-full shadow-lg border border-blue-800" />
              <span className="font-bold text-white tracking-wide text-lg">OraFi</span>
            </div>
           )}
           <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={`text-slate-400 hover:text-white hover:bg-blue-900 rounded-full transition-colors ${collapsed ? "mx-auto" : ""}`}
          >
            <MdOutlineMenu size={20} />
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {navItems.map((item, index) => {
            const isActive = activeTab === item.name;
            return (
              <Link to={item.route} key={index}>
                <div
                  onClick={() => setActiveTab(item.name)}
                  className={`
                    group flex items-center cursor-pointer rounded-xl transition-all duration-200 relative overflow-hidden
                    ${collapsed ? "justify-center p-3" : "px-4 py-3"}
                    ${isActive 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" 
                      : "hover:bg-blue-900/50 text-slate-400 hover:text-white"
                    }
                  `}
                >
                  <span className={`relative z-10 transition-transform duration-200 ${isActive ? "text-white scale-110" : item.color + " group-hover:scale-110"}`}>
                    {item.icon}
                  </span>
                  
                  {!collapsed && (
                    <span className={`ml-3 text-sm font-medium relative z-10 ${isActive ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                      {item.name}
                    </span>
                  )}
                  
                  {/* Active Indicator for collapsed mode */}
                  {collapsed && isActive && (
                    <div className="absolute inset-0 bg-blue-600 rounded-xl -z-0 opacity-20 animate-pulse" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-blue-900 bg-blue-950/30">
            <div className="bg-blue-900/30 rounded-lg p-3">
               <div className="text-xs font-medium text-slate-300">Admin Dashboard</div>
               <div className="text-[10px] text-slate-500 mt-0.5">v1.0.0 • OraFi Inc.</div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default LeftBar;
