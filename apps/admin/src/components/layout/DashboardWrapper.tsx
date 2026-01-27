import LeftBar from "./LeftBar";
import { useActiveTabStore } from "../../store/activeTab";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

const DashboardWrapper = ({ children }: DashboardWrapperProps) => {
  const { collapsed } = useActiveTabStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <LeftBar />
      <main
        className={`flex-1 transition-all duration-300 
          mt-16 md:mt-0 
          ${collapsed ? "md:ml-20" : "md:ml-64"} 
          min-h-screen p-0`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardWrapper;
