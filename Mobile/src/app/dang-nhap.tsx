import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONT, RADIUS, SHADOWS } from '../configs/theme';
import { AnimatedPressable } from '../components/animated-pressable';
import api from '../configs/api';

export default function DangNhapScreen() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/XacThuc/dang-nhap', {
        email,
        matKhau: password,
      });

      if (res.data && res.data.token) {
        await login(res.data.token, res.data.nguoiDung);
        router.replace('/trang-chu');
      } else {
        Alert.alert('Đăng nhập thất bại', 'Không nhận được token từ máy chủ');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Email hoặc mật khẩu không đúng!';
      Alert.alert('Đăng nhập thất bại', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={[COLORS.darkBg, COLORS.dark]} style={StyleSheet.absoluteFillObject} />
      
      <View style={styles.content}>
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="hardware-chip" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Educode<Text style={{color: COLORS.primary}}>AI</Text></Text>
          <Text style={styles.subtitle}>Nền tảng học lập trình thông minh</Text>
        </View>

        {/* Login Form */}
        <BlurView intensity={20} tint="dark" style={styles.formContainer}>
          <Text style={styles.formTitle}>Đăng Nhập</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.grayLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn"
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
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.grayLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <AnimatedPressable style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.grayLight} />
              </AnimatedPressable>
            </View>
          </View>

          <AnimatedPressable 
            style={styles.loginBtnWrapper} 
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient colors={COLORS.primaryGradient} style={styles.loginBtn}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginBtnText}>Bắt đầu ngay</Text>
              )}
            </LinearGradient>
          </AnimatedPressable>
        </BlurView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: {
    width: 90, height: 90, borderRadius: 25, 
    backgroundColor: 'rgba(251, 135, 63, 0.1)', 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(251, 135, 63, 0.3)'
  },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.white, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: COLORS.grayLight, marginTop: 8 },
  formContainer: {
    padding: 24, borderRadius: RADIUS.card, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.darkBorder,
    backgroundColor: 'rgba(30, 41, 59, 0.5)'
  },
  formTitle: { fontSize: 24, fontWeight: '800', color: COLORS.white, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.grayLight, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.darkBg, borderRadius: RADIUS.input,
    borderWidth: 1, borderColor: COLORS.darkBorder,
    height: 56, paddingHorizontal: 16
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: COLORS.white, fontSize: 16, height: '100%' },
  eyeIcon: { padding: 4 },
  loginBtnWrapper: { marginTop: 10, borderRadius: RADIUS.button, overflow: 'hidden', ...SHADOWS.glow },
  loginBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});
