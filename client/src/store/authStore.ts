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
      // STEP 1: HARD DEFAULT - Do not auto-load from localStorage
      // isAuthenticated is false and token is null by default
      user: null,
      token: null,
      refreshToken: null,
      _hasHydrated: false,
      isLoading: false,

      setAuth: (user: User, token: string, refreshToken: string) => {
        console.log('[Auth Store] Setting auth with token:', token.substring(0, 20) + '...');
        // CRITICAL: Save token to localStorage immediately for request-time injection
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
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
        console.log('[Auth Store] HARD LOGOUT - Clearing all auth data');
        
        // Clear specific keys
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        
        // Clear any other auth-related keys
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
        
        // Clear state - CRITICAL: Set to hard defaults
        set({ user: null, token: null, refreshToken: null, isLoading: false });
        
        console.log('[Auth Store] All auth data cleared - back to hard defaults');
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
        console.log('[Auth Store] Hydration complete');
        state?.setHasHydrated(true);
      },
    }
  )
);
