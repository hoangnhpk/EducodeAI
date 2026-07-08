const fs = require('fs');
const path = require('path');

const SHADOWS_STR = `const SHADOWS = {
  small: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  medium: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  glow: { shadowColor: '#fb873f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }
};`;

// lo-trinh.tsx
const loTrinhContent = `import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { aiRoadmapService, LoTrinhAICuaToiDTO, KetQuaLoTrinhAI } from '../services/ai-roadmap.service';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '../components/animated-pressable';

const COLORS = {
  primary: '#fb873f', primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a', bg: '#f8fafc', white: '#ffffff', gray: '#64748b',
  success: '#10b981', lightGray: '#e2e8f0'
};
${SHADOWS_STR}

export default function LoTrinhScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-roadmap' | 'create'>('my-roadmap');
  const [roadmaps, setRoadmaps] = useState<LoTrinhAICuaToiDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [mucTieu, setMucTieu] = useState('');
  const [kinhNghiem, setKinhNghiem] = useState('');
  const [khoKhan, setKhoKhan] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (activeTab === 'my-roadmap') fetchRoadmaps();
  }, [activeTab]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await aiRoadmapService.getAllLoTrinh();
      setRoadmaps(res.data);
    } catch (e) { Alert.alert('Lỗi', 'Không thể lấy danh sách lộ trình'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!mucTieu || !kinhNghiem) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập mục tiêu và kinh nghiệm!'); return; }
    setGenerating(true);
    try {
      await aiRoadmapService.taoLoTrinh({
        mucTieuNgheNghiep: mucTieu, kinhNghiem: kinhNghiem, khoKhan: khoKhan || 'Không',
        trinhDo: 'Cơ bản', phongCachHoc: 'Thực hành nhiều', kienThucHienCo: 'Chưa có nhiều',
      });
      Alert.alert('Thành công', 'Lộ trình AI đã được tạo!');
      setActiveTab('my-roadmap');
    } catch (e: any) { Alert.alert('Lỗi', e.message || 'Không thể tạo lộ trình'); }
    finally { setGenerating(false); }
  };

  const renderMyRoadmaps = () => {
    if (loading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
    if (roadmaps.length === 0) {
      return (
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Ionicons name="map-outline" size={64} color={COLORS.lightGray} />
          <Text style={{ color: COLORS.gray, marginTop: 10, marginBottom: 20 }}>Bạn chưa có lộ trình nào.</Text>
          <AnimatedPressable style={styles.btnPrimary} onPress={() => setActiveTab('create')}>
            <LinearGradient colors={COLORS.primaryGradient} style={styles.btnGradient}>
              <Text style={styles.btnPrimaryText}>Tạo lộ trình AI ngay</Text>
            </LinearGradient>
          </AnimatedPressable>
        </View>
      );
    }
    return (
      <View>
        {roadmaps.map((rm) => {
          let data: KetQuaLoTrinhAI | null = null;
          try { data = JSON.parse(rm.noiDungJSON); } catch (e) {}
          return (
            <AnimatedPressable key={rm.maLoTrinh} style={[styles.card, SHADOWS.small]} onPress={() => Alert.alert('Lộ trình', 'Chi tiết trên Mobile đang phát triển.')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={styles.iconBox}><Ionicons name="school" size={20} color={COLORS.primary} /></View>
                <Text style={styles.cardTitle}>{rm.mucTieuNgheNghiep}</Text>
              </View>
              <Text style={{ color: COLORS.gray, marginBottom: 5 }}>Tạo ngày: {new Date(rm.ngayTao).toLocaleDateString('vi-VN')}</Text>
              <Text style={{ color: COLORS.dark }}>Trạng thái: <Text style={{fontWeight: 'bold', color: COLORS.success}}>{rm.trangThai}</Text></Text>
            </AnimatedPressable>
          );
        })}
      </View>
    );
  };

  const renderCreateForm = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.card, SHADOWS.small]}>
        <Text style={styles.label}>Mục tiêu nghề nghiệp (VD: Frontend Dev):</Text>
        <TextInput style={styles.input} value={mucTieu} onChangeText={setMucTieu} placeholder="Nhập mục tiêu của bạn..." />

        <Text style={styles.label}>Kinh nghiệm hiện tại:</Text>
        <TextInput style={[styles.input, {height: 80}]} value={kinhNghiem} onChangeText={setKinhNghiem} placeholder="VD: Đã biết HTML, CSS cơ bản..." multiline />

        <Text style={styles.label}>Khó khăn đang gặp phải:</Text>
        <TextInput style={[styles.input, {height: 80}]} value={khoKhan} onChangeText={setKhoKhan} placeholder="VD: Khó nhớ cú pháp..." multiline />

        <AnimatedPressable style={[styles.btnPrimary, generating && { opacity: 0.7 }]} onPress={handleCreate} disabled={generating}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.btnGradient}>
            {generating ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnPrimaryText}>✨ Sinh Lộ Trình AI</Text>}
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Lộ Trình AI</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabContainer}>
        <AnimatedPressable style={[styles.tabBtn, activeTab === 'my-roadmap' && styles.tabBtnActive]} onPress={() => setActiveTab('my-roadmap')}>
          <Text style={[styles.tabText, activeTab === 'my-roadmap' && styles.tabTextActive]}>Lộ trình của tôi</Text>
        </AnimatedPressable>
        <AnimatedPressable style={[styles.tabBtn, activeTab === 'create' && styles.tabBtnActive]} onPress={() => setActiveTab('create')}>
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>Tạo mới AI</Text>
        </AnimatedPressable>
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === 'my-roadmap' ? renderMyRoadmaps() : renderCreateForm()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'rgba(248, 250, 252, 0.9)' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 20, ...SHADOWS.small, zIndex: 10 },
  tabBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '700', color: COLORS.gray },
  tabTextActive: { color: COLORS.primary, fontWeight: '900' },
  contentContainer: { flex: 1, padding: 20 },
  card: { backgroundColor: COLORS.white, padding: 24, borderRadius: 24, marginBottom: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '900', color: COLORS.dark, marginLeft: 12, flex: 1 },
  btnPrimary: { borderRadius: 20, overflow: 'hidden', marginTop: 15, ...SHADOWS.glow },
  btnGradient: { height: 56, justifyContent: 'center', alignItems: 'center' },
  btnPrimaryText: { color: COLORS.white, fontWeight: '900', fontSize: 16 },
  label: { fontSize: 15, fontWeight: '800', color: COLORS.dark, marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: COLORS.bg, borderRadius: 16, padding: 16, fontSize: 16, color: COLORS.dark, borderWidth: 1, borderColor: COLORS.lightGray, minHeight: 56 },
});
`;

