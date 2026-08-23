import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { setUnauthorizedHandler } from '../../../shared/configs/api';
import { authStorage, type AuthSession } from '../../../shared/lib/auth-storage';
import type { AuthPublicApi, AuthStatus, AuthUser, SessionEndReason } from '../../../shared/types/auth-public';

export interface AuthContextValue extends AuthPublicApi {
  establishSession(session: AuthSession): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('bootstrapping');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const epoch = useRef(0);
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  const clearSession = useCallback(async (reason: SessionEndReason = 'logout') => {
    const operation = ++epoch.current;
    setToken(null); setUser(null);
    setStatus(reason === 'unauthorized' || reason === 'revoked' ? 'sessionExpired' : reason === 'role-change' ? 'roleRejected' : 'anonymous');
    try { await authStorage.clearSession(); } catch { /* local memory is already cleared */ }
    if (operation !== epoch.current) return;
  }, []);

  const establishSession = useCallback(async (session: AuthSession) => {
    const operation = ++epoch.current;
    const nextUser = session.user;
    if (nextUser.vaiTro !== 2) {
      await clearSession('role-change');
      return;
    }
    await authStorage.setSession(session);
    if (operation !== epoch.current || !mounted.current) return;
    setToken(session.token); setUser(nextUser); setStatus('authenticated');
  }, [clearSession]);

  const logout = useCallback(async () => { await clearSession('logout'); }, [clearSession]);

  const updateUser = useCallback(async (patch: Partial<Pick<AuthUser, 'hoTen' | 'anhDaiDien'>>) => {
    const operation = epoch.current;
    if (!user || operation !== epoch.current) return;
    const nextUser = { ...user, ...(patch.hoTen !== undefined ? { hoTen: patch.hoTen } : {}), ...(patch.anhDaiDien !== undefined ? { anhDaiDien: patch.anhDaiDien } : {}) };
    const session = await authStorage.getSession();
    if (operation !== epoch.current || !session) return;
    await authStorage.setSession({ ...session, user: nextUser });
    if (operation === epoch.current && mounted.current) setUser(nextUser);
  }, [user]);

  useEffect(() => {
    const operation = epoch.current;
    let active = true;
    void authStorage.getSession().then((session) => {
      if (!active || !mounted.current || operation !== epoch.current) return;
      if (session) { setToken(session.token); setUser(session.user); setStatus('authenticated'); }
      else { setStatus('anonymous'); }
    }).catch(() => {
      if (active && mounted.current && operation === epoch.current) setStatus('anonymous');
    });
    return () => { active = false; };
  }, []);

  useEffect(() => setUnauthorizedHandler(() => clearSession('unauthorized')), [clearSession]);

  const value = useMemo<AuthContextValue>(() => ({ status, user, token, isLoading: status === 'bootstrapping', isAuthenticated: status === 'authenticated' && user?.vaiTro === 2, logout, clearSession, updateUser, establishSession }), [status, user, token, logout, clearSession, updateUser, establishSession]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
};

export { AuthContext };
