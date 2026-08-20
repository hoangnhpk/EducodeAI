import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, Alert, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { aiRoadmapService, DuLieuYeuCauLoTrinh, LoTrinhAICuaToiDTO } from '../services/ai-roadmap.service';
import { COLORS, RADIUS, SHADOWS } from '../configs/theme';
import { AnimatedPressable } from '../components/animated-pressable';

export default function LoTrinhAIScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tao-moi' | 'danh-sach'>('danh-sach');
  
  // Danh sách state
  const [danhSach, setDanhSach] = useState<LoTrinhAICuaToiDTO[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Tạo mới state
  const [loadingTaoMoi, setLoadingTaoMoi] = useState(false);
  const [form, setForm] = useState<DuLieuYeuCauLoTrinh>({
    trinhDo: 'Người mới bắt đầu',
    phongCachHoc: 'Thực hành dự án',
    mucTieuNgheNghiep: 'Frontend Developer',
    thoiGianHoc: '12',
    mucDoCamKet: '10',
    kienThucHienCo: 'Chưa biết gì',
    kinhNghiem: 'Chưa có',
    khoKhan: 'Không biết bắt đầu từ đâu',
  });

  useEffect(() => {
    if (activeTab === 'danh-sach') {
      fetchDanhSach();
    }
  }, [activeTab]);

  const fetchDanhSach = async () => {
    setLoadingList(true);
    try {
      const res = await aiRoadmapService.getAllLoTrinh();
      setDanhSach(res.data);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tải danh sách lộ trình');
    } finally {
      setLoadingList(false);
    }
  };

  const handleTaoMoi = async () => {
    setLoadingTaoMoi(true);
    try {
      const res = await aiRoadmapService.taoLoTrinh(form);
      if (res.maLoTrinh) {
        Alert.alert('Thành công', 'Lộ trình AI đã được tạo!');
        setActiveTab('danh-sach');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tạo lộ trình. Thử lại sau.');
    } finally {
      setLoadingTaoMoi(false);
    }
  };

  const renderDanhSach = () => {
    if (loadingList) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
    
    if (danhSach.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color={COLORS.grayLight} />
          <Text style={styles.emptyText}>Bạn chưa có lộ trình nào.</Text>
          <AnimatedPressable style={[styles.btnActionWrapper, { marginTop: 20 }]} onPress={() => setActiveTab('tao-moi')}>
            <LinearGradient colors={COLORS.primaryGradient} style={styles.btnAction}>
              <Text style={styles.btnActionText}>Tạo lộ trình đầu tiên</Text>
            </LinearGradient>
          </AnimatedPressable>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Lộ trình của tôi</Text>
        {danhSach.map((item) => (
          <AnimatedPressable 
            key={item.maLoTrinh} 
            style={[styles.roadmapCard, SHADOWS.small]}
            onPress={() => router.push({ pathname: '/chi-tiet-lo-trinh', params: { id: item.maLoTrinh } })}
          >
            <View style={styles.roadmapHeader}>
              <View style={styles.iconBox}>
                <Ionicons name="compass" size={24} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.roadmapTitle} numberOfLines={1}>{item.mucTieuNgheNghiep}</Text>
                <Text style={styles.roadmapDate}>Tạo ngày: {new Date(item.ngayTao).toLocaleDateString('vi-VN')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </View>
            <View style={styles.roadmapStatus}>
              <Text style={styles.statusText}>{item.trangThai === 'Active' ? 'Đang học' : item.trangThai}</Text>
            </View>
          </AnimatedPressable>
        ))}
      </View>
    );
  };

  const renderTaoMoi = () => (
    <View>
      <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={[styles.heroCard, SHADOWS.medium]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroTitle, { color: '#3730a3' }]}>Trí Tuệ Nhân Tạo</Text>
          <Text style={[styles.heroDesc, { color: '#4338ca' }]}>Sẽ phân tích và thiết kế lộ trình độc bản dành riêng cho bạn.</Text>
        </View>
        <Ionicons name="sparkles" size={50} color="#6366f1" />
      </LinearGradient>

      <View style={styles.formCard}>
        <Text style={styles.label}>Trình độ hiện tại</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.trinhDo}
            onValueChange={(val) => setForm({ ...form, trinhDo: val })}
            style={styles.picker}
          >
            <Picker.Item label="Người mới bắt đầu" value="Người mới bắt đầu" />
            <Picker.Item label="Đã biết lập trình cơ bản" value="Đã biết lập trình cơ bản" />
            <Picker.Item label="Đã có kinh nghiệm" value="Đã có kinh nghiệm" />
          </Picker>
        </View>

        <Text style={styles.label}>Mục tiêu nghề nghiệp</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.mucTieuNgheNghiep}
            onValueChange={(val) => setForm({ ...form, mucTieuNgheNghiep: val })}
            style={styles.picker}
          >
            <Picker.Item label="Frontend Developer" value="Frontend Developer" />
            <Picker.Item label="Backend Developer" value="Backend Developer" />
            <Picker.Item label="Fullstack Developer" value="Fullstack Developer" />
            <Picker.Item label="Mobile Developer" value="Mobile Developer" />
          </Picker>
        </View>

        <Text style={styles.label}>Phong cách học tập</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.phongCachHoc}
            onValueChange={(val) => setForm({ ...form, phongCachHoc: val })}
            style={styles.picker}
          >
            <Picker.Item label="Thực hành dự án (Project-based)" value="Thực hành dự án" />
            <Picker.Item label="Học lý thuyết bài bản" value="Học lý thuyết bài bản" />
            <Picker.Item label="Học qua giải bài tập" value="Học qua giải bài tập" />
          </Picker>
        </View>
      </View>

      <AnimatedPressable style={[styles.btnActionWrapper, { marginTop: 20 }]} onPress={handleTaoMoi} disabled={loadingTaoMoi}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.btnAction}>
          {loadingTaoMoi ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnActionText}>Tạo Lộ Trình Bằng AI</Text>}
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.replace('/trang-chu')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Lộ Trình AI</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabContainer}>
        <AnimatedPressable style={[styles.tabBtn, activeTab === 'danh-sach' && styles.tabBtnActive]} onPress={() => setActiveTab('danh-sach')}>
          <Text style={[styles.tabText, activeTab === 'danh-sach' && styles.tabTextActive]}>Của Tôi</Text>
        </AnimatedPressable>
        <AnimatedPressable style={[styles.tabBtn, activeTab === 'tao-moi' && styles.tabBtnActive]} onPress={() => setActiveTab('tao-moi')}>
          <Text style={[styles.tabText, activeTab === 'tao-moi' && styles.tabTextActive]}>Tạo Mới</Text>
        </AnimatedPressable>
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'danh-sach' ? renderDanhSach() : renderTaoMoi()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.white },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 20, ...SHADOWS.small, zIndex: 10 },
  tabBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '700', color: COLORS.gray },
  tabTextActive: { color: COLORS.primary, fontWeight: '900' },
  
  contentContainer: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, marginBottom: 15, letterSpacing: -0.5 },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: COLORS.gray, marginTop: 15, fontWeight: '600' },
  
  roadmapCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.card, padding: 20, marginBottom: 15 },
  roadmapHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  roadmapTitle: { fontSize: 17, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  roadmapDate: { fontSize: 13, color: COLORS.gray, fontWeight: '600' },
  roadmapStatus: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: COLORS.lightBorder, alignItems: 'flex-start' },
  statusText: { backgroundColor: '#dcfce7', color: '#16a34a', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold' },
  
  heroCard: { flexDirection: 'row', padding: 25, borderRadius: 24, marginBottom: 25, alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  heroDesc: { fontSize: 14, lineHeight: 22, paddingRight: 10 },
  
  formCard: { backgroundColor: COLORS.white, padding: 20, borderRadius: RADIUS.card, ...SHADOWS.small },
  label: { fontSize: 14, fontWeight: 'bold', color: COLORS.dark, marginBottom: 8 },
  pickerWrapper: { backgroundColor: COLORS.bg, borderRadius: RADIUS.input, borderWidth: 1, borderColor: COLORS.lightBorder, marginBottom: 20, overflow: 'hidden' },
  picker: { height: 50 },
  
  btnActionWrapper: { borderRadius: RADIUS.button, overflow: 'hidden', ...SHADOWS.glow },
  btnAction: { height: 56, justifyContent: 'center', alignItems: 'center' },
  btnActionText: { color: COLORS.white, fontWeight: '900', fontSize: 16 },
});
