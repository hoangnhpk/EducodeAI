import type { AuthStatus } from '../shared/types/auth-public';

export type RootRoute = '/(tabs)/account' | '/(auth)/login' | '/(auth)/session-expired' | '/(auth)/role-rejected' | null;

export const routeForAuthStatus = (status: AuthStatus): RootRoute => {
  if (status === 'bootstrapping') return null;
  if (status === 'authenticated') return '/(tabs)/account';
  if (status === 'sessionExpired') return '/(auth)/session-expired';
  if (status === 'roleRejected') return '/(auth)/role-rejected';
  return '/(auth)/login';
};
