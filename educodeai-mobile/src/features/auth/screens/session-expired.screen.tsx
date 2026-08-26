import React from 'react';
import { useRouter } from 'expo-router';
import { AuthBanner } from '../components/auth-banner';
import { AuthShell } from '../components/auth-shell';
import { PrimaryButton } from '../components/primary-button';
import { useAuth } from '../context/AuthContext';

export function SessionExpiredScreen() {
  const router = useRouter();
  const { clearSession } = useAuth();

  const goLogin = async () => {
    await clearSession('logout');
    router.replace('/(auth)/login');
  };

  return (
    <AuthShell title="Phiên đăng nhập đã kết thúc" description="Vui lòng đăng nhập lại để tiếp tục học tập.">
      <AuthBanner tone="warning" message="Phiên có thể đã hết hạn hoặc bị đăng xuất từ thiết bị khác." />
      <PrimaryButton label="Đăng nhập lại" onPress={() => void goLogin()} />
    </AuthShell>
  );
}
