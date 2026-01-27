import DashboardWrapper from './DashboardWrapper'
import { useActiveTabStore } from "../store/activeTab";
import { useEffect } from 'react';

const Settings = () => {
  const { setActiveTab } = useActiveTabStore()

  useEffect(()=> {
    setActiveTab("Settings")
  }, [])
  return (
    <DashboardWrapper>
      Settings
    </DashboardWrapper>
  )
}

export default Settings