import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens } from '@/types';

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true, isLoading: false }),

      setTokens: (tokens) =>
        set((state) => ({ tokens, isAuthenticated: state.user !== null })),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => set({ user: null, tokens: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'smart-leads-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, tokens: state.tokens, isAuthenticated: state.isAuthenticated }),
    }
  )
);
