import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AccountScreen, accountColors } from '../components/account-ui';
import { AccountService } from '../services/account.service';
import { getAccountErrorMessage } from '../types/account.types';

export default function ChangePasswordScreen() {
  const [current, setCurrent] = useState(''); const [next, setNext] = useState(''); const [confirm, setConfirm] = useState(''); const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    if (submitting) return;
    if (!current) return Alert.alert('Thiếu thông tin', 'Vui lòng nhập mật khẩu hiện tại.');
    if (next.length < 8) return Alert.alert('Mật khẩu chưa hợp lệ', 'Mật khẩu mới phải có ít nhất 8 ký tự.');
    if (next === current) return Alert.alert('Mật khẩu chưa hợp lệ', 'Mật khẩu mới phải khác mật khẩu hiện tại.');
    if (next !== confirm) return Alert.alert('Mật khẩu chưa khớp', 'Xác nhận mật khẩu mới không trùng khớp.');
    setSubmitting(true);
    try { await AccountService.changePassword(current, next); setCurrent(''); setNext(''); setConfirm(''); Alert.alert('Thành công', 'Mật khẩu đã được thay đổi.'); }
    catch (e) { Alert.alert('Không thể đổi mật khẩu', getAccountErrorMessage(e, 'Vui lòng kiểm tra và thử lại.')); }
    finally { setSubmitting(false); }
  };
  return <AccountScreen title="Đổi mật khẩu"><View style={styles.card}>
    <PasswordField label="Mật khẩu hiện tại" value={current} onChangeText={setCurrent} />
    <PasswordField label="Mật khẩu mới" value={next} onChangeText={setNext} />
    <Text style={styles.hint}>Tối thiểu 8 ký tự và khác mật khẩu hiện tại.</Text>
    <PasswordField label="Xác nhận mật khẩu mới" value={confirm} onChangeText={setConfirm} />
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: submitting }} disabled={submitting} onPress={() => void submit()} style={[styles.button, submitting && styles.disabled]}><Text style={styles.buttonText}>{submitting ? 'Đang cập nhật…' : 'Đổi mật khẩu'}</Text></Pressable>
  </View></AccountScreen>;
}
function PasswordField({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return <View><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" style={styles.input} /></View>;
}
const styles = StyleSheet.create({ card: { backgroundColor: accountColors.card, padding: 20, borderRadius: 24 }, label: { color: accountColors.text, fontWeight: '700', marginTop: 10, marginBottom: 7 }, input: { minHeight: 52, borderWidth: 1, borderColor: accountColors.border, borderRadius: 14, paddingHorizontal: 14, color: accountColors.text }, hint: { color: accountColors.muted, fontSize: 12, marginTop: 7 }, button: { minHeight: 52, borderRadius: 14, backgroundColor: accountColors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 26 }, buttonText: { color: '#fff', fontWeight: '900', fontSize: 16 }, disabled: { opacity: .55 } });
