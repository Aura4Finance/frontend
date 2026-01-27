import React from "react";
import LeftBar from "../components/LeftBar";
import { useActiveTabStore} from "../store/activeTab"

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { collapsed } = useActiveTabStore();
  return (
    <div className="flex min-h-screen">
      <LeftBar />
      <main className= {`w-screen transition-all duration-300 ${collapsed ? "ml-20" : "ml-55"}`} >
        {children}
      </main>
    </div>
  );
};

export default DashboardWrapper;
