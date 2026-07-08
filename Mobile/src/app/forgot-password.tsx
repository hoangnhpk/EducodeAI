import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, TextInput, StatusBar, ImageBackground, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#fb873f',
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
  success: '#10b981',
};

const SHADOWS = {
  large: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 15 },
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
              <TouchableOpacity style={styles.backBtn} onPress={() => {
                if (step > 1) setStep((prev) => (prev - 1) as any);
                else router.back();
              }}>
                <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
              </TouchableOpacity>

              {/* Header Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name={step === 1 ? "mail-open" : step === 2 ? "keypad" : "shield-checkmark"} size={40} color={COLORS.primary} />
                </View>
              </View>

              {/* Header Text */}
              <View style={styles.header}>
                <Text style={styles.title}>
                  {step === 1 ? 'Khôi phục mật khẩu' : step === 2 ? 'Xác thực OTP' : 'Mật khẩu mới'}
                </Text>
                <Text style={styles.subtitle}>
                  {step === 1 
                    ? 'Nhập địa chỉ email của bạn để nhận mã xác thực.' 
                    : step === 2 
                    ? `Mã 6 chữ số đã được gửi đến:\n${email}`
                    : 'Vui lòng tạo một mật khẩu mới đủ mạnh.'}
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                
                {step === 1 && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email liên kết</Text>
                    <View style={styles.inputBox}>
                      <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.icon} />
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
                )}

                {step === 2 && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { textAlign: 'center', marginBottom: 15 }]}>Nhập mã OTP</Text>
                    <View style={styles.otpContainer}>
                      <TextInput 
                        style={styles.otpInput} 
                        placeholder="------" 
                        placeholderTextColor={COLORS.lightGray}
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                      />
                    </View>
                  </View>
                )}

                {step === 3 && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mật khẩu mới</Text>
                    <View style={styles.inputBox}>
                      <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.icon} />
                      <TextInput 
                        style={styles.input} 
                        placeholder="Nhập mật khẩu mới" 
                        placeholderTextColor={COLORS.gray}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                        <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.gray} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.submitBtn} 
                  onPress={() => {
                    if (step === 1 && email) setStep(2);
                    else if (step === 2 && otp.length === 6) setStep(3);
                    else if (step === 3 && newPassword) router.push('/login');
                  }}
                >
                  <Text style={styles.submitBtnText}>
                    {step === 1 ? 'Gửi mã xác thực' : step === 2 ? 'Xác nhận' : 'Lưu mật khẩu'}
                  </Text>
                </TouchableOpacity>

                {step === 2 && (
                  <TouchableOpacity style={styles.resendBtn}>
                    <Text style={styles.resendText}>Chưa nhận được mã? Gửi lại (59s)</Text>
                  </TouchableOpacity>
                )}
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

  iconContainer: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },

  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.dark, marginBottom: 10 },
  subtitle: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 22 },

  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark, marginBottom: 8, marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, backgroundColor: COLORS.bg, height: 50, paddingHorizontal: 15 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.dark },
  eyeBtn: { padding: 5 },
  
  otpContainer: { alignItems: 'center' },
  otpInput: { fontSize: 32, fontWeight: '800', letterSpacing: 8, color: COLORS.primary, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.primary, paddingBottom: 10, width: 200 },

  submitBtn: { width: '100%', height: 50, backgroundColor: COLORS.primary, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  resendBtn: { marginTop: 20, alignItems: 'center' },
  resendText: { fontSize: 13, color: COLORS.gray, fontWeight: '500' }
});
