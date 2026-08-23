import type { AuthSession } from '../types/auth.types';

export type AuthStatus = 'bootstrapping' | 'unauthenticated' | 'authenticatedStudent' | 'rejectedRole' | 'sessionExpired' | 'error';
export type ClearSessionReason = 'logout' | 'rejectedRole' | 'sessionExpired' | 'invalidSession' | 'error';
export interface AuthState { status: AuthStatus; session: AuthSession | null; error: string | null }
export type AuthAction =
  | { type: 'BOOTSTRAP_STARTED' }
  | { type: 'AUTHENTICATED'; session: AuthSession }
  | { type: 'CLEARED'; reason: ClearSessionReason }
  | { type: 'ERROR'; message: string };

export const initialAuthState: AuthState = { status: 'bootstrapping', session: null, error: null };
export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'BOOTSTRAP_STARTED': return initialAuthState;
    case 'AUTHENTICATED': return { status: 'authenticatedStudent', session: action.session, error: null };
    case 'CLEARED':
      return {
        status: action.reason === 'rejectedRole' ? 'rejectedRole' : action.reason === 'sessionExpired' ? 'sessionExpired' : action.reason === 'error' ? 'error' : 'unauthenticated',
        session: null,
        error: null,
      };
    case 'ERROR': return { status: 'error', session: null, error: action.message };
    default: return state;
  }
};
