import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { aiRoadmapService, LoTrinhAICuaToiDTO, KetQuaLoTrinhAI } from '../services/ai-roadmap.service';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '../components/animated-pressable';

const COLORS = {
  primary: '#fb873f', primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a', bg: '#f8fafc', white: '#ffffff', gray: '#64748b',
  success: '#10b981', lightGray: '#e2e8f0', primaryLight: '#fff3ed'
};
const SHADOWS = {
  small: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  medium: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  glow: { shadowColor: '#fb873f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }
};

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
