import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AccountScreen, accountColors } from '../components/account-ui';
import { useAuth } from '../../auth/hooks/use-auth';
import { getAccountErrorMessage } from '../types/account.types';

export interface AccountHomeScreenProps { onLogout?: () => void | Promise<void> }
export default function AccountHomeScreen({ onLogout }: AccountHomeScreenProps) {
  const router = useRouter(); const { logout: logoutSession } = useAuth(); const [loggingOut, setLoggingOut] = useState(false);
  const logout = async () => { if (loggingOut) return; setLoggingOut(true); try { await logoutSession(); await onLogout?.(); Alert.alert('Đã đăng xuất', 'Phiên hiện tại đã được thu hồi.'); } catch (e) { Alert.alert('Đã đăng xuất', getAccountErrorMessage(e, 'Đã xóa phiên trên thiết bị.')); } finally { setLoggingOut(false); } };
  return <AccountScreen title="Tài khoản"><View style={styles.card}>
    <Menu icon="person-outline" label="Hồ sơ cá nhân" onPress={() => router.push('/ho-so')} />
    <Menu icon="key-outline" label="Đổi mật khẩu" onPress={() => router.push('/doi-mat-khau')} />
    <Menu icon="phone-portrait-outline" label="Quản lý thiết bị" onPress={() => router.push('/quan-ly-thiet-bi')} />
  </View><Pressable accessibilityRole="button" accessibilityState={{ disabled: loggingOut }} disabled={loggingOut} onPress={() => void logout()} style={[styles.logout, loggingOut && styles.disabled]}><Ionicons name="log-out-outline" size={22} color={accountColors.danger} /><Text style={styles.logoutText}>{loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất thiết bị này'}</Text></Pressable></AccountScreen>;
}
function Menu({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={styles.menu}><View style={styles.icon}><Ionicons name={icon} size={22} color={accountColors.primary} /></View><Text style={styles.label}>{label}</Text><Ionicons name="chevron-forward" size={20} color={accountColors.muted} /></Pressable>; }
const styles = StyleSheet.create({ card: { backgroundColor: accountColors.card, borderRadius: 22, overflow: 'hidden' }, menu: { minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: accountColors.border }, icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: accountColors.primaryLight, alignItems: 'center', justifyContent: 'center' }, label: { flex: 1, color: accountColors.text, fontSize: 16, fontWeight: '700', marginLeft: 13 }, logout: { minHeight: 56, marginTop: 20, borderRadius: 16, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fff', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, logoutText: { color: accountColors.danger, fontWeight: '800' }, disabled: { opacity: .5 } });
