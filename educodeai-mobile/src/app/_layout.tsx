import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '../features/auth';
import { LoadingScreen } from '../features/auth/components/auth-ui';

function Guard() {
  const { status } = useAuth();
  const segments = useSegments() as string[];

  useEffect(() => {
    if (status === 'bootstrapping') return;
    const inAuth = segments[0] === '(auth)';
    if (status === 'authenticated' && !inAuth) return;
    if (status === 'authenticated' && inAuth) {
      router.replace('/(tabs)/home');
      return;
    }
    if (status === 'anonymous' && !inAuth) {
      router.replace('/(auth)/login');
      return;
    }
    if (status === 'sessionExpired' && segments[1] !== 'session-expired') {
      router.replace('/(auth)/session-expired');
    }
    if (status === 'roleRejected' && segments[1] !== 'role-rejected') {
      router.replace('/(auth)/role-rejected');
    }
  }, [status, segments]);

  if (status === 'bootstrapping') {
    return <LoadingScreen label="Đang kiểm tra phiên đăng nhập..." />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return <AuthProvider><Guard /></AuthProvider>;
}
