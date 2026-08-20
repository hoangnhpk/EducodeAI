import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, ActivityIndicator, StatusBar, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../configs/api';
import { COLORS, RADIUS, SHADOWS } from '../configs/theme';
import { AnimatedPressable } from '../components/animated-pressable';

export default function PhongVanDoAnScreen() {
  const router = useRouter();
  const { sessionId, cauHoiDauTien, tenDoAn } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [cauHoiHienTai, setCauHoiHienTai] = useState(cauHoiDauTien as string || 'Đang tải câu hỏi...');
  const [cauTraLoi, setCauTraLoi] = useState('');
  const [soCauHienTai, setSoCauHienTai] = useState(1);
  const [tongSoCau, setTongSoCau] = useState(3);
  
  const [nhanXetTruoc, setNhanXetTruoc] = useState<string | null>(null);
  const [diemCauTruoc, setDiemCauTruoc] = useState<number | null>(null);
  
  const [daKetThuc, setDaKetThuc] = useState(false);
  const [ketQuaCuoiCung, setKetQuaCuoiCung] = useState<any>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!sessionId) {
      Alert.alert('Lỗi', 'Không tìm thấy phiên phỏng vấn.');
      router.back();
    }
  }, [sessionId]);

  const submitAnswer = async () => {
    if (!cauTraLoi.trim() || !sessionId) return;

    setLoading(true);
    try {
      const res = await api.post('/SinhDoAnAI/tra-loi-phong-van', {
        sessionId,
        soCauHienTai,
        cauTraLoi: cauTraLoi.trim()
      });

      const data = res.data;

      if (data.daKetThuc) {
        setDaKetThuc(true);
        fetchFinalResult();
      } else {
        setNhanXetTruoc(data.nhanXet);
        setDiemCauTruoc(data.diemCauVua);
        setCauHoiHienTai(data.cauHoiTiepTheo);
        setSoCauHienTai(data.soCauHienTai + 1);
        setTongSoCau(data.tongSoCau || 3);
        setCauTraLoi('');
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể gửi câu trả lời. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinalResult = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/SinhDoAnAI/result/${sessionId}`);
      setKetQuaCuoiCung(res.data);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lấy kết quả đánh giá cuối cùng.');
    } finally {
      setLoading(false);
    }
  };

  const renderChat = () => (
    <ScrollView ref={scrollViewRef} contentContainerStyle={styles.chatContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.projectTitle}>Đồ án: {tenDoAn || 'Đang bảo vệ'}</Text>
      
      {nhanXetTruoc && (
        <View style={styles.feedbackCard}>
          <View style={styles.feedbackHeader}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.feedbackTitle}>Điểm câu trước: {diemCauTruoc}/20</Text>
          </View>
          <Text style={styles.feedbackText}>{nhanXetTruoc}</Text>
        </View>
      )}

      <View style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <View style={styles.avatarGlow}>
            <Ionicons name="person-circle" size={40} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.aiName}>Hội đồng đánh giá AI</Text>
            <Text style={styles.aiStatus}>Câu hỏi {soCauHienTai} / {tongSoCau}</Text>
          </View>
        </View>
        <Text style={styles.aiQuestion}>{cauHoiHienTai}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Câu trả lời của bạn:</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Trình bày câu trả lời của bạn một cách rõ ràng..."
          placeholderTextColor={COLORS.grayLight}
          value={cauTraLoi}
          onChangeText={setCauTraLoi}
        />
        <AnimatedPressable style={styles.btnActionWrapper} onPress={submitAnswer} disabled={loading || !cauTraLoi.trim()}>
          <LinearGradient colors={cauTraLoi.trim() ? COLORS.primaryGradient : ['#334155', '#475569']} style={styles.btnAction}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnActionText}>Nộp câu trả lời</Text>}
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </ScrollView>
  );

  const renderResult = () => {
    if (!ketQuaCuoiCung) {
      return (
        <View style={[styles.resultContainer, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.white, marginTop: 20 }}>Đang tổng hợp kết quả...</Text>
        </View>
      );
    }

    const { TongDiem, NhanXetTong, DatYeuCau, MaChungChi } = ketQuaCuoiCung;

    return (
      <View style={styles.resultContainer}>
        <Ionicons 
          name={DatYeuCau ? "medal" : "sad-outline"} 
          size={80} 
          color={DatYeuCau ? COLORS.gold : COLORS.danger} 
          style={{ marginBottom: 20 }} 
        />
        <Text style={styles.resultTitle}>{DatYeuCau ? 'Bảo Vệ Thành Công!' : 'Chưa Đạt Yêu Cầu'}</Text>
        
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Điểm tổng (thang 100):</Text>
          <Text style={[styles.scoreValue, { color: DatYeuCau ? COLORS.success : COLORS.danger }]}>
            {TongDiem}
          </Text>
        </View>

        {MaChungChi && (
          <View style={styles.certificateCard}>
            <Ionicons name="document-text" size={24} color={COLORS.primary} style={{ marginRight: 10 }} />
            <View>
              <Text style={{ color: COLORS.grayLight, fontSize: 12 }}>Mã chứng chỉ (cấp phát tự động):</Text>
              <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16 }}>{MaChungChi}</Text>
            </View>
          </View>
        )}

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Nhận xét từ hội đồng AI:</Text>
          <Text style={styles.feedbackText}>{NhanXetTong}</Text>
        </View>

        <AnimatedPressable style={[styles.btnActionWrapper, { marginTop: 30, width: '100%' }]} onPress={() => router.replace('/trang-chu')}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.btnAction}>
            <Text style={styles.btnActionText}>Về trang chủ</Text>
          </LinearGradient>
        </AnimatedPressable>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <AnimatedPressable style={styles.backBtn} onPress={() => {
          if (!daKetThuc) {
            Alert.alert('Thoát', 'Bỏ dở buổi bảo vệ sẽ không lưu lại kết quả. Bạn có chắc muốn thoát?', [
              { text: 'Tiếp tục phỏng vấn', style: 'cancel' },
              { text: 'Thoát', onPress: () => router.back(), style: 'destructive' }
            ]);
          } else {
            router.replace('/trang-chu');
          }
        }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Bảo Vệ Đồ Án AI</Text>
        <View style={{ width: 44 }} />
      </View>

      {daKetThuc ? renderResult() : renderChat()}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.white, letterSpacing: -0.5 },
  
  chatContainer: { padding: 20, paddingBottom: 40 },
  projectTitle: { fontSize: 16, color: COLORS.primary, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  
  aiCard: { backgroundColor: COLORS.darkLight, padding: 20, borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.darkBorder, marginBottom: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarGlow: { padding: 4, borderRadius: 30, backgroundColor: 'rgba(251, 135, 63, 0.2)', marginRight: 12 },
  aiName: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  aiStatus: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  aiQuestion: { fontSize: 18, color: COLORS.white, lineHeight: 28 },
  
  feedbackCard: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: RADIUS.card, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: 20, width: '100%' },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  feedbackTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.success, marginLeft: 8 },
  feedbackText: { fontSize: 15, color: COLORS.white, lineHeight: 24 },
  
  inputContainer: { marginTop: 10 },
  inputLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginBottom: 12 },
  textArea: {
    backgroundColor: COLORS.darkLight, borderRadius: RADIUS.card,
    borderWidth: 1, borderColor: COLORS.darkBorder,
    color: COLORS.white, fontSize: 16, minHeight: 150,
    padding: 20, textAlignVertical: 'top', marginBottom: 20
  },
  
  resultContainer: { flex: 1, padding: 24, alignItems: 'center' },
  resultTitle: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginBottom: 30 },
  scoreCard: { backgroundColor: COLORS.darkLight, padding: 30, borderRadius: RADIUS.card, alignItems: 'center', marginBottom: 20, width: '100%', borderWidth: 1, borderColor: COLORS.darkBorder },
  scoreLabel: { fontSize: 16, color: COLORS.grayLight, marginBottom: 10 },
  scoreValue: { fontSize: 48, fontWeight: '900' },
  certificateCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251, 135, 63, 0.1)', padding: 15, borderRadius: RADIUS.card, borderWidth: 1, borderColor: 'rgba(251, 135, 63, 0.3)', marginBottom: 20, width: '100%' },
  
  btnActionWrapper: { borderRadius: RADIUS.button, overflow: 'hidden', ...SHADOWS.glow },
  btnAction: { height: 56, justifyContent: 'center', alignItems: 'center' },
  btnActionText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});
