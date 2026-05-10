import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,

      setUser: (user) => set({ user, isLoading: false }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'roamio-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
