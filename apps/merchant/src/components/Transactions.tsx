import DashboardWrapper from "./DashboardWrapper";
import { useActiveTabStore } from "../store/activeTab";
import { useEffect } from "react";

const Transactions = () => {
  const { setActiveTab } = useActiveTabStore();

  useEffect(() => {
    setActiveTab("Transactions")
  }, [])
  return (
    <DashboardWrapper>Transactions</DashboardWrapper>
  )
}
export default Transactions
