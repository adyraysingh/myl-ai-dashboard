'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loginRequest, logoutRequest, refreshRequest, getMeRequest, setAccessToken, AuthUser } from '@/lib/auth';
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
const REFRESH_INTERVAL_MS = 12 * 60 * 1000;
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const storeToken = useCallback((token: string | null) => { setToken(token); setAccessToken(token); }, []);
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      const newToken = await refreshRequest();
      if (newToken) { storeToken(newToken); scheduleRefresh(); }
      else { storeToken(null); setUser(null); router.push('/login'); }
    }, REFRESH_INTERVAL_MS);
  }, [storeToken, router]);
  useEffect(() => {
    async function restoreSession() {
      setIsLoading(true);
      try {
        const newToken = await refreshRequest();
        if (newToken) { storeToken(newToken); const me = await getMeRequest(newToken); if (me) { setUser(me); scheduleRefresh(); } else { storeToken(null); } }
      } catch { storeToken(null); } finally { setIsLoading(false); }
    }
    restoreSession();
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, [storeToken, scheduleRefresh]);
  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    if (result.success) { storeToken(result.access_token); setUser(result.user); scheduleRefresh(); return { success: true }; }
    return { success: false, error: result.error };
  }, [storeToken, scheduleRefresh]);
  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    await logoutRequest(); storeToken(null); setUser(null); router.push('/login');
  }, [storeToken, router]);
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const newToken = await refreshRequest();
    if (newToken) { storeToken(newToken); scheduleRefresh(); return true; }
    storeToken(null); setUser(null); router.push('/login'); return false;
  }, [storeToken, scheduleRefresh, router]);
  return (<AuthContext.Provider value={{ user, isAuthenticated: !!accessToken && !!user, isLoading, accessToken, login, logout, refreshToken }}>{children}</AuthContext.Provider>);
}
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
export default AuthProvider;
