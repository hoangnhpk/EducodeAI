import { router } from 'expo-router';
import { AuthShell, Feedback, PrimaryButton, TextLink } from '../../features/auth/components/auth-ui';
export default function RoleRejectedScreen() { return <AuthShell title="Tài khoản không được hỗ trợ" subtitle="Ứng dụng này dành cho học viên."><Feedback kind="info" message="Vui lòng sử dụng tài khoản học viên để tiếp tục." /><PrimaryButton label="Về đăng nhập" onPress={() => router.replace('/(auth)/login')} /><TextLink label="Thoát" onPress={() => router.back()} /></AuthShell>; }
