import { create } from "zustand";

export interface Mode {
    mode: "test" | "live";
    setMode: (mode: Mode["mode"]) => void;
}

export const useActiveMode = create<Mode>((set) => ({
    mode: "test",
    setMode: (mode) => set({ mode })
}));