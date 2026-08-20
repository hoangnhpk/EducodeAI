import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, ActivityIndicator, Platform, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { PhongVanAIService, TinhCachAI, StartPhongVanRequest } from '../services/phong-van-ai.service';
import { COLORS, FONT, RADIUS, SHADOWS } from '../configs/theme';
import { AnimatedPressable } from '../components/animated-pressable';

export default function PhongVanAIScreen() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Setup, 2: Chat, 3: Result
  const [loading, setLoading] = useState(false);
  
  // Setup State
  const [viTri, setViTri] = useState('Frontend Developer');
  const [capDo, setCapDo] = useState('Junior');
  const [tinhCach, setTinhCach] = useState<TinhCachAI>(TinhCachAI.Normal);
  
  // Interview State
  const [maPhongVan, setMaPhongVan] = useState<number | null>(null);
  const [cauHoiHienTai, setCauHoiHienTai] = useState('');
  const [cauTraLoi, setCauTraLoi] = useState('');
  const [cauHoiSo, setCauHoiSo] = useState(1);
  const [nhanXetTruoc, setNhanXetTruoc] = useState<string | null>(null);
  
  // Result State
  const [diemSo, setDiemSo] = useState<number | null>(null);
  const [danhGia, setDanhGia] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);

  const startInterview = async () => {
    setLoading(true);
    try {
      const request: StartPhongVanRequest = {
        viTriUngTuyen: viTri,
        capDo,
        tinhCachAI: tinhCach,
        soLuongCauHoi: 3
      };
      const res = await PhongVanAIService.startInterview(request);
      setMaPhongVan(res.maPhongVan);
      setCauHoiHienTai(res.cauHoiDauTien);
      setStep(2);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể bắt đầu phỏng vấn');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!cauTraLoi.trim() || !maPhongVan) return;
    
    setLoading(true);
    try {
      const res = await PhongVanAIService.answerQuestion({
        maPhongVan,
        cauTraLoi: cauTraLoi.trim()
      });
      
      if (res.isFinished) {
        await finishInterview();
      } else {
        setNhanXetTruoc(res.nhanXetCauTruoc);
        setCauHoiHienTai(res.cauHoiTiepTheo);
        setCauHoiSo(prev => prev + 1);
        setCauTraLoi('');
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể gửi câu trả lời');
    } finally {
      setLoading(false);
    }
  };

  const finishInterview = async () => {
    if (!maPhongVan) return;
    setLoading(true);
    try {
      const res = await PhongVanAIService.endInterview(maPhongVan);
      setDiemSo(res.diemSo);
      setDanhGia(res.danhGiaChung);
      setStep(3);
    } catch (e: any) {
      Alert.alert('Lỗi', 'Không thể kết thúc phỏng vấn');
    } finally {
      setLoading(false);
    }
  };

  const renderSetup = () => (
    <View style={styles.setupContainer}>
      <Text style={styles.setupTitle}>Cấu Hình Buổi Phỏng Vấn</Text>
      <Text style={styles.setupSub}>Hãy thiết lập vai trò để AI chuẩn bị kịch bản phù hợp nhất.</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vị trí ứng tuyển</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={viTri}
            onValueChange={setViTri}
            style={styles.picker}
            dropdownIconColor={COLORS.white}
          >
            <Picker.Item label="Frontend Developer" value="Frontend Developer" color={Platform.OS === 'ios' ? COLORS.white : COLORS.text} />
            <Picker.Item label="Backend Developer" value="Backend Developer" color={Platform.OS === 'ios' ? COLORS.white : COLORS.text} />
            <Picker.Item label="Fullstack Developer" value="Fullstack Developer" color={Platform.OS === 'ios' ? COLORS.white : COLORS.text} />
            <Picker.Item label="Mobile Developer" value="Mobile Developer" color={Platform.OS === 'ios' ? COLORS.white : COLORS.text} />
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cấp độ</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={capDo}
            onValueChange={setCapDo}
            style={styles.picker}
            dropdownIconColor={COLORS.white}
          >
            <Picker.Item label="Intern / Fresher" value="Intern" color={Platform.OS === 'ios' ? COLORS.white : COLORS.text} />
            <Picker.Item label="Junior" value="Junior" color={Platform.OS === 'ios' ? COLORS.white : COLORS.text} />
            <Picker.Item label="Middle" value="Middle" color={Platform.OS === 'ios' ? COLORS.white : COLORS.text} />
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phong cách người phỏng vấn</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={tinhCach}
            onValueChange={setTinhCach}
            style={styles.picker}
            dropdownIconColor={COLORS.white}
          >
            <Picker.Item label="Thân thiện, cởi mở" value={TinhCachAI.Friendly} color={Platform.OS === 'ios' ? COLORS.white : COLORS.text} />
            <Picker.Item label="Tiêu chuẩn, chuyên nghiệp" value={TinhCachAI.Normal} color={Platform.OS === 'ios' ? COLORS.white : COLORS.text} />
            <Picker.Item label="Khó tính, xoáy sâu" value={TinhCachAI.Strict} color={Platform.OS === 'ios' ? COLORS.white : COLORS.text} />
          </Picker>
        </View>
      </View>

      <AnimatedPressable style={styles.btnActionWrapper} onPress={startInterview} disabled={loading}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.btnAction}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnActionText}>Bắt đầu phỏng vấn ngay</Text>}
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );

  const renderChat = () => (
    <ScrollView ref={scrollViewRef} contentContainerStyle={styles.chatContainer} showsVerticalScrollIndicator={false}>
      {nhanXetTruoc && (
        <View style={styles.feedbackCard}>
          <View style={styles.feedbackHeader}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.feedbackTitle}>Nhận xét câu trước:</Text>
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
            <Text style={styles.aiName}>EduCode Tech Lead</Text>
            <Text style={styles.aiStatus}>Câu hỏi {cauHoiSo} / 3</Text>
          </View>
        </View>
        <Text style={styles.aiQuestion}>{cauHoiHienTai}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Câu trả lời của bạn:</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Nhập câu trả lời của bạn tại đây..."
          placeholderTextColor={COLORS.grayLight}
          value={cauTraLoi}
          onChangeText={setCauTraLoi}
        />
        <AnimatedPressable style={styles.btnActionWrapper} onPress={submitAnswer} disabled={loading || !cauTraLoi.trim()}>
          <LinearGradient colors={cauTraLoi.trim() ? COLORS.primaryGradient : ['#334155', '#475569']} style={styles.btnAction}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnActionText}>Gửi câu trả lời</Text>}
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </ScrollView>
  );

  const renderResult = () => (
    <View style={styles.resultContainer}>
      <Ionicons name="trophy" size={80} color={COLORS.gold} style={{ marginBottom: 20 }} />
      <Text style={styles.resultTitle}>Phỏng Vấn Hoàn Tất!</Text>
      
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Điểm đánh giá:</Text>
        <Text style={[styles.scoreValue, { color: (diemSo || 0) >= 50 ? COLORS.success : COLORS.danger }]}>
          {diemSo} / 100
        </Text>
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackTitle}>Đánh giá tổng quan:</Text>
        <Text style={styles.feedbackText}>{danhGia}</Text>
      </View>

      <AnimatedPressable style={[styles.btnActionWrapper, { marginTop: 30, width: '100%' }]} onPress={() => router.back()}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.btnAction}>
          <Text style={styles.btnActionText}>Về trang chủ</Text>
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <AnimatedPressable style={styles.backBtn} onPress={() => {
          if (step === 2) {
            Alert.alert('Thoát', 'Bạn có chắc muốn thoát? Kết quả sẽ không được lưu.', [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Thoát', onPress: () => router.back(), style: 'destructive' }
            ]);
          } else {
            router.back();
          }
        }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Luyện Phỏng Vấn AI</Text>
        <View style={{ width: 44 }} />
      </View>

      {step === 1 && renderSetup()}
      {step === 2 && renderChat()}
      {step === 3 && renderResult()}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.white, letterSpacing: -0.5 },
  
  setupContainer: { flex: 1, padding: 24, justifyContent: 'center' },
  setupTitle: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginBottom: 10 },
  setupSub: { fontSize: 16, color: COLORS.grayLight, marginBottom: 30, lineHeight: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: COLORS.grayLight, marginBottom: 8 },
  pickerWrapper: {
    backgroundColor: COLORS.darkLight, borderRadius: RADIUS.input,
    borderWidth: 1, borderColor: COLORS.darkBorder, overflow: 'hidden'
  },
  picker: { color: COLORS.white, height: 56 },
  
  chatContainer: { padding: 20, paddingBottom: 40 },
  aiCard: { backgroundColor: COLORS.darkLight, padding: 20, borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.darkBorder, marginBottom: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarGlow: { padding: 4, borderRadius: 30, backgroundColor: 'rgba(251, 135, 63, 0.2)', marginRight: 12 },
  aiName: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  aiStatus: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  aiQuestion: { fontSize: 18, color: COLORS.white, lineHeight: 28 },
  
  feedbackCard: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: RADIUS.card, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: 20 },
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
  
  resultContainer: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginBottom: 30 },
  scoreCard: { backgroundColor: COLORS.darkLight, padding: 30, borderRadius: RADIUS.card, alignItems: 'center', marginBottom: 20, width: '100%', borderWidth: 1, borderColor: COLORS.darkBorder },
  scoreLabel: { fontSize: 16, color: COLORS.grayLight, marginBottom: 10 },
  scoreValue: { fontSize: 48, fontWeight: '900' },
  
  btnActionWrapper: { borderRadius: RADIUS.button, overflow: 'hidden', ...SHADOWS.glow },
  btnAction: { height: 56, justifyContent: 'center', alignItems: 'center' },
  btnActionText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});
