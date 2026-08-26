import React from 'react';
import { useRouter } from 'expo-router';
import { AuthBanner } from '../components/auth-banner';
import { AuthShell } from '../components/auth-shell';
import { PrimaryButton } from '../components/primary-button';
import { useAuth } from '../context/AuthContext';

export function RoleRejectedScreen() {
  const router = useRouter();
  const { clearSession } = useAuth();

  const goLogin = async () => {
    await clearSession('logout');
    router.replace('/(auth)/login');
  };

  return (
    <AuthShell title="Không hỗ trợ tài khoản này" description="Ứng dụng này dành riêng cho học viên.">
      <AuthBanner
        tone="warning"
        message="Tài khoản Giảng viên và Quản trị viên chỉ được đăng nhập trên phiên bản máy tính. Vui lòng truy cập EduCodeAI bằng trình duyệt trên máy tính để tiếp tục."
      />
      <PrimaryButton label="Quay về đăng nhập" onPress={() => void goLogin()} />
    </AuthShell>
  );
}
