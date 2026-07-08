import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
  success: '#10b981',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  glow: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 }
};

const MOCK_ROADMAP = [
  { id: 1, title: 'Cơ bản về JavaScript', desc: 'ES6+, Async/Await, Array Methods', status: 'done', icon: 'logo-javascript' },
  { id: 2, title: 'React Native Cơ Bản', desc: 'View, Text, StyleSheet, Flexbox', status: 'done', icon: 'logo-react' },
  { id: 3, title: 'Quản lý Trạng thái (State)', desc: 'Hooks, Context API, Redux Toolkit', status: 'active', icon: 'layers' },
  { id: 4, title: 'Điều hướng (Navigation)', desc: 'Expo Router, React Navigation', status: 'todo', icon: 'map' },
  { id: 5, title: 'Gọi API & Lưu trữ', desc: 'Axios, Async Storage, SQLite', status: 'todo', icon: 'cloud-download' },
  { id: 6, title: 'Đồ án Thực tế & Tối ưu', desc: 'Publish App Store/Google Play', status: 'todo', icon: 'rocket' },
];

export default function LoTrinhScreen() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasRoadmap, setHasRoadmap] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasRoadmap(true);
    }, 1500);
  };

  const renderSetup = () => (
    <View style={styles.setupContainer}>
      <View style={styles.iconWrapper}>
        <LinearGradient colors={['#ffedd5', '#fed7aa']} style={styles.iconGradient}>
          <Ionicons name="git-network" size={40} color={COLORS.primary} />
        </LinearGradient>
      </View>
      <Text style={styles.setupTitle}>Vẽ Lộ Trình Học Tập</Text>
      <Text style={styles.setupDesc}>AI sẽ phân tích kinh nghiệm hiện tại của bạn và tạo ra một lộ trình học tập tối ưu nhất để đạt được mục tiêu.</Text>
      
      <TouchableOpacity activeOpacity={0.8} onPress={handleGenerate} style={[styles.submitBtnWrapper, SHADOWS.glow]}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.submitBtn}>
          {isGenerating ? (
             <Text style={styles.submitBtnText}>AI đang phân tích...</Text>
          ) : (
             <Text style={styles.submitBtnText}>Tạo Lộ Trình Của Tôi</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderTimeline = () => (
    <ScrollView style={styles.timelineContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Banner */}
      <View style={[styles.banner, SHADOWS.small]}>
        <View style={styles.bannerBadge}>
          <Ionicons name="star" size={14} color={COLORS.primary} />
          <Text style={styles.bannerBadgeText}>MỤC TIÊU</Text>
        </View>
        <Text style={styles.bannerTitle}>React Native Developer</Text>
        <Text style={styles.bannerDesc}>Thời gian dự kiến: 4.5 tháng</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <LinearGradient colors={COLORS.primaryGradient} style={[styles.progressBarFill, { width: '33%' }]} />
          </View>
          <Text style={styles.progressText}>Hoàn thành 2/6 chặng</Text>
        </View>
      </View>

      {/* Timeline List */}
      <View style={styles.timelineList}>
        {MOCK_ROADMAP.map((item, index) => {
          const isLast = index === MOCK_ROADMAP.length - 1;
          const isDone = item.status === 'done';
          const isActive = item.status === 'active';

          return (
            <View key={item.id} style={styles.timelineItem}>
              {/* Cột trái: Line & Node */}
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.timelineNode, 
                  isDone && styles.nodeDone,
                  isActive && styles.nodeActive,
                  isActive && SHADOWS.glow
                ]}>
                  <Ionicons 
                    name={isDone ? 'checkmark' : isActive ? 'play' : 'lock-closed'} 
                    size={16} 
                    color={isDone || isActive ? COLORS.white : COLORS.gray} 
                  />
                </View>
                {!isLast && <View style={[styles.timelineLine, isDone && styles.lineDone]} />}
              </View>

              {/* Cột phải: Content */}
              <View style={[
                styles.timelineContent, 
                SHADOWS.small,
                isActive && styles.contentActive
              ]}>
                <View style={[styles.contentIconBox, { backgroundColor: isDone ? '#dcfce7' : isActive ? COLORS.primaryLight : COLORS.bg }]}>
                  <Ionicons name={item.icon as any} size={20} color={isDone ? COLORS.success : isActive ? COLORS.primary : COLORS.gray} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, isActive && { color: COLORS.primary }]}>Chặng {item.id}: {item.title}</Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lộ Trình Cá Nhân</Text>
        <View style={{ width: 40 }} />
      </View>

      {hasRoadmap ? renderTimeline() : renderSetup()}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  
  // Setup
  setupContainer: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 },
  iconWrapper: { alignItems: 'center', marginBottom: 20 },
  iconGradient: { width: 90, height: 90, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  setupTitle: { fontSize: 24, fontWeight: '900', color: COLORS.dark, marginBottom: 10 },
  setupDesc: { textAlign: 'center', color: COLORS.gray, fontSize: 15, lineHeight: 22, marginBottom: 40, paddingHorizontal: 10 },
  submitBtnWrapper: { borderRadius: 16, overflow: 'hidden', width: '100%' },
  submitBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },

  // Timeline
  timelineContainer: { flex: 1, paddingHorizontal: 20 },
  banner: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 30 },
  bannerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 10 },
  bannerBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '800', marginLeft: 4 },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.dark, marginBottom: 5 },
  bannerDesc: { fontSize: 14, color: COLORS.gray, marginBottom: 15 },
  progressSection: { marginTop: 5 },
  progressBarBg: { height: 8, backgroundColor: COLORS.bg, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 13, color: COLORS.gray, fontWeight: '600', textAlign: 'right' },

  timelineList: { paddingLeft: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  
  timelineLeft: { width: 30, alignItems: 'center' },
  timelineNode: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.lightGray, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  nodeDone: { backgroundColor: COLORS.success },
  nodeActive: { backgroundColor: COLORS.primary },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.lightGray, marginVertical: -5, zIndex: 1 },
  lineDone: { backgroundColor: COLORS.success },

  timelineContent: { flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 15, marginLeft: 15, flexDirection: 'row', alignItems: 'center' },
  contentActive: { borderWidth: 1, borderColor: COLORS.primaryLight, backgroundColor: '#fffbfa' },
  contentIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  itemDesc: { fontSize: 13, color: COLORS.gray, lineHeight: 18 },
});
