import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthInformation {
  email: string;
  password: string;
  setAuthInformationState: (data: { email: string; password: string }) => void;
  clearAuthInformationState: () => void;
}
const tokenStore = create<AuthInformation>()(
  persist(
    (set) => ({
      email: "",
      password: "",

      setAuthInformationState: (data) =>
        set({
          email: data.email,
          password: data.password,
        }),

      clearAuthInformationState: () =>
        set({
          email: "",
          password: "",
        }),
    }),
    {
      name: "auth-state",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default tokenStore
