import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from '../types';

interface ExtendedAuthState extends AuthState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  isAdmin: () => boolean;
  isEmployer: () => boolean;
  isCandidate: () => boolean;
}

export const useAuthStore = create<ExtendedAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      _hasHydrated: false,

      setAuth: (user: User, token: string, refreshToken: string) => {
        set({ user, token, refreshToken });
      },

      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      logout: () => {
        set({ user: null, token: null, refreshToken: null });
        localStorage.removeItem('auth-storage');
      },

      isAuthenticated: () => !!get().token && !!get().user,
      
      isAdmin: () => get().user?.role === 'admin',
      isEmployer: () => get().user?.role === 'employer',
      isCandidate: () => get().user?.role === 'candidate',

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
