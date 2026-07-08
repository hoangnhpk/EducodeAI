import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, TextInput, StatusBar, ImageBackground, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = React.useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập tài khoản và mật khẩu!');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/XacThuc/dang-nhap', {
        TaiKhoan: email,
        MatKhau: password,
        CaptchaToken: "SKIP_CAPTCHA", // Bypass captcha in mobile
        MaThietBi: `Mobile_${Platform.OS}_${Date.now()}`,
        TenThietBi: `Mobile App ${Platform.OS}`
      });

      if (response.data.requiresCaptcha) {
        Alert.alert('Lỗi', response.data.message);
        setLoading(false);
        return;
      }

      await login(response.data.token, response.data.thongTinNguoiDung);
      Alert.alert('Thành công', 'Đăng nhập thành công!');
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể kết nối đến máy chủ.');
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
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>
                  EDUCODE<Text style={{ color: COLORS.primary }}>AI</Text>
                </Text>
                <Text style={styles.title}>Đăng nhập</Text>
                <Text style={styles.subtitle}>Truy cập vào hệ thống EducodeAI</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email của bạn</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.icon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Tài khoản hoặc Email" 
                      placeholderTextColor={COLORS.gray}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.icon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Mật khẩu" 
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

                <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push('/forgot-password')}>
                  <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                  <Text style={styles.loginBtnText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
                </TouchableOpacity>
              </View>

              {/* Social Login */}
              <View style={styles.dividerBox}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-google" size={20} color="#DB4437" />
                  <Text style={styles.socialBtnText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                  <Text style={styles.socialBtnText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              {/* Navigate Register */}
              <View style={styles.bottomRow}>
                <TouchableOpacity onPress={() => router.push('/')} style={styles.homeLink}>
                  <Ionicons name="home" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.homeLinkText}>Trang chủ</Text>
                </TouchableOpacity>
                <Text style={styles.registerHint}>
                  Chưa có tài khoản?{' '}
                  <Text style={styles.registerLink} onPress={() => router.push('/register')}>
                    Đăng ký ngay
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
  
  card: { width: '100%', maxWidth: 500, backgroundColor: COLORS.white, borderRadius: 24, padding: 25, marginTop: 40 },
  
  logoContainer: { alignItems: 'center', marginBottom: 25 },
  logoText: { fontSize: 26, fontWeight: '900', color: COLORS.dark, letterSpacing: 1, marginBottom: 15 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.dark, marginBottom: 5 },
  subtitle: { fontSize: 14, color: COLORS.gray },

  form: { width: '100%' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark, marginBottom: 8, marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, backgroundColor: COLORS.bg, height: 50, paddingHorizontal: 15 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.dark },
  eyeBtn: { padding: 5 },
  
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  
  loginBtn: { width: '100%', height: 50, backgroundColor: COLORS.primary, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  dividerBox: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
  dividerText: { marginHorizontal: 15, fontSize: 12, color: COLORS.gray },

  socialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  socialBtn: { flex: 1, flexDirection: 'row', height: 44, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  socialBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.dark, marginLeft: 8 },

  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  homeLink: { flexDirection: 'row', alignItems: 'center' },
  homeLinkText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  registerHint: { fontSize: 13, color: COLORS.dark },
  registerLink: { fontWeight: '700', color: COLORS.primary },
});
