import DashboardWrapper from "./DashboardWrapper"
import { useEffect } from "react";
import { useActiveTabStore } from "../store/activeTab";

const PaymentLink = () => {
  const { setActiveTab } = useActiveTabStore();
  useEffect(() => {
    setActiveTab("Payment Link")
  }, [])
  return (
    <DashboardWrapper>PaymentLink</DashboardWrapper>
  )
}

export default PaymentLink