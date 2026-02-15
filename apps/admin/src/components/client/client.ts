import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware"; 

interface AccessToken {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const tokenStore = create<AccessToken>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: "access-token", 
      getStorage: () => sessionStorage, 
    }
  )
);

export const client = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});


client.interceptors.request.use((config) => {
  const token = tokenStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
