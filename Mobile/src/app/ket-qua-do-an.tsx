import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import api from '../configs/api';
import { AnimatedPressable } from '../components/animated-pressable';

const COLORS = {
  primary: '#fb873f', primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a', bg: '#f8fafc', white: '#ffffff', gray: '#64748b',
  success: '#10b981', lightGray: '#e2e8f0'
};
const SHADOWS = {
  small: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  medium: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  glow: { shadowColor: '#fb873f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }
};

export default function KetQuaDoAnScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) fetchResult();
    else { Alert.alert('Lỗi', 'Không tìm thấy session đồ án.'); router.back(); }
  }, [sessionId]);

  const fetchResult = async () => {
    try {
      const res = await api.get(`/SinhDoAnAI/result/${sessionId}`);
      setData(res.data);
    } catch (e) { Alert.alert('Lỗi', 'Không tải được kết quả đồ án.'); }
    finally { setLoading(false); }
  };

  if (loading) return <View style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}><ActivityIndicator size="large" color={COLORS.primary}/></View>;
  if (!data) return <View style={styles.safeArea}><Text>Không có dữ liệu.</Text></View>;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Chi Tiết Đồ Án</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.card, SHADOWS.small]}>
          <Text style={styles.projectTitle}>{data.TenDoAn}</Text>
          <Text style={styles.projectDesc}>{data.MoTa}</Text>
        </View>

        <View style={[styles.card, SHADOWS.small]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
            <Ionicons name="layers" size={22} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Cấu Trúc Hệ Thống</Text>
          </View>
          <Markdown style={markdownStyles}>{data.CauTrucHeThong || 'Chưa có thông tin'}</Markdown>
        </View>

        <View style={[styles.card, SHADOWS.small]}>
           <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
            <Ionicons name="list" size={22} color={COLORS.success} />
            <Text style={styles.sectionTitle}>Task Checklist</Text>
          </View>
          <Markdown style={markdownStyles}>{data.TaskChecklist || 'Chưa có thông tin'}</Markdown>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.bottomBar}>
        <AnimatedPressable onPress={() => router.push({ pathname: '/phong-van-do-an' as any, params: { sessionId } })} style={styles.interviewBtnWrapper}>
          <LinearGradient colors={['#10b981', '#059669']} style={styles.interviewBtn}>
            <Ionicons name="mic" size={24} color={COLORS.white} />
            <Text style={styles.interviewBtnText}>Bảo Vệ Đồ Án Ngay</Text>
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'rgba(248, 250, 252, 0.9)' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  contentContainer: { padding: 20 },
  card: { backgroundColor: COLORS.white, padding: 24, borderRadius: 28, marginBottom: 20 },
  projectTitle: { fontSize: 24, fontWeight: '900', color: COLORS.dark, marginBottom: 10, letterSpacing: -0.5 },
  projectDesc: { fontSize: 16, color: COLORS.gray, lineHeight: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginLeft: 10 },
  bottomBar: { position: 'absolute', bottom: 30, left: 20, right: 20, ...SHADOWS.glow },
  interviewBtnWrapper: { borderRadius: 24, overflow: 'hidden' },
  interviewBtn: { flexDirection: 'row', height: 64, justifyContent: 'center', alignItems: 'center' },
  interviewBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '900', marginLeft: 10 }
});

const markdownStyles = StyleSheet.create({
  body: { color: COLORS.dark, fontSize: 15, lineHeight: 24 },
  code_inline: { backgroundColor: COLORS.lightGray, borderRadius: 6, padding: 4, color: COLORS.primary },
  strong: { fontWeight: '900', color: COLORS.dark },
});
