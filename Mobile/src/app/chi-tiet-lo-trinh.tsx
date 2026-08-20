import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, Alert, StatusBar, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiRoadmapService, LoTrinhAICuaToiDTO, KetQuaLoTrinhAI } from '../services/ai-roadmap.service';
import { COLORS, RADIUS, SHADOWS } from '../configs/theme';
import { AnimatedPressable } from '../components/animated-pressable';

export default function ChiTietLoTrinhScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const maLoTrinh = Number(id);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LoTrinhAICuaToiDTO | null>(null);
  const [roadmap, setRoadmap] = useState<KetQuaLoTrinhAI | null>(null);
  
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  useEffect(() => {
    if (maLoTrinh) fetchDetail();
  }, [maLoTrinh]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await aiRoadmapService.getChiTietLoTrinh(maLoTrinh);
      setData(res.data);
      if (res.data.noiDungJSON) {
        setRoadmap(JSON.parse(res.data.noiDungJSON));
      }
    } catch (e: any) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const togglePhase = (phaseId: number) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!data || !roadmap) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.gray }}>Lỗi dữ liệu lộ trình.</Text>
        <AnimatedPressable style={[styles.backBtn, { marginTop: 20 }]} onPress={() => router.back()}>
           <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </AnimatedPressable>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </AnimatedPressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi Tiết Lộ Trình</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient colors={COLORS.primaryGradient} style={[styles.heroCard, SHADOWS.medium]}>
          <Text style={styles.heroTarget}>{roadmap.mucTieu || data.mucTieuNgheNghiep}</Text>
          <Text style={styles.heroName}>{roadmap.tenLoTrinh}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.metaBadge}>
              <Ionicons name="time-outline" size={16} color={COLORS.white} />
              <Text style={styles.metaText}>{roadmap.tongThoiGian}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="ribbon-outline" size={16} color={COLORS.white} />
              <Text style={styles.metaText}>{data.trangThai}</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Các Giai Đoạn</Text>

        {/* Timeline */}
        <View style={styles.timeline}>
          {roadmap.loTrinh?.map((phase, index) => {
            const isExpanded = expandedPhase === phase.giaiDoan;
            const isLast = index === roadmap.loTrinh.length - 1;

            return (
              <View key={phase.giaiDoan} style={styles.phaseContainer}>
                {/* Timeline Line */}
                {!isLast && <View style={styles.timelineLine} />}
                
                {/* Phase Header */}
                <AnimatedPressable style={styles.phaseHeader} onPress={() => togglePhase(phase.giaiDoan)}>
                  <View style={[styles.phaseDot, isExpanded && { backgroundColor: COLORS.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.phaseTitle, isExpanded && { color: COLORS.primary }]}>
                      Giai đoạn {phase.giaiDoan}: {phase.tenGiaiDoan}
                    </Text>
                    <Text style={styles.phaseTime}>{phase.thoiGian}</Text>
                  </View>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.gray} />
                </AnimatedPressable>

                {/* Phase Content (Expanded) */}
                {isExpanded && (
                  <View style={styles.phaseContent}>
                    <Text style={styles.phaseGoal}>Mục tiêu: {phase.mucTieu}</Text>
                    
                    {phase.noiDung?.map((baiHoc, i) => (
                      <View key={i} style={styles.lessonCard}>
                        <View style={styles.lessonHeader}>
                          <Ionicons name="book-outline" size={18} color={COLORS.info} style={{ marginRight: 8 }} />
                          <Text style={styles.lessonTitle}>{baiHoc.chuDe}</Text>
                        </View>
                        <Text style={styles.lessonDesc}>{baiHoc.moTa}</Text>
                        <View style={styles.skillsContainer}>
                          {baiHoc.kyNangDatDuoc?.map((skill, sIdx) => (
                            <View key={sIdx} style={styles.skillBadge}>
                              <Text style={styles.skillText}>{skill}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightBorder },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5, flex: 1, textAlign: 'center', marginHorizontal: 10 },
  
  contentContainer: { flex: 1, padding: 20 },
  
  heroCard: { padding: 25, borderRadius: RADIUS.card, marginBottom: 25 },
  heroTarget: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  heroName: { fontSize: 24, fontWeight: '900', color: COLORS.white, marginBottom: 15, lineHeight: 32 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap' },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 10, marginBottom: 10 },
  metaText: { color: COLORS.white, fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  
  sectionTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, marginBottom: 20, letterSpacing: -0.5 },
  
  timeline: { paddingLeft: 10 },
  phaseContainer: { marginBottom: 15, position: 'relative' },
  timelineLine: { position: 'absolute', left: 5, top: 30, bottom: -30, width: 2, backgroundColor: COLORS.lightBorder, zIndex: 0 },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: RADIUS.button, ...SHADOWS.small, zIndex: 1 },
  phaseDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.grayLight, marginRight: 15 },
  phaseTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  phaseTime: { fontSize: 13, color: COLORS.gray, fontWeight: '600' },
  
  phaseContent: { paddingLeft: 30, paddingTop: 15, paddingBottom: 10 },
  phaseGoal: { fontSize: 14, color: COLORS.primary, fontWeight: '700', marginBottom: 15, fontStyle: 'italic' },
  
  lessonCard: { backgroundColor: COLORS.white, padding: 15, borderRadius: RADIUS.button, marginBottom: 10, borderWidth: 1, borderColor: COLORS.lightBorder },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  lessonTitle: { fontSize: 15, fontWeight: '800', color: COLORS.dark, flex: 1 },
  lessonDesc: { fontSize: 14, color: COLORS.gray, lineHeight: 20, marginBottom: 12 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  skillBadge: { backgroundColor: COLORS.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: COLORS.lightBorder },
  skillText: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
});
