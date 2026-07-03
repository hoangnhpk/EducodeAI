import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, TextInput, StatusBar, Animated, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a',
  darkLight: '#1e293b',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
  success: '#10b981',
  danger: '#ef4444',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  glow: { shadowColor: COLORS.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 }
};

export default function PhongVanScreen() {
  const router = useRouter();
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [viTri, setViTri] = useState('React Native Developer');
  const [capDo, setCapDo] = useState('Junior');
  
  // Animation cho sóng âm khi phỏng vấn
  const [waveAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isInterviewing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1.3, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    } else {
      waveAnim.setValue(1);
    }
  }, [isInterviewing]);

  const renderSetup = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.iconWrapper}>
        <LinearGradient colors={['#dcfce7', '#bbf7d0']} style={styles.iconGradient}>
          <Ionicons name="mic" size={40} color={COLORS.success} />
        </LinearGradient>
      </View>
      <Text style={styles.descText}>Trải nghiệm phỏng vấn 1-1 với Tech Lead AI. Bạn sẽ được chấm điểm và nhận feedback chi tiết.</Text>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vị trí ứng tuyển</Text>
          <TextInput
            style={styles.textInput}
            value={viTri}
            onChangeText={setViTri}
            placeholder="VD: React Native Developer"
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Trình độ</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity style={[styles.radioBtn, capDo === 'Intern' && styles.radioBtnActive]} onPress={() => setCapDo('Intern')}>
              <Text style={[styles.radioText, capDo === 'Intern' && styles.radioTextActive]}>Intern</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.radioBtn, capDo === 'Junior' && styles.radioBtnActive]} onPress={() => setCapDo('Junior')}>
              <Text style={[styles.radioText, capDo === 'Junior' && styles.radioTextActive]}>Junior</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.radioBtn, capDo === 'Middle' && styles.radioBtnActive]} onPress={() => setCapDo('Middle')}>
              <Text style={[styles.radioText, capDo === 'Middle' && styles.radioTextActive]}>Middle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={() => setIsInterviewing(true)} style={[styles.submitBtnWrapper, { shadowColor: COLORS.success, elevation: 8 }]}>
        <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.submitBtn}>
          <Ionicons name="headset" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>Bắt đầu Phỏng Vấn Ngay</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderActiveInterview = () => (
    <View style={styles.interviewContainer}>
      <View style={styles.statusBanner}>
        <View style={styles.recordingDot} />
        <Text style={styles.statusTime}>Đang thu âm • 05:23</Text>
      </View>

      <View style={styles.avatarSection}>
        <Animated.View style={[styles.waveCircle, { transform: [{ scale: waveAnim }] }]} />
        <View style={styles.avatarInner}>
          <Ionicons name="hardware-chip" size={50} color={COLORS.success} />
        </View>
      </View>

      <Text style={styles.interviewerName}>Tech Lead AI</Text>
      <Text style={styles.interviewerRole}>Vị trí: {viTri}</Text>

      <View style={styles.transcriptBox}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.chatBubbleAI}>
            <Ionicons name="desktop-outline" size={16} color={COLORS.success} style={{ marginRight: 5, marginTop: 2 }} />
            <Text style={styles.chatTextAI}>Chào bạn. Bạn hãy mô tả sự khác biệt giữa state và props trong React Native nhé.</Text>
          </View>
          <View style={styles.chatBubbleUser}>
            <Text style={styles.chatTextUser}>Dạ thưa anh, props là dữ liệu truyền từ component cha xuống, còn state là...</Text>
            <Ionicons name="person-outline" size={16} color={COLORS.white} style={{ marginLeft: 5, marginTop: 2 }} />
          </View>
          <View style={styles.chatBubbleAI}>
            <Ionicons name="desktop-outline" size={16} color={COLORS.success} style={{ marginRight: 5, marginTop: 2 }} />
            <Text style={styles.chatTextAI}>Rất tốt! Vậy khi nào thì component sẽ bị re-render?</Text>
          </View>
          <Text style={styles.typingIndicator}>AI đang lắng nghe bạn nói...</Text>
        </ScrollView>
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={() => setIsInterviewing(false)} style={styles.stopBtn}>
        <Ionicons name="stop" size={24} color={COLORS.white} />
        <Text style={styles.stopBtnText}>Kết Thúc Phỏng Vấn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (isInterviewing) setIsInterviewing(false);
          else router.back();
        }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phòng Phỏng Vấn Ảo</Text>
        <View style={{ width: 40 }} />
      </View>

      {isInterviewing ? renderActiveInterview() : renderSetup()}
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  container: { flex: 1, paddingHorizontal: 20 },
  
  // Setup UI
  iconWrapper: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
  iconGradient: { width: 80, height: 80, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  descText: { textAlign: 'center', color: COLORS.gray, fontSize: 15, lineHeight: 22, marginBottom: 30, paddingHorizontal: 10 },
  formContainer: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, ...SHADOWS.small, marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.darkLight, marginBottom: 10 },
  textInput: { borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 14, height: 50, paddingHorizontal: 15, fontSize: 15, color: COLORS.dark, backgroundColor: COLORS.bg },
  radioGroup: { flexDirection: 'row', justifyContent: 'space-between' },
  radioBtn: { flex: 1, alignItems: 'center', padding: 12, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 12, marginRight: 8, backgroundColor: COLORS.bg },
  radioBtnActive: { borderColor: COLORS.success, backgroundColor: '#dcfce7' },
  radioText: { fontSize: 14, color: COLORS.gray, fontWeight: '600' },
  radioTextActive: { color: COLORS.success },
  submitBtnWrapper: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.glow },
  submitBtn: { height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },

  // Active Interview UI
  interviewContainer: { flex: 1, paddingHorizontal: 20, alignItems: 'center' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 40 },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.danger, marginRight: 8 },
  statusTime: { color: COLORS.danger, fontWeight: '700', fontSize: 14 },
  
  avatarSection: { position: 'relative', width: 140, height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  waveCircle: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(16, 185, 129, 0.2)' },
  avatarInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.success },
  
  interviewerName: { fontSize: 24, fontWeight: '900', color: COLORS.dark, marginBottom: 5 },
  interviewerRole: { fontSize: 15, color: COLORS.gray, marginBottom: 30 },

  transcriptBox: { flex: 1, width: '100%', backgroundColor: COLORS.white, borderRadius: 20, padding: 15, ...SHADOWS.small, marginBottom: 20 },
  chatBubbleAI: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 15, borderTopLeftRadius: 5, marginBottom: 15, alignSelf: 'flex-start', maxWidth: '85%' },
  chatTextAI: { flex: 1, fontSize: 14, color: COLORS.dark, lineHeight: 20 },
  chatBubbleUser: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: 12, borderRadius: 15, borderTopRightRadius: 5, marginBottom: 15, alignSelf: 'flex-end', maxWidth: '85%' },
  chatTextUser: { flex: 1, fontSize: 14, color: COLORS.white, lineHeight: 20 },
  typingIndicator: { fontSize: 13, fontStyle: 'italic', color: COLORS.gray, textAlign: 'center', marginTop: 10 },

  stopBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.danger, width: '100%', height: 56, borderRadius: 16, marginBottom: 20, ...SHADOWS.small },
  stopBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800', marginLeft: 10 }
});
