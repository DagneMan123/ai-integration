import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      
      setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }),
      
      updateUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData } 
      })),
      
      logout: () => set({ user: null, token: null, refreshToken: null }),
      
      isAuthenticated: () => {
        const state = useAuthStore.getState();
        return !!state.token && !!state.user;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
