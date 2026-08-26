import { router } from 'expo-router';
import { AuthShell, Feedback, PrimaryButton } from '../../features/auth/components/auth-ui';
import { useAuth } from '../../features/auth';

export default function SessionExpiredScreen() {
  const { clearSession } = useAuth();

  const goLogin = async () => {
    // Phải hạ status khỏi sessionExpired, không thì Guard sẽ kéo lại màn này.
    await clearSession('logout');
    router.replace('/(auth)/login');
  };

  return (
    <AuthShell title="Phiên đăng nhập đã hết hạn" subtitle="Vui lòng đăng nhập lại để tiếp tục.">
      <Feedback kind="info" message="Phiên hiện tại không còn hợp lệ." />
      <PrimaryButton label="Đăng nhập lại" onPress={() => void goLogin()} />
    </AuthShell>
  );
}
