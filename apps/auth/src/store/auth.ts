import { create } from "zustand";

interface AuthStore {
    email: string,
    setEmail: (email: string) => void,
    clearEmail: () => void
}

export const useAuth = create<AuthStore>((set) => ({
    email: "",
    setEmail: (email: string) => set({email}),
    clearEmail: () => set({email: ""}),
}))