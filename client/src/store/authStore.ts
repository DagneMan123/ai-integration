import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      
      setAuth: (user: User, token: string, refreshToken: string) => 
        set({ user, token, refreshToken }),
      
      updateUser: (userData: Partial<User>) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, ...userData } : null
        })),
      
      logout: () => set({ user: null, token: null, refreshToken: null }),
      
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
