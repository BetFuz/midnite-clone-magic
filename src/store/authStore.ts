import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth';
import { setTokens, setUnauthorizedHandler } from '@/lib/api/client';

export interface BetFuzUser {
  id:          string;
  email:       string;
  firstName:   string;
  lastName:    string;
  username:    string;
  role:        string;
  kycTier:     string;
  kycStatus:   string;
  avatarUrl:   string | null;
  totpEnabled: boolean;
}

interface AuthStore {
  user:         BetFuzUser | null;
  accessToken:  string | null;
  refreshToken: string | null;
  isLoading:    boolean;

  login:       (email: string, password: string) => Promise<void>;
  register:    (data: RegisterData) => Promise<void>;
  logout:      () => void;
  refreshAuth: () => Promise<void>;
  setUser:     (user: BetFuzUser) => void;
  hydrate:     () => void;
}

interface RegisterData {
  email: string; password: string;
  firstName: string; lastName: string;
  username: string; phone?: string; referralCode?: string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,

      hydrate: () => {
        const { accessToken, refreshToken } = get();
        setTokens(accessToken, refreshToken);
        setUnauthorizedHandler(() => {
          set({ user: null, accessToken: null, refreshToken: null });
          setTokens(null, null);
        });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, accessToken, refreshToken } = await authApi.login({ email, password });
          setTokens(accessToken, refreshToken);
          const normalizedUser = { ...user, role: user.role?.toLowerCase?.() ?? user.role };
          set({ user: normalizedUser, accessToken, refreshToken, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { user, accessToken, refreshToken } = await authApi.register(data);
          setTokens(accessToken, refreshToken);
          set({ user, accessToken, refreshToken, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        authApi.logout().catch(() => {});
        setTokens(null, null);
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token');
        const { accessToken: newAccess, refreshToken: newRefresh } = await authApi.refresh(refreshToken);
        setTokens(newAccess, newRefresh);
        set({ accessToken: newAccess, refreshToken: newRefresh });
      },

      setUser: (user) => set({ user: { ...user, role: user.role?.toLowerCase?.() ?? user.role } }),
    }),
    {
      name: 'betfuz-auth',
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
