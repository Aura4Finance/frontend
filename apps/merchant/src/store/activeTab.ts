import { create } from "zustand";

export interface ActiveTabState {
  activeTab:
  | "Dashboard"
  | "Transactions"
  | "Subscriptions"
  | "Customers"
  | "Settlements"
  | "Payment Links"
  | "Webhook"
  | "Settings";
  collapsed: boolean;
  network: 
  | "SUI"
  | "BASE"
  | "ETH"
  | "BNB"
  | "SOLANA";
  setNetwork: (network:  ActiveTabState["network"]) => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
  setActiveTab: (tab: ActiveTabState["activeTab"]) => void;
}

export const useActiveTabStore = create<ActiveTabState>((set) => ({
  activeTab: "Dashboard",
  collapsed: false,
  network: "SUI",
  setNetwork: (network) => set({network}),
  setCollapsed: (collapsed) => set({ collapsed }),
  toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
