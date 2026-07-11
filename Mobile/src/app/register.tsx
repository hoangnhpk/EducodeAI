import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, TextInput, StatusBar, ImageBackground, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../configs/api';

const COLORS = {
  primary: '#fb873f',
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
};

const SHADOWS = {
  large: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 15 },
};

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin bắt buộc!');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/XacThuc/dang-ky', {
        HoTen: name,
        Email: email,
        MatKhau: password,
        CaptchaToken: "SKIP_CAPTCHA", // Bypass for mobile or implement logic
      });
      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác nhận.');
      // Có thể chuyển hướng sang trang OTP nếu có, tạm thời về Login
      router.back();
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đăng ký. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000' }} 
      style={styles.background}
    >
      <View style={styles.overlay} />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={[styles.card, SHADOWS.large]}>
              {/* Back Button */}
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Đăng ký tài khoản</Text>
                <Text style={styles.subtitle}>Bắt đầu hành trình cùng EducodeAI</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                
                {/* Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Họ và tên</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="person-outline" size={20} color={COLORS.gray} style={styles.icon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Nhập họ và tên" 
                      placeholderTextColor={COLORS.gray}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Địa chỉ Email</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.icon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Nhập địa chỉ email" 
                      placeholderTextColor={COLORS.gray}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="call-outline" size={20} color={COLORS.gray} style={styles.icon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Nhập số điện thoại" 
                      placeholderTextColor={COLORS.gray}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.icon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Nhập mật khẩu" 
                      placeholderTextColor={COLORS.gray}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Xác nhận mật khẩu</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.icon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Nhập lại mật khẩu" 
                      placeholderTextColor={COLORS.gray}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.loginBtn} onPress={handleRegister} disabled={loading}>
                  <Text style={styles.loginBtnText}>{loading ? 'Đang xử lý...' : 'Tạo tài khoản'}</Text>
                </TouchableOpacity>
              </View>

              {/* Login Hint */}
              <View style={styles.bottomRow}>
                <Text style={styles.loginHint}>
                  Đã có tài khoản?{' '}
                  <Text style={styles.loginLink} onPress={() => router.push('/login')}>
                    Đăng nhập
                  </Text>
                </Text>
              </View>

            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.65)' },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  card: { width: '100%', maxWidth: 500, backgroundColor: COLORS.white, borderRadius: 24, padding: 25, marginTop: 40, position: 'relative' },
  
  backBtn: { position: 'absolute', top: 20, left: 20, zIndex: 10, padding: 5 },

  header: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.dark, marginBottom: 5 },
  subtitle: { fontSize: 14, color: COLORS.gray },

  form: { width: '100%' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark, marginBottom: 8, marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, backgroundColor: COLORS.bg, height: 50, paddingHorizontal: 15 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.dark },
  eyeBtn: { padding: 5 },
  
  loginBtn: { width: '100%', height: 50, backgroundColor: COLORS.primary, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  bottomRow: { alignItems: 'center', marginTop: 25 },
  loginHint: { fontSize: 14, color: COLORS.dark },
  loginLink: { fontWeight: '700', color: COLORS.primary },
});
