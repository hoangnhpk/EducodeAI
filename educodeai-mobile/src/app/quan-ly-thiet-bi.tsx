import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { accountOperations, accountService, type DeviceSession } from '../features/account';
import { getApiErrorMessage } from '../shared/lib/api-error';
import { getDeviceMetadata } from '../shared/lib/device-metadata';
import { colors, spacing, touchTarget } from '../shared/theme/tokens';

export default function DevicesScreen() {
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const operation = accountOperations.nextDevices();
    setError(null);
    try {
      const current = await getDeviceMetadata();
      const result = await accountService.listDevices(current.maThietBi);
      if (accountOperations.isCurrentDevices(operation)) {
        setDevices(result.map((item) => ({
          ...item,
          isCurrentDevice: Boolean(item.isCurrentDevice || item.maThietBi === current.maThietBi),
        })));
      }
    } catch (cause) {
      if (accountOperations.isCurrentDevices(operation)) setError(getApiErrorMessage(cause));
    }
  };

  useEffect(() => { void load(); }, []);

  const requestOtp = async () => {
    setBusy(true); setError(null); setMessage(null);
    try { await accountService.requestRemoteLogoutOtp(); setMessage('Mã OTP đã được gửi.'); }
    catch (cause) { setError(getApiErrorMessage(cause)); }
    finally { setBusy(false); }
  };

  const confirm = async (all: boolean) => {
    if (!/^\d{6}$/.test(otp)) { setError('OTP phải gồm 6 chữ số.'); return; }
    setBusy(true); setError(null); setMessage(null);
    try {
      await accountService.confirmRemoteLogout({ otpCode: otp, dangXuatTatCa: all, danhSachMaPhien: all ? undefined : selected });
      setMessage('Đã đăng xuất các phiên đã chọn. Phiên hiện tại vẫn được giữ.');
      setOtp(''); setSelected([]); await load();
    } catch (cause) { setError(getApiErrorMessage(cause)); }
    finally { setBusy(false); }
  };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Quản lý thiết bị</Text>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {message ? <Text style={styles.success}>{message}</Text> : null}
    {devices.length === 0 ? <Text style={styles.muted}>Chưa có phiên thiết bị khác.</Text> : devices.map((device) => {
      const checked = selected.includes(device.maPhien);
      return <Pressable key={String(device.maPhien)} disabled={device.isCurrentDevice} onPress={() => setSelected((items) => checked ? items.filter((id) => id !== device.maPhien) : [...items, device.maPhien])} style={[styles.device, device.isCurrentDevice && styles.current]}>
        <Text style={styles.deviceName}>{device.tenThietBi ?? 'Thiết bị'}</Text>
        <Text style={styles.muted}>{device.isCurrentDevice ? 'Thiết bị hiện tại' : checked ? 'Đã chọn đăng xuất' : 'Chạm để chọn'}</Text>
      </Pressable>;
    })}
    <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void requestOtp(); }} style={styles.button}><Text style={styles.buttonText}>Gửi OTP đăng xuất từ xa</Text></Pressable>
    <Text style={styles.hint}>Nhập OTP từ email để xác nhận.</Text>
    <TextInput accessibilityLabel="OTP đăng xuất từ xa" value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={6} style={styles.input} />
    <Pressable accessibilityRole="button" disabled={busy || selected.length === 0} onPress={() => { void confirm(false); }} style={styles.button}><Text style={styles.buttonText}>Đăng xuất phiên đã chọn</Text></Pressable>
    <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void confirm(true); }} style={styles.secondary}><Text style={styles.secondaryText}>Đăng xuất tất cả phiên khác</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.link}><Text style={styles.linkText}>Quay lại</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.xl, gap: spacing.md }, title: { fontSize: 28, fontWeight: '700', color: colors.text }, device: { padding: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, current: { borderColor: colors.primary }, deviceName: { fontWeight: '700', color: colors.text }, muted: { color: colors.textMuted }, error: { color: colors.danger }, success: { color: colors.success }, hint: { color: colors.textMuted }, input: { minHeight: touchTarget, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, backgroundColor: colors.surface }, button: { minHeight: touchTarget, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', padding: spacing.md }, buttonText: { color: colors.surface, fontWeight: '700' }, secondary: { minHeight: touchTarget, borderRadius: 10, borderWidth: 1, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center', padding: spacing.md }, secondaryText: { color: colors.primaryDark, fontWeight: '700' }, link: { minHeight: touchTarget, justifyContent: 'center', alignItems: 'center' }, linkText: { color: colors.primaryDark } });
