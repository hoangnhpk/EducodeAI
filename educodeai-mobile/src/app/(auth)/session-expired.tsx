import { router } from 'expo-router';
import { AuthShell, Feedback, PrimaryButton } from '../../features/auth/components/auth-ui';
export default function SessionExpiredScreen() { return <AuthShell title="Phiên đăng nhập đã hết hạn" subtitle="Vui lòng đăng nhập lại để tiếp tục."><Feedback kind="info" message="Phiên hiện tại không còn hợp lệ." /><PrimaryButton label="Đăng nhập lại" onPress={() => router.replace('/(auth)/login')} /></AuthShell>; }
