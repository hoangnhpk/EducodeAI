import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, ActivityIndicator, Alert, Platform, StatusBar, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import api from '../configs/api';
import { AnimatedPressable } from '../components/animated-pressable';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
};

const SHADOWS = {
  small: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  medium: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  glow: { shadowColor: '#fb873f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }
};

export default function SinhDoAnScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  const [mucTieu, setMucTieu] = useState('Backend Developer (Node.js)');
  const [ngonNgu, setNgonNgu] = useState('ReactJS, NodeJS, MongoDB');
  const [capDo, setCapDo] = useState('Thực tế');

  const handleGenerate = async () => {
    if (!mucTieu || !ngonNgu || !capDo) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin!');
      return;
    }
    setStatus('loading');
    try {
      const response = await api.post('/SinhDoAnAI/generate', { mucTieuNgheNghiep: mucTieu, ngonNguCongNghe: ngonNgu, capDo: capDo });
      if (response.data && response.data.sessionId) {
        router.push({ pathname: '/ket-qua-do-an', params: { sessionId: response.data.sessionId } });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể sinh đồ án. Thử lại sau.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Sinh Đồ Án Bằng AI</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={[styles.heroCard, SHADOWS.medium]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>EducodeAI Tech Lead</Text>
              <Text style={styles.heroDesc}>Nhập công nghệ bạn muốn, tôi sẽ lên kiến trúc, thiết kế DB và chia task cho bạn như một Tech Lead thực thụ.</Text>
            </View>
            <Ionicons name="cube" size={60} color="#4f46e5" style={{ opacity: 0.8 }} />
          </LinearGradient>

          <View style={[styles.formContainer, SHADOWS.small]}>
            <Text style={styles.label}>Mục tiêu nghề nghiệp:</Text>
            <TextInput style={styles.input} value={mucTieu} onChangeText={setMucTieu} placeholder="VD: Fullstack Developer" placeholderTextColor={COLORS.gray} />

            <Text style={styles.label}>Công nghệ / Ngôn ngữ:</Text>
            <TextInput style={styles.input} value={ngonNgu} onChangeText={setNgonNgu} placeholder="VD: ReactJS, .NET Core" placeholderTextColor={COLORS.gray} />

            <Text style={styles.label}>Cấp độ dự án:</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={capDo} onValueChange={(itemValue) => setCapDo(itemValue)} style={styles.picker}>
                <Picker.Item label="Cơ bản (Đồ án môn học)" value="Cơ bản" />
                <Picker.Item label="Trung bình (Đồ án tốt nghiệp)" value="Trung bình" />
                <Picker.Item label="Thực tế (Clone hệ thống lớn)" value="Thực tế" />
              </Picker>
            </View>

            <AnimatedPressable style={[styles.generateBtnWrapper, status === 'loading' && { opacity: 0.7 }]} onPress={handleGenerate} disabled={status === 'loading'}>
              <LinearGradient colors={COLORS.primaryGradient} style={styles.generateBtn}>
                {status === 'loading' ? <ActivityIndicator color={COLORS.white} /> : (
                  <>
                    <Ionicons name="sparkles" size={20} color={COLORS.white} />
                    <Text style={styles.generateBtnText}>Sinh Đồ Án AI</Text>
                  </>
                )}
              </LinearGradient>
            </AnimatedPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'rgba(248, 250, 252, 0.9)' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  contentContainer: { padding: 20 },
  heroCard: { flexDirection: 'row', padding: 25, borderRadius: 24, marginBottom: 25, alignItems: 'center', overflow: 'hidden' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#312e81', marginBottom: 8, letterSpacing: -0.5 },
  heroDesc: { fontSize: 14, color: '#4338ca', lineHeight: 22, paddingRight: 10 },
  formContainer: { backgroundColor: COLORS.white, padding: 25, borderRadius: 28 },
  label: { fontSize: 15, fontWeight: '800', color: COLORS.dark, marginBottom: 10 },
  input: { backgroundColor: COLORS.bg, borderRadius: 16, paddingHorizontal: 16, height: 56, fontSize: 16, color: COLORS.dark, marginBottom: 20, borderWidth: 1, borderColor: COLORS.lightGray },
  pickerContainer: { backgroundColor: COLORS.bg, borderRadius: 16, overflow: 'hidden', marginBottom: 30, borderWidth: 1, borderColor: COLORS.lightGray },
  picker: { height: 56, width: '100%', color: COLORS.dark },
  generateBtnWrapper: { borderRadius: 20, overflow: 'hidden', ...SHADOWS.glow },
  generateBtn: { flexDirection: 'row', height: 60, justifyContent: 'center', alignItems: 'center' },
  generateBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '900', marginLeft: 8 }
});
