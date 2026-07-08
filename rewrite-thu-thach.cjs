const fs = require('fs');
const path = require('path');

const content = `import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThuThachService, ThuThachTuanResponse, BangXepHangResponse } from '../services/thu-thach.service';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  success: '#10b981',
  gold: '#fbbf24',
};

export default function GamificationScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'nhiem-vu' | 'bxh'>('nhiem-vu');
  const [data, setData] = useState<ThuThachTuanResponse | null>(null);
  const [bxh, setBxh] = useState<BangXepHangResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'nhiem-vu') {
        const res = await ThuThachService.getThuThachTuan();
        setData(res.data);
      } else {
        const res = await ThuThachService.getBangXepHang();
        setBxh(res.data);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu Thử Thách.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (maMau: number) => {
    try {
      const res = await ThuThachService.nhanThuong(maMau);
      Alert.alert('Thành công', \`Bạn nhận được \${res.data.expNhanDuoc} EXP!\`);
      fetchData(); // reload
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể nhận thưởng');
    }
  };

  const handleChangeBadge = async (maDanhHieu: number) => {
    try {
      await ThuThachService.doiDanhHieu(maDanhHieu);
      Alert.alert('Thành công', 'Đã đổi danh hiệu!');
      fetchData();
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể đổi danh hiệu');
    }
  };

  if (loading && !data && !bxh) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thử Thách & Danh Hiệu</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'nhiem-vu' && styles.tabBtnActive]} onPress={() => setActiveTab('nhiem-vu')}>
          <Text style={[styles.tabText, activeTab === 'nhiem-vu' && styles.tabTextActive]}>Nhiệm Vụ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'bxh' && styles.tabBtnActive]} onPress={() => setActiveTab('bxh')}>
          <Text style={[styles.tabText, activeTab === 'bxh' && styles.tabTextActive]}>Bảng Xếp Hạng</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {activeTab === 'nhiem-vu' && data && (
          <View>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={32} color={COLORS.gold} />
                <View style={{ marginLeft: 15 }}>
                  <Text style={{ fontSize: 16, color: COLORS.gray }}>Tổng EXP của bạn</Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: COLORS.dark }}>{data.tongExp} EXP</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Nhiệm vụ tuần này</Text>
            {data.danhSachNhiemVu.map((nv) => (
              <View key={nv.maNhiemVu} style={styles.missionCard}>
                <View style={styles.missionHeader}>
                  <Ionicons name={nv.icon as any || 'flame'} size={24} color={COLORS.primary} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.missionTitle}>{nv.tieuDe}</Text>
                    <Text style={styles.missionDesc}>{nv.moTa}</Text>
                  </View>
                  <View style={styles.expBadge}>
                    <Text style={styles.expText}>+{nv.expThuong} EXP</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: \`\${Math.min(nv.phanTramTienDo, 100)}%\` }]} />
                  </View>
                  <Text style={styles.progressText}>{nv.giaTriHienTai}/{nv.chiTieu}</Text>
                </View>

                {nv.trangThai === 'completed' && (
                  <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaim(nv.maMau)}>
                    <Text style={styles.claimText}>Nhận thưởng</Text>
                  </TouchableOpacity>
                )}
                {nv.trangThai === 'claimed' && (
                  <TouchableOpacity style={[styles.claimBtn, { backgroundColor: COLORS.lightGray }]} disabled>
                    <Text style={[styles.claimText, { color: COLORS.gray }]}>Đã nhận</Text>
                  </TouchableOpacity>
                )}
                {nv.trangThai === 'in_progress' && (
                  <TouchableOpacity style={styles.doMissionBtn} onPress={() => Alert.alert('Làm nhiệm vụ', 'Tính năng đang phát triển mini game code trên mobile.')}>
                    <Text style={styles.doMissionText}>Làm nhiệm vụ</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <Text style={styles.sectionTitle}>Danh hiệu của bạn</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 40 }}>
              {data.danhSachDanhHieu.map(dh => (
                <TouchableOpacity 
                  key={dh.maDanhHieu} 
                  style={[styles.badgeCard, dh.dangDeo && { borderColor: COLORS.primary, borderWidth: 2 }]}
                  onPress={() => dh.daMoKhoa ? handleChangeBadge(dh.maDanhHieu) : Alert.alert('Chưa mở khóa', \`Cần \${dh.expYeuCau} EXP\`, [{text: 'OK'}])}
                >
                  <Ionicons name="ribbon" size={40} color={dh.daMoKhoa ? COLORS.gold : COLORS.lightGray} />
                  <Text style={styles.badgeName}>{dh.tenDanhHieu}</Text>
                  <Text style={styles.badgeReq}>{dh.daMoKhoa ? 'Đã mở khóa' : \`Yêu cầu \${dh.expYeuCau} EXP\`}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'bxh' && bxh && (
          <View style={{ paddingBottom: 40 }}>
            {bxh.topUsers.map((u, i) => (
              <View key={u.maHocVien} style={styles.rankCard}>
                <Text style={[styles.rankNumber, i < 3 && { color: COLORS.primary }]}>#{u.hang}</Text>
                <Image source={{ uri: u.anhDaiDien || 'https://via.placeholder.com/150' }} style={styles.rankAvatar} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.rankName}>{u.tenHocVien}</Text>
                  <Text style={styles.rankBadge}>{u.tenDanhHieu}</Text>
                </View>
                <Text style={styles.rankExp}>{u.tongExp} EXP</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: COLORS.white },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 20 },
  tabBtn: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.gray },
  tabTextActive: { color: COLORS.primary },
  contentContainer: { flex: 1, padding: 15 },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 15, marginTop: 10 },
  missionCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, marginBottom: 15 },
  missionHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  missionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark },
  missionDesc: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  expBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  expText: { color: COLORS.primary, fontWeight: '800', fontSize: 12 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  progressBar: { flex: 1, height: 8, backgroundColor: COLORS.lightGray, borderRadius: 4, marginRight: 10 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressText: { fontSize: 12, fontWeight: '600', color: COLORS.gray },
  claimBtn: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  claimText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  doMissionBtn: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary, padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  doMissionText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
  badgeCard: { width: 120, backgroundColor: COLORS.white, padding: 15, borderRadius: 16, alignItems: 'center', marginRight: 15 },
  badgeName: { fontSize: 13, fontWeight: '700', color: COLORS.dark, marginTop: 10, textAlign: 'center' },
  badgeReq: { fontSize: 11, color: COLORS.gray, marginTop: 4, textAlign: 'center' },
  rankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 16, marginBottom: 12 },
  rankNumber: { fontSize: 16, fontWeight: '900', color: COLORS.gray, width: 30 },
  rankAvatar: { width: 44, height: 44, borderRadius: 22 },
  rankName: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  rankBadge: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  rankExp: { fontSize: 15, fontWeight: '900', color: COLORS.gold },
});
`;

fs.writeFileSync(path.join(__dirname, 'Mobile', 'src', 'app', 'thu-thach.tsx'), content);
console.log('Done rewriting thu-thach.tsx');
