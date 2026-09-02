import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AccountScreen, StateMessage, accountColors } from '../components/account-ui';
import { AccountService } from '../services/account.service';
import type { PickProfileImage } from '../services/profile-image-picker';
import { pickProfileImage } from '../services/profile-image-picker';
import type { ProfileImageFile, StudentProfile } from '../types/account.types';
import { getAccountErrorMessage } from '../types/account.types';

export interface ProfileScreenProps { pickImage?: PickProfileImage }

export default function ProfileScreen({ pickImage = pickProfileImage }: ProfileScreenProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [image, setImage] = useState<ProfileImageFile>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await AccountService.getProfile(); setProfile(data); setFullName(data.hoTen ?? ''); }
    catch (e) { setError(getAccountErrorMessage(e, 'Không thể tải hồ sơ.')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const chooseImage = async () => {
    try {
      const selected = await pickImage();
      if (selected) setImage(selected);
    } catch (error) {
      Alert.alert('Không thể chọn ảnh', getAccountErrorMessage(error, error instanceof Error ? error.message : 'Vui lòng thử lại.'));
    }
  };
  const save = async () => {
    if (saving) return;
    if (fullName.trim().length < 2) { Alert.alert('Thông tin chưa hợp lệ', 'Họ tên phải có ít nhất 2 ký tự.'); return; }
    setSaving(true);
    try { const updated = await AccountService.updateProfile(fullName, image); setProfile(updated); setImage(undefined); Alert.alert('Thành công', 'Đã cập nhật hồ sơ.'); }
    catch (e) { Alert.alert('Không thể cập nhật', getAccountErrorMessage(e, 'Vui lòng thử lại.')); }
    finally { setSaving(false); }
  };

  if (loading) return <AccountScreen title="Hồ sơ"><StateMessage loading message="Đang tải hồ sơ…" /></AccountScreen>;
  if (error || !profile) return <AccountScreen title="Hồ sơ"><StateMessage message={error || 'Không có dữ liệu hồ sơ.'} onRetry={() => void load()} /></AccountScreen>;
  const avatar = image?.uri ?? profile.anhDaiDien;
  return (
    <AccountScreen title="Hồ sơ cá nhân">
      <View style={styles.card}>
        {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} accessibilityLabel="Ảnh đại diện" /> : <View style={styles.avatarEmpty}><Text style={styles.initial}>{fullName.trim().charAt(0).toUpperCase() || '?'}</Text></View>}
        <Pressable accessibilityRole="button" onPress={() => void chooseImage()} style={styles.secondary}><Text style={styles.secondaryText}>Chọn ảnh đại diện</Text></Pressable>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput accessibilityLabel="Họ và tên" value={fullName} onChangeText={setFullName} autoCapitalize="words" maxLength={100} style={styles.input} />
        {profile.email ? <><Text style={styles.label}>Email</Text><Text style={styles.readonly}>{profile.email}</Text></> : null}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving }} disabled={saving} onPress={() => void save()} style={[styles.primary, saving && styles.disabled]}><Text style={styles.primaryText}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</Text></Pressable>
      </View>
    </AccountScreen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: accountColors.card, borderRadius: 24, padding: 20, alignItems: 'stretch' },
  avatar: { width: 104, height: 104, borderRadius: 52, alignSelf: 'center', backgroundColor: accountColors.border },
  avatarEmpty: { width: 104, height: 104, borderRadius: 52, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: accountColors.primaryLight },
  initial: { color: accountColors.primary, fontSize: 38, fontWeight: '900' }, secondary: { alignSelf: 'center', padding: 12, marginBottom: 16 }, secondaryText: { color: accountColors.primary, fontWeight: '800' },
  label: { color: accountColors.text, fontWeight: '700', marginTop: 12, marginBottom: 7 },
  input: { borderWidth: 1, borderColor: accountColors.border, borderRadius: 14, minHeight: 50, paddingHorizontal: 14, color: accountColors.text, fontSize: 16 }, readonly: { color: accountColors.muted, backgroundColor: accountColors.background, borderRadius: 14, padding: 15 },
  primary: { backgroundColor: accountColors.primary, borderRadius: 14, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 24 }, primaryText: { color: '#fff', fontWeight: '900', fontSize: 16 }, disabled: { opacity: 0.55 },
});
