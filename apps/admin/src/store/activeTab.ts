// src/store/activeTab.ts
import { create } from "zustand";

export type TabName =
  | "Overview"
  | "Customers"
  | "Transactions"
  | "Merchants"
  | "System Health"
  | "Settings";

export interface ActiveTabState {
  activeTab: TabName;
  collapsed: boolean;
  setActiveTab: (tab: TabName) => void;
  toggleCollapse: () => void;
}

export const useActiveTabStore = create<ActiveTabState>((set) => ({
  activeTab: "Overview",
  collapsed: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),
}));
