import DashboardWrapper from "./DashboardWrapper"
import { useEffect } from "react";
import { useActiveTabStore } from "../store/activeTab";

const Webhook = () => {

    const { setActiveTab } = useActiveTabStore();

    useEffect(()=> {
      setActiveTab("Webhook")
    }, [])
  return (
    <DashboardWrapper>Webhook</DashboardWrapper>
  )
}

export default Webhook