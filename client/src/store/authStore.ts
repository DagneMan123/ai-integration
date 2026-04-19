import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from '../types';

interface ExtendedAuthState extends AuthState {
  _hasHydrated: boolean;
  isLoading: boolean;
  setHasHydrated: (state: boolean) => void;
  setIsLoading: (state: boolean) => void;
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
      isLoading: false, // CRITICAL: Default to false - disable automatic redirect

      setAuth: (user: User, token: string, refreshToken: string) => {
        set({ user, token, refreshToken, isLoading: false });
      },

      setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      logout: () => {
        // HARD AUTH RESET: Clear ALL auth-related data from localStorage
        // This prevents redirect loops when token expires
        console.log('[Auth Store] HARD LOGOUT - Clearing all auth data');
        
        // Clear specific keys
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        
        // Clear any other auth-related keys that might exist
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('user') ||
          key.toLowerCase().includes('session')
        );
        keysToRemove.forEach(key => {
          console.log(`[Auth Store] Removing key: ${key}`);
          localStorage.removeItem(key);
        });
        
        // Clear state
        set({ user: null, token: null, refreshToken: null, isLoading: false });
        
        console.log('[Auth Store] All auth data cleared');
      },

      isAuthenticated: () => !!get().token && !!get().user,
      
      isAdmin: () => {
        const role = String(get().user?.role || '').toUpperCase();
        return role === 'ADMIN';
      },
      isEmployer: () => {
        const role = String(get().user?.role || '').toUpperCase();
        return role === 'EMPLOYER';
      },
      isCandidate: () => {
        const role = String(get().user?.role || '').toUpperCase();
        return role === 'CANDIDATE';
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // After hydration, verify token if it exists
        if (state?.token) {
          console.log('[Auth Store] Token found after hydration, verifying...');
          // Token verification will happen in PrivateRoute
        } else {
          console.log('[Auth Store] No token found after hydration');
          state?.setIsLoading(false);
        }
      },
    }
  )
);
