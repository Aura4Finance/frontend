import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware"; 

export interface UserProfile {
  id: string
  firstname: string
  lastname: string
  email: string
  twoFactorEnabled: boolean
  createdAt: string
  businessProfile: {
    id: string
    businessName: string
    businessSector: string
    country: string
    website: string
    onboarded: boolean
    isLive: boolean
    wallet: {
      address: string
    }[]
  } 
}

interface AccessToken {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const tokenStore = create<AccessToken>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "access-token", 
      getStorage: () => sessionStorage, 
    }
  )
);

const client = axios.create({
  baseURL: "http://localhost:3000/v1",
  withCredentials: true,
});


client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStore.getState().clearProfile();
      window.location.href = "https://auth.orafi.app/signin";
    }
    return Promise.reject(error);
  }
);

export default client;
