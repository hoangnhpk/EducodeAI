import React, { useState, useContext, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, TextInput, StatusBar, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

const COLORS = {
  primary: '#fb873f',
  primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  glow: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 }
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.hoTen || '');
      setEmail(user.email || '');
      setPhone((user as any).soDienThoai || '');
    }
  }, [user]);

  const handleSave = () => {
    // Gọi API update user info tại đây
    Alert.alert('Thành công', 'Đã lưu thay đổi hồ sơ.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa Hồ sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: user?.anhDaiDien || `https://ui-avatars.com/api/?name=${user?.hoTen || 'Khach'}&background=fb873f&color=fff&size=120` }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={[styles.cameraBtn, SHADOWS.small]} onPress={() => Alert.alert('Đổi Ảnh', 'Tính năng chọn ảnh từ thư viện đang phát triển.')}>
              <Ionicons name="camera" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Chạm để đổi ảnh đại diện</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ Email</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputBox}>
              <Ionicons name="call-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
          </View>

          <TouchableOpacity style={styles.changePassBtn} onPress={() => Alert.alert('Đổi Mật Khẩu', 'Chuyển sang trang Đổi mật khẩu.')}>
            <Text style={styles.changePassText}>Đổi mật khẩu?</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity activeOpacity={0.8} style={[styles.saveBtnWrapper, SHADOWS.glow]} onPress={handleSave}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  container: { flex: 1 },

  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: COLORS.white },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white },
  avatarHint: { marginTop: 15, fontSize: 14, color: COLORS.gray },

  formContainer: { paddingHorizontal: 20, backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 30, paddingBottom: 100, ...SHADOWS.small, flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.dark, marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 14, height: 55, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.dark },
  
  changePassBtn: { alignSelf: 'flex-end', marginTop: 5 },
  changePassText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, paddingHorizontal: 20, paddingTop: 15, paddingBottom: 30, borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  saveBtnWrapper: { borderRadius: 16, overflow: 'hidden' },
  saveBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' }
});
