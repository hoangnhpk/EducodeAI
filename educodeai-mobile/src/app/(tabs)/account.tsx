import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../features/auth';
import { colors, spacing, touchTarget } from '../../shared/theme/tokens';

export default function AccountScreen() {
  const { user, logout } = useAuth();
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Tài khoản</Text>
    {user ? <View style={styles.card}><Text style={styles.name}>{user.hoTen}</Text><Text style={styles.muted}>{user.email}</Text></View> : <Text style={styles.muted}>Không tìm thấy thông tin người dùng.</Text>}
    <Menu label="Hồ sơ cá nhân" onPress={() => router.push('/ho-so')} />
    <Menu label="Đổi mật khẩu" onPress={() => router.push('/doi-mat-khau')} />
    <Menu label="Quản lý thiết bị" onPress={() => router.push('/quan-ly-thiet-bi')} />
    <Menu label="Đăng xuất" danger onPress={() => { void logout(); }} />
  </ScrollView></SafeAreaView>;
}
function Menu({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) { return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.menu, danger && styles.danger]}><Text style={[styles.menuText, danger && styles.dangerText]}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.xl, gap: spacing.md }, title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.md }, card: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.xl, borderWidth: 1, borderColor: colors.border }, name: { fontSize: 20, fontWeight: '700', color: colors.text }, muted: { color: colors.textMuted, marginTop: 4 }, menu: { minHeight: touchTarget, justifyContent: 'center', padding: spacing.md, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border }, menuText: { color: colors.text, fontSize: 16, fontWeight: '600' }, danger: { borderColor: colors.danger }, dangerText: { color: colors.danger } });
