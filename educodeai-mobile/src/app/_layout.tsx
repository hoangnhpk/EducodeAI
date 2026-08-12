import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { useAuth } from '../features/auth/hooks/use-auth';

function AuthRouter() {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const inAuth = pathname.startsWith('/(auth)') || ['/login', '/register', '/forgot-password', '/bootstrap', '/role-rejected', '/session-expired'].includes(pathname);
    if (status === 'bootstrapping') router.replace('/(auth)/bootstrap');
    else if (status === 'rejectedRole') router.replace('/(auth)/role-rejected');
    else if (status === 'sessionExpired') router.replace('/(auth)/session-expired');
    else if (status === 'unauthenticated' && !inAuth) router.replace('/(auth)/login');
    else if (status === 'authenticatedStudent' && inAuth) router.replace('/tai-khoan');
  }, [pathname, router, status]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return <AuthProvider><AuthRouter /></AuthProvider>;
}
