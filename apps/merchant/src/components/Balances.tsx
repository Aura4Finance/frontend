import DashboardWrapper from "./DashboardWrapper";
import { useEffect } from "react";
import { useActiveTabStore } from "../store/activeTab";

const Balances = () => {
  const { setActiveTab } = useActiveTabStore();

  useEffect(() => {
    setActiveTab("Balances")
  }, [])
  return (
    <DashboardWrapper>
      Balances
    </DashboardWrapper>
  )
}

export default Balances