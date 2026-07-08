import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThuThachService, NhiemVuThuThach } from '../services/thu-thach.service';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '../components/animated-pressable';

const COLORS = {
  primary: '#fb873f', primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a', bg: '#f8fafc', white: '#ffffff', gray: '#64748b',
  success: '#10b981', gold: '#fbbf24', lightGray: '#e2e8f0', primaryLight: '#fff3ed'
};
const SHADOWS = {
  small: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  medium: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  glow: { shadowColor: '#fb873f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }
};

export default function ThuThachScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'nhiem-vu' | 'bxh'>('nhiem-vu');
  const [nhiemVus, setNhiemVus] = useState<NhiemVuThuThach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'nhiem-vu') fetchNhiemVu();
  }, [activeTab]);

  const fetchNhiemVu = async () => {
    setLoading(true);
    try {
      const res = await ThuThachService.getThuThachTuan();
      setNhiemVus(res.data.danhSachNhiemVu);
    } catch (e) { Alert.alert('Lỗi', 'Không thể lấy danh sách nhiệm vụ'); }
    finally { setLoading(false); }
  };

  const handleLamNhiemVu = (nv: NhiemVuThuThach) => {
    Alert.alert('Thử thách', `Bắt đầu nhiệm vụ: ${nv.tieuDe}\nYêu cầu: ${nv.chiTieu}`);
  };

  const handleNhanThuong = async (id: number) => {
    try {
      await ThuThachService.nhanThuong(id);
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
          const isDone = nv.trangThai !== 'in_progress';
          return (
            <View key={nv.maMau} style={[styles.nvCard, SHADOWS.small]}>
              <View style={styles.nvHeader}>
                <View style={[styles.iconBox, { backgroundColor: isDone ? '#dcfce7' : COLORS.primaryLight }]}>
                  <Ionicons name={isDone ? 'checkmark' : 'star'} size={20} color={isDone ? COLORS.success : COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.nvTitle}>{nv.tieuDe}</Text>
                  <Text style={styles.nvDesc}>Tiến độ: {nv.giaTriHienTai} / {nv.chiTieu}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Text style={styles.tagXP}>+{nv.expThuong} EXP</Text>
                    <Text style={styles.tagCoin}>+{(nv.expThuong / 10)} Thẻ</Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min((nv.giaTriHienTai / nv.chiTieu) * 100, 100)}%` }]} />
              </View>
              
              {!isDone ? (
                <AnimatedPressable style={styles.btnActionWrapper} onPress={() => handleLamNhiemVu(nv)}>
                  <LinearGradient colors={COLORS.primaryGradient} style={styles.btnAction}>
                    <Text style={styles.btnActionText}>Làm ngay</Text>
                  </LinearGradient>
                </AnimatedPressable>
              ) : nv.trangThai === 'completed' ? (
                <AnimatedPressable style={styles.btnActionWrapper} onPress={() => handleNhanThuong(nv.maMau)}>
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
