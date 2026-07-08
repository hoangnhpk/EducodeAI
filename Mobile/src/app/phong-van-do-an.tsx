import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../configs/api';
import { AnimatedPressable } from '../components/animated-pressable';

const COLORS = {
  primary: '#fb873f', primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a', darkLight: '#1e293b', bg: '#020617', white: '#ffffff', gray: '#94a3b8',
  success: '#10b981', danger: '#ef4444'
};
const SHADOWS = {
  small: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  medium: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  glow: { shadowColor: '#fb873f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }
};

export default function PhongVanDoAnScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(15);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (sessionId) fetchQues();
    else { Alert.alert('Lỗi', 'Không có session.'); router.back(); }
  }, [sessionId]);

  const fetchQues = async () => {
    try {
      const res = await api.get(`/SinhDoAnAI/result/${sessionId}`);
      setData(res.data);
    } catch (e) { Alert.alert('Lỗi', 'Không tải được câu hỏi.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let interval: any;
    if (isRecording && timer > 0) interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    else if (timer === 0 && isRecording) handleStopRecording();
    return () => clearInterval(interval);
  }, [isRecording, timer]);

  const handleStartRecording = () => { setIsRecording(true); setTimer(15); setScore(null); };

  const handleStopRecording = () => {
    setIsRecording(false);
    Alert.alert('Xử lý', 'Đang nộp câu trả lời cho Tech Lead AI...');
    setTimeout(() => {
      setScore(Math.floor(Math.random() * 3) + 7); // Random 7-9
      Alert.alert('Chấm điểm', 'Bạn nhận được điểm khá tốt từ Tech Lead!');
    }, 2000);
  };

  if (loading) return <View style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}><ActivityIndicator size="large" color={COLORS.primary}/></View>;
  if (!data) return <View style={styles.safeArea}><Text style={{color: COLORS.white}}>Lỗi dữ liệu.</Text></View>;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Phòng Phỏng Vấn</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.contentContainer}>
        {/* Tech Lead Avatar Glow */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarGlow, isRecording && styles.avatarRecordingGlow]}>
            <Image source={{ uri: 'https://ui-avatars.com/api/?name=Tech+Lead&background=fb873f&color=fff' }} style={styles.avatar} />
          </View>
          <Text style={styles.avatarName}>Educode Tech Lead</Text>
          <Text style={styles.avatarStatus}>{isRecording ? 'Đang lắng nghe...' : 'Đang đợi câu trả lời'}</Text>
        </View>

        <View style={styles.quesCard}>
          <Ionicons name="chatbubble-ellipses" size={30} color={COLORS.primary} style={{marginBottom: 10}} />
          <Text style={styles.quesTitle}>Câu hỏi từ Tech Lead:</Text>
          <Text style={styles.quesText}>"Giải thích kiến trúc {data.TenDoAn} mà bạn vừa thiết kế?"</Text>
        </View>

        {score !== null && (
          <View style={styles.scoreCard}>
             <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
             <Text style={styles.scoreText}>Điểm: {score}/10</Text>
             <Text style={{color: COLORS.gray}}>Tech Lead đánh giá cao câu trả lời của bạn.</Text>
          </View>
        )}
      </View>

      {/* Footer Voice Record */}
      <BlurView intensity={40} tint="dark" style={styles.footer}>
        <Text style={styles.timerText}>{isRecording ? `00:${timer.toString().padStart(2, '0')}` : 'Nhấn để bắt đầu Voice Chat'}</Text>
        <AnimatedPressable onPress={isRecording ? handleStopRecording : handleStartRecording}>
          <LinearGradient colors={isRecording ? ['#ef4444', '#b91c1c'] : COLORS.primaryGradient} style={[styles.recordBtn, isRecording && { width: 80, height: 80, borderRadius: 40 }]}>
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={isRecording ? 36 : 40} color={COLORS.white} />
          </LinearGradient>
        </AnimatedPressable>
      </BlurView>
    </View>
  );
}

// Dummy import for Image to avoid error in this script
import { Image } from 'react-native';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.white, letterSpacing: -0.5 },
  contentContainer: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  avatarContainer: { alignItems: 'center', marginBottom: 40 },
  avatarGlow: { padding: 8, borderRadius: 80, backgroundColor: 'rgba(251, 135, 63, 0.2)' },
  avatarRecordingGlow: { backgroundColor: 'rgba(239, 68, 68, 0.4)' },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarName: { fontSize: 22, fontWeight: '900', color: COLORS.white, marginTop: 15, letterSpacing: -0.5 },
  avatarStatus: { fontSize: 15, color: COLORS.gray, marginTop: 5 },
  quesCard: { backgroundColor: COLORS.darkLight, padding: 25, borderRadius: 28, width: '100%', borderWidth: 1, borderColor: '#334155' },
  quesTitle: { fontSize: 15, color: COLORS.primary, fontWeight: '800', marginBottom: 10 },
  quesText: { fontSize: 18, color: COLORS.white, lineHeight: 28, fontWeight: '600' },
  scoreCard: { marginTop: 20, alignItems: 'center', backgroundColor: '#064e3b', padding: 20, borderRadius: 24, width: '100%' },
  scoreText: { fontSize: 24, fontWeight: '900', color: COLORS.white, marginTop: 10, marginBottom: 5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: Platform.OS === 'ios' ? 40 : 25, paddingTop: 20, alignItems: 'center', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  timerText: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 20 },
  recordBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: {width:0,height:0}, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 }
});
