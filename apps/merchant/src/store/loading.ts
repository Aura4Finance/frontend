import { create } from "zustand";

interface LoadingStore {
  isCreatingPaylink: boolean;
  isEditingPaylink: boolean;
  setCreatingPaylink: (value: boolean) => void;
  setEditingPaylink: (value: boolean) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isCreatingPaylink: false,
  isEditingPaylink: false,
  setCreatingPaylink: (value: boolean) => set({ isCreatingPaylink: value }),
  setEditingPaylink: (value: boolean) => set({ isEditingPaylink: value }),
}));