fs.writeFileSync(path.join(__dirname, 'Mobile', 'src', 'app', 'lo-trinh.tsx'), loTrinhContent);
console.log('Done lo-trinh.tsx');

// thu-thach.tsx
const thuThachContent = `import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { thuThachService, NhiemVuDTO } from '../services/thu-thach.service';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '../components/animated-pressable';

const COLORS = {
  primary: '#fb873f', primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a', bg: '#f8fafc', white: '#ffffff', gray: '#64748b',
  success: '#10b981', gold: '#fbbf24', lightGray: '#e2e8f0'
};
${SHADOWS_STR}

export default function ThuThachScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'nhiem-vu' | 'bxh'>('nhiem-vu');
  const [nhiemVus, setNhiemVus] = useState<NhiemVuDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'nhiem-vu') fetchNhiemVu();
  }, [activeTab]);

  const fetchNhiemVu = async () => {
    setLoading(true);
    try {
      const res = await thuThachService.getNhiemVuHangNgay();
      setNhiemVus(res.data);
    } catch (e) { Alert.alert('Lỗi', 'Không thể lấy danh sách nhiệm vụ'); }
    finally { setLoading(false); }
  };

  const handleLamNhiemVu = (nv: NhiemVuDTO) => {
    Alert.alert('Thử thách', \`Bắt đầu nhiệm vụ: \${nv.loaiNhiemVu}\\nYêu cầu: \${nv.soLuongYeuCau}\`);
  };

  const handleNhanThuong = async (id: number) => {
    try {
      await thuThachService.nhanThuongNhiemVu(id);
      Alert.alert('Thành công', 'Đã nhận thưởng EXP và Thẻ!');
      fetchNhiemVu();
    } catch (e: any) { Alert.alert('Lỗi', e.response?.data?.message || 'Không thể nhận thưởng'); }
  };

  const renderNhiemVu = () => {
    if (loading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
    return (
      <View>
        <LinearGradient colors={['#fef3c7', '#fde68a']} style={[styles.heroCard, SHADOWS.medium]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Chuỗi ngày học</Text>
            <Text style={styles.heroDesc}>Hoàn thành nhiệm vụ mỗi ngày để giữ streak và nhận thưởng thẻ EXP.</Text>
          </View>
          <Ionicons name="flame" size={60} color={COLORS.primary} />
        </LinearGradient>

        <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
        {nhiemVus.map(nv => {
          const isDone = nv.tienDo >= nv.soLuongYeuCau;
          return (
            <View key={nv.maNhiemVu} style={[styles.nvCard, SHADOWS.small]}>
              <View style={styles.nvHeader}>
                <View style={[styles.iconBox, { backgroundColor: isDone ? '#dcfce7' : COLORS.primaryLight }]}>
                  <Ionicons name={isDone ? 'checkmark' : 'star'} size={20} color={isDone ? COLORS.success : COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.nvTitle}>{nv.loaiNhiemVu}</Text>
                  <Text style={styles.nvDesc}>Tiến độ: {nv.tienDo} / {nv.soLuongYeuCau}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Text style={styles.tagXP}>+{nv.thuongEXP} EXP</Text>
                    <Text style={styles.tagCoin}>+{nv.thuongThe} Thẻ</Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: \`\${Math.min((nv.tienDo / nv.soLuongYeuCau) * 100, 100)}%\` }]} />
              </View>
              
              {!isDone ? (
                <AnimatedPressable style={styles.btnActionWrapper} onPress={() => handleLamNhiemVu(nv)}>
                  <LinearGradient colors={COLORS.primaryGradient} style={styles.btnAction}>
                    <Text style={styles.btnActionText}>Làm ngay</Text>
                  </LinearGradient>
                </AnimatedPressable>
              ) : !nv.daNhanThuong ? (
                <AnimatedPressable style={styles.btnActionWrapper} onPress={() => handleNhanThuong(nv.maNhiemVu)}>
                  <LinearGradient colors={['#10b981', '#059669']} style={styles.btnAction}>
                    <Text style={styles.btnActionText}>Nhận thưởng</Text>
                  </LinearGradient>
                </AnimatedPressable>
              ) : (
                <View style={styles.btnDone}>
                  <Text style={styles.btnDoneText}>Đã nhận</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Thử Thách & Danh Hiệu</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabContainer}>
        <AnimatedPressable style={[styles.tabBtn, activeTab === 'nhiem-vu' && styles.tabBtnActive]} onPress={() => setActiveTab('nhiem-vu')}>
          <Text style={[styles.tabText, activeTab === 'nhiem-vu' && styles.tabTextActive]}>Nhiệm Vụ</Text>
        </AnimatedPressable>
        <AnimatedPressable style={[styles.tabBtn, activeTab === 'bxh' && styles.tabBtnActive]} onPress={() => setActiveTab('bxh')}>
          <Text style={[styles.tabText, activeTab === 'bxh' && styles.tabTextActive]}>Bảng Xếp Hạng</Text>
        </AnimatedPressable>
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'nhiem-vu' ? renderNhiemVu() : (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="trophy-outline" size={64} color={COLORS.gold} />
            <Text style={{ color: COLORS.gray, marginTop: 10 }}>Bảng xếp hạng đang được cập nhật mùa mới.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'rgba(248, 250, 252, 0.9)' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 20, ...SHADOWS.small, zIndex: 10 },
  tabBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '700', color: COLORS.gray },
  tabTextActive: { color: COLORS.primary, fontWeight: '900' },
  contentContainer: { flex: 1, padding: 20 },
  heroCard: { flexDirection: 'row', padding: 25, borderRadius: 24, marginBottom: 25, alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#92400e', marginBottom: 8, letterSpacing: -0.5 },
  heroDesc: { fontSize: 14, color: '#b45309', lineHeight: 22, paddingRight: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, marginBottom: 15, letterSpacing: -0.5 },
  nvCard: { backgroundColor: COLORS.white, padding: 20, borderRadius: 24, marginBottom: 15 },
  nvHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  nvTitle: { fontSize: 17, fontWeight: '800', color: COLORS.dark },
  nvDesc: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
  tagXP: { backgroundColor: '#fef3c7', color: '#d97706', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: 'bold', marginRight: 10 },
  tagCoin: { backgroundColor: '#e0e7ff', color: '#4f46e5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: COLORS.lightGray, borderRadius: 4, marginVertical: 15, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.success },
  btnActionWrapper: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.glow },
  btnAction: { height: 48, justifyContent: 'center', alignItems: 'center' },
  btnActionText: { color: COLORS.white, fontWeight: '900', fontSize: 15 },
  btnDone: { height: 48, backgroundColor: COLORS.lightGray, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnDoneText: { color: COLORS.gray, fontWeight: '800', fontSize: 15 }
});
`;

fs.writeFileSync(path.join(__dirname, 'Mobile', 'src', 'app', 'thu-thach.tsx'), thuThachContent);
console.log('Done thu-thach.tsx');

// phong-van-do-an.tsx
const phongVanContent = `import React, { useState, useEffect } from 'react';
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
${SHADOWS_STR}

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
      const res = await api.get(\`/SinhDoAnAI/result/\${sessionId}\`);
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
        <Text style={styles.timerText}>{isRecording ? \`00:\${timer.toString().padStart(2, '0')}\` : 'Nhấn để bắt đầu Voice Chat'}</Text>
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
`;

fs.writeFileSync(path.join(__dirname, 'Mobile', 'src', 'app', 'phong-van-do-an.tsx'), phongVanContent);
console.log('Done phong-van-do-an.tsx');
