import { router } from 'expo-router';
import { AuthShell, Feedback, PrimaryButton, TextLink } from '../../features/auth/components/auth-ui';
import { useAuth } from '../../features/auth';

export default function RoleRejectedScreen() {
  const { clearSession } = useAuth();

  const goLogin = async () => {
    await clearSession('logout');
    router.replace('/(auth)/login');
  };

  return (
    <AuthShell title="Tài khoản không được hỗ trợ" subtitle="Ứng dụng này dành cho học viên.">
      <Feedback kind="info" message="Vui lòng sử dụng tài khoản học viên để tiếp tục." />
      <PrimaryButton label="Về đăng nhập" onPress={() => void goLogin()} />
      <TextLink label="Thoát" onPress={() => void goLogin()} />
    </AuthShell>
  );
}
