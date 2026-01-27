import DashboardWrapper from "./DashboardWrapper"
import { useEffect } from "react";
import { useActiveTabStore } from "../store/activeTab";

const Fiats = () => {

    const { setActiveTab } = useActiveTabStore();

    useEffect(()=> {
      setActiveTab("Bank Accounts")
    }, [])
  return (
    <DashboardWrapper>Fiats</DashboardWrapper>
  )
}

export default Fiats