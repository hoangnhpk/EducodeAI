import { useAuth } from '../hooks/use-auth';

export type AuthGuardResult = 'loading' | 'allow' | 'deny';

export const useAuthGuard = (): AuthGuardResult => {
  const { status } = useAuth();
  if (status === 'bootstrapping') return 'loading';
  return status === 'authenticatedStudent' ? 'allow' : 'deny';
};
