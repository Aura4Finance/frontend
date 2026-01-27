import DashboardWrapper from "./DashboardWrapper"
import { useActiveTabStore } from "../store/activeTab";
import { useEffect } from 'react';

const Customers = () => {
  const { setActiveTab } = useActiveTabStore();
  useEffect(()=> {
    setActiveTab("Customers")
  }, [])
  return (
    <DashboardWrapper>
      Customers
    </DashboardWrapper>
  )
}

export default Customers