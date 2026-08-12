import { Stack, usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { useAuth } from '../features/auth/hooks/use-auth';

function AuthRouter() {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navigationState = useRootNavigationState();
  const isNavigationReady = navigationState?.key != null;

  useEffect(() => {
    if (!isNavigationReady) return;
    const inAuth = pathname.startsWith('/(auth)') || ['/login', '/register', '/forgot-password', '/bootstrap', '/role-rejected', '/session-expired'].includes(pathname);
    if (status === 'bootstrapping' && pathname !== '/(auth)/bootstrap') router.replace('/(auth)/bootstrap');
    else if (status === 'rejectedRole' && pathname !== '/(auth)/role-rejected') router.replace('/(auth)/role-rejected');
    else if (status === 'sessionExpired' && pathname !== '/(auth)/session-expired') router.replace('/(auth)/session-expired');
    else if (status === 'unauthenticated' && !inAuth && pathname !== '/') router.replace('/(auth)/login');
    else if (status === 'authenticatedStudent' && inAuth) router.replace('/tai-khoan');
  }, [isNavigationReady, pathname, router, status]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return <AuthProvider><AuthRouter /></AuthProvider>;
}
