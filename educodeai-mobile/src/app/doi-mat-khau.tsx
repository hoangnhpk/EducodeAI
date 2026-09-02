import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../features/auth';
import { getApiErrorMessage } from '../shared/lib/api-error';
import { colors, spacing, touchTarget } from '../shared/theme/tokens';

export default function ChangePasswordScreen() {
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (newPassword.length < 8 || newPassword !== confirm) {
      setError('Mật khẩu mới cần ít nhất 8 ký tự và phải trùng khớp.');
      return;
    }
    setBusy(true); setError(null);
    try {
      await authService.changePassword({ MatKhauCu: oldPassword, MatKhauMoi: newPassword });
      setError('Đổi mật khẩu thành công. Phiên hiện tại vẫn được giữ.');
      setOld(''); setNew(''); setConfirm('');
    } catch (e) { setError(getApiErrorMessage(e)); } finally { setBusy(false); }
  };
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.content}>
    <Text style={styles.title}>Đổi mật khẩu</Text>
    <TextInput accessibilityLabel="Mật khẩu hiện tại" secureTextEntry value={oldPassword} onChangeText={setOld} placeholder="Mật khẩu hiện tại" style={styles.input} />
    <TextInput accessibilityLabel="Mật khẩu mới" secureTextEntry value={newPassword} onChangeText={setNew} placeholder="Mật khẩu mới" style={styles.input} />
    <TextInput accessibilityLabel="Xác nhận mật khẩu mới" secureTextEntry value={confirm} onChangeText={setConfirm} placeholder="Xác nhận mật khẩu mới" style={styles.input} />
    {error ? <Text style={error.includes('thành công') ? styles.success : styles.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void submit(); }} style={styles.button}><Text style={styles.buttonText}>{busy ? 'Đang xử lý...' : 'Đổi mật khẩu'}</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.link}><Text style={styles.linkText}>Quay lại</Text></Pressable>
  </View></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ flex: { flex: 1 }, safe: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.xl, gap: spacing.md }, title: { fontSize: 28, fontWeight: '700', color: colors.text }, input: { minHeight: touchTarget, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, backgroundColor: colors.surface }, button: { minHeight: touchTarget, backgroundColor: colors.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: colors.surface, fontWeight: '700' }, link: { minHeight: touchTarget, alignItems: 'center', justifyContent: 'center' }, linkText: { color: colors.primaryDark }, error: { color: colors.danger }, success: { color: colors.success } });
