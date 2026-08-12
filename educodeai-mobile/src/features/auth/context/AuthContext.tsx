import React, { createContext, useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { setUnauthorizedCallback } from '../../../shared/configs/api';
import { authStorage } from '../../../shared/lib/auth-storage';
import { normalizeApiError } from '../../../shared/types/api-error';
import { isStudent } from '../guards/role-guard';
import { authService } from '../services/auth.service';
import type { AuthSession, LoginClassification } from '../types/auth.types';
import { authReducer, initialAuthState, type AuthState, type ClearSessionReason } from './auth-reducer';

export interface AuthContextValue extends AuthState {
  clearSession(reason: ClearSessionReason): Promise<void>;
  bootstrap(): Promise<void>;
  retryBootstrap(): Promise<void>;
  completeLogin(session: AuthSession): Promise<boolean>;
  login(identifier: string, password: string, captchaToken?: string): Promise<LoginClassification>;
  logout(): Promise<void>;
  checkAuth(): Promise<void>;
}
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const clearSession = useCallback(async (reason: ClearSessionReason) => {
    try {
      await authStorage.clearSession();
    } finally {
      dispatch({ type: 'CLEARED', reason });
    }
  }, []);
  const completeLogin = useCallback(async (session: AuthSession) => {
    if (!isStudent(session.user)) {
      await clearSession('rejectedRole');
      return false;
    }

    try {
      await authStorage.writeSession(session);
      dispatch({ type: 'AUTHENTICATED', session });
      return true;
    } catch (error) {
      await clearSession('error');
      throw error;
    }
  }, [clearSession]);
  const bootstrap = useCallback(async () => {
    dispatch({ type: 'BOOTSTRAP_STARTED' });
    try {
      const session = await authStorage.readSession();
      if (!session) { dispatch({ type: 'CLEARED', reason: 'invalidSession' }); return; }
      if (!isStudent(session.user)) { await clearSession('rejectedRole'); return; }
      const serverState = await authService.getSessionState();
      if (!serverState.isValid) { await clearSession('sessionExpired'); return; }
      dispatch({ type: 'AUTHENTICATED', session });
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (apiError.status === 401) {
        await clearSession('sessionExpired');
        return;
      }
      dispatch({ type: 'ERROR', message: apiError.message });
    }
  }, [clearSession]);
  useEffect(() => { void bootstrap(); }, [bootstrap]);
  useEffect(() => setUnauthorizedCallback(() => clearSession('sessionExpired')), [clearSession]);
  const finishClassification = useCallback(async (result: LoginClassification): Promise<LoginClassification> => {
    if (result.kind !== 'authenticated') return result;
    return await completeLogin(result.session) ? result : { kind: 'rejected-role' };
  }, [completeLogin]);
  const login = useCallback(async (identifier: string, password: string, captchaToken?: string): Promise<LoginClassification> => {
    return finishClassification(await authService.login(identifier, password, captchaToken));
  }, [finishClassification]);
  const logout = useCallback(async () => { try { await authService.logout(); } finally { await clearSession('logout'); } }, [clearSession]);
  const value = useMemo<AuthContextValue>(() => ({ ...state, clearSession, bootstrap, retryBootstrap: bootstrap, completeLogin, login, logout, checkAuth: bootstrap }), [state, clearSession, bootstrap, completeLogin, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
