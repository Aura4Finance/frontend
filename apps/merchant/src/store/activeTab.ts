// src/store/useActiveTabStore.ts
import { create } from "zustand";

export interface ActiveTabState {
  activeTab:
  | "Dashboard"
  | "Transactions"
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
  toggleCollapse: () => void;
  setActiveTab: (tab: ActiveTabState["activeTab"]) => void;
}

export const useActiveTabStore = create<ActiveTabState>((set) => ({
  activeTab: "Dashboard",
  collapsed: true,
  network: "SUI",
  setNetwork: (network) => set({network}),
  toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
