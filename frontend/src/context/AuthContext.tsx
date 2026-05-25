'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { tokenStore } from '@/lib/authStorage';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (u: User) => void;
}

const AuthCtx = createContext<AuthState | null>(null);

const PUBLIC_ROUTES = new Set(['/login', '/signup']);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    const token = tokenStore.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.has(pathname);
    if (!user && !isPublic) {
      router.replace('/login');
    } else if (user && isPublic) {
      router.replace('/assignments');
    }
  }, [user, loading, pathname, router]);

  const finalize = useCallback(
    (token: string, freshUser: User) => {
      tokenStore.set(token);
      setUser(freshUser);
      router.replace('/assignments');
    },
    [router],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const { token, user: u } = await api.login(email, password);
        finalize(token, u);
      },
      async signup(name, email, password) {
        const { token, user: u } = await api.signup(name, email, password);
        finalize(token, u);
      },
      async loginWithGoogle(idToken) {
        const { token, user: u } = await api.googleLogin(idToken);
        finalize(token, u);
      },
      logout() {
        tokenStore.clear();
        setUser(null);
        router.replace('/login');
      },
      refreshUser,
      setUser,
    }),
    [user, loading, finalize, refreshUser, router],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
