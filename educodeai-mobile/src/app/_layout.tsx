import { Stack, usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { InteractionManager } from 'react-native';
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
    const isBootstrapRoute = pathname.endsWith('/bootstrap');
    const isRoleRejectedRoute = pathname.endsWith('/role-rejected');
    const isSessionExpiredRoute = pathname.endsWith('/session-expired');
    const inAuth = pathname.startsWith('/(auth)') || ['/login', '/register', '/forgot-password', '/bootstrap', '/role-rejected', '/session-expired'].includes(pathname) || pathname.endsWith('/login');
    const task = InteractionManager.runAfterInteractions(() => {
      if (status === 'bootstrapping' && !isBootstrapRoute) router.replace('/(auth)/bootstrap');
      else if (status === 'rejectedRole' && !isRoleRejectedRoute) router.replace('/(auth)/role-rejected');
      else if (status === 'sessionExpired' && !isSessionExpiredRoute) router.replace('/(auth)/session-expired');
      else if (status === 'error' || (status === 'unauthenticated' && isBootstrapRoute)) router.replace('/(auth)/login');
      else if (status === 'authenticatedStudent' && inAuth) router.replace('/(tabs)/home');
    });
    return () => task.cancel();
  }, [isNavigationReady, pathname, router, status]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return <AuthProvider><AuthRouter /></AuthProvider>;
}
