const fs = require('fs');
const path = require('path');

const content = `import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { aiRoadmapService, LoTrinhAICuaToiDTO, KetQuaLoTrinhAI } from '../services/ai-roadmap.service';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  success: '#10b981',
};

export default function LoTrinhScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-roadmap' | 'create'>('my-roadmap');
  const [roadmaps, setRoadmaps] = useState<LoTrinhAICuaToiDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [mucTieu, setMucTieu] = useState('');
  const [kinhNghiem, setKinhNghiem] = useState('');
  const [khoKhan, setKhoKhan] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (activeTab === 'my-roadmap') {
      fetchRoadmaps();
    }
  }, [activeTab]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await aiRoadmapService.getAllLoTrinh();
      setRoadmaps(res.data);
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể lấy danh sách lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!mucTieu || !kinhNghiem) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mục tiêu và kinh nghiệm!');
      return;
    }
    setGenerating(true);
    try {
      await aiRoadmapService.taoLoTrinh({
        mucTieuNgheNghiep: mucTieu,
        kinhNghiem: kinhNghiem,
        khoKhan: khoKhan || 'Không',
        trinhDo: 'Cơ bản',
        phongCachHoc: 'Thực hành nhiều',
        kienThucHienCo: 'Chưa có nhiều',
      });
      Alert.alert('Thành công', 'Lộ trình AI đã được tạo!');
      setActiveTab('my-roadmap');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể tạo lộ trình');
    } finally {
      setGenerating(false);
    }
  };

  const renderMyRoadmaps = () => {
    if (loading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
    if (roadmaps.length === 0) {
      return (
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Ionicons name="map-outline" size={64} color={COLORS.lightGray} />
          <Text style={{ color: COLORS.gray, marginTop: 10 }}>Bạn chưa có lộ trình nào.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => setActiveTab('create')}>
            <Text style={styles.btnPrimaryText}>Tạo lộ trình AI ngay</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        {roadmaps.map((rm) => {
          let data: KetQuaLoTrinhAI | null = null;
          try {
             data = JSON.parse(rm.noiDungJSON);
          } catch (e) {}

          return (
            <TouchableOpacity 
              key={rm.maLoTrinh} 
              style={styles.card}
              onPress={() => Alert.alert('Chi tiết lộ trình', 'Tính năng xem chi tiết đang được phát triển trên mobile.')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="school" size={24} color={COLORS.primary} />
                <Text style={styles.cardTitle}>{rm.mucTieuNgheNghiep}</Text>
              </View>
              <Text style={{ color: COLORS.gray, marginBottom: 5 }}>Tạo ngày: {new Date(rm.ngayTao).toLocaleDateString('vi-VN')}</Text>
              <Text style={{ color: COLORS.dark }}>Trạng thái: {rm.trangThai}</Text>
              {data && <Text style={{ color: COLORS.gray, marginTop: 5 }}>Gồm {data.loTrinh?.length || 0} giai đoạn</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderCreateForm = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.label}>Mục tiêu nghề nghiệp (VD: Frontend Dev, Data Analyst):</Text>
        <TextInput style={styles.input} value={mucTieu} onChangeText={setMucTieu} placeholder="Nhập mục tiêu của bạn..." />

        <Text style={styles.label}>Kinh nghiệm hiện tại:</Text>
        <TextInput style={styles.input} value={kinhNghiem} onChangeText={setKinhNghiem} placeholder="VD: Đã biết HTML, CSS cơ bản..." multiline />

        <Text style={styles.label}>Khó khăn đang gặp phải:</Text>
        <TextInput style={styles.input} value={khoKhan} onChangeText={setKhoKhan} placeholder="VD: Khó nhớ cú pháp, không biết học gì tiếp theo..." multiline />

        <TouchableOpacity style={[styles.btnPrimary, { marginTop: 20 }, generating && { opacity: 0.7 }]} onPress={handleCreate} disabled={generating}>
          {generating ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnPrimaryText}>✨ Sinh Lộ Trình AI</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lộ Trình AI</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'my-roadmap' && styles.tabBtnActive]} onPress={() => setActiveTab('my-roadmap')}>
          <Text style={[styles.tabText, activeTab === 'my-roadmap' && styles.tabTextActive]}>Lộ trình của tôi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'create' && styles.tabBtnActive]} onPress={() => setActiveTab('create')}>
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>Tạo mới AI</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === 'my-roadmap' ? renderMyRoadmaps() : renderCreateForm()}
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
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginLeft: 10 },
  btnPrimary: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  btnPrimaryText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.dark, marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: COLORS.bg, borderRadius: 12, padding: 12, fontSize: 15, color: COLORS.dark, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 44 },
});
`;

fs.writeFileSync(path.join(__dirname, 'Mobile', 'src', 'app', 'lo-trinh.tsx'), content);
console.log('Done rewriting lo-trinh.tsx');
