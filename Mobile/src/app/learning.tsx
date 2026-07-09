import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, Image, StatusBar, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../configs/api';
import { ChatBot } from '../components/chat-bot';
import { AnimatedPressable } from '../components/animated-pressable';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  dark: '#020617', // Sâu hơn nữa cho player
  darkBg: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#94a3b8', // Gray sáng hơn trên nền tối
  lightGray: '#334155', // Viền tối
  success: '#10b981',
  blue: '#3b82f6'
};

export default function LearningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  const [activeTab, setActiveTab] = useState<'lessons' | 'docs'>('lessons');
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLearningContent();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchLearningContent = async () => {
    try {
      const response = await api.get(`/NoiDungKhoaHoc/${id}`);
      setCourseData(response.data);
      if (response.data?.chuongHocs?.length > 0 && response.data.chuongHocs[0].baiHocs?.length > 0) {
         setCurrentVideo(response.data.chuongHocs[0].baiHocs[0].duongDanVideo);
      }
    } catch (error: any) {
      console.error('Error fetching course content:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải nội dung khóa học.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!courseData) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.white }}>Không có dữ liệu khóa học hoặc bạn chưa đăng ký.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.primary }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} translucent={false} />
      
      {/* Video Player (Cinematic Dark Vibe) */}
      <View style={styles.videoContainer}>
        <Image 
          source={{ uri: courseData.hinhAnh || 'https://via.placeholder.com/800x450' }} 
          style={styles.videoImg} 
        />
        <LinearGradient 
          colors={['rgba(2,6,23,0.8)', 'rgba(2,6,23,0.1)', 'rgba(2,6,23,0.9)']} 
          style={styles.videoOverlay}
        >
          {/* Top Bar */}
          <View style={styles.videoTopBar}>
            <AnimatedPressable style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-down" size={32} color={COLORS.white} />
            </AnimatedPressable>
            <AnimatedPressable style={styles.iconBtn} onPress={() => Alert.alert('Cài đặt', 'Chỉnh chất lượng & Tốc độ')}>
              <Ionicons name="settings" size={24} color={COLORS.white} />
            </AnimatedPressable>
          </View>
          
          {/* Play Button */}
          <AnimatedPressable style={styles.playBtn} scaleTo={0.9} onPress={() => Alert.alert('Phát', 'Video URL: ' + currentVideo)}>
            <LinearGradient colors={['#ff9955', '#fb873f']} style={styles.playGradient}>
              <Ionicons name="play" size={36} color={COLORS.white} style={{ marginLeft: 5 }} />
            </LinearGradient>
          </AnimatedPressable>
          
          {/* Bottom Control */}
          <View style={styles.videoBottomBar}>
            <Text style={styles.videoTime}>00:00 / 00:00</Text>
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
              <View style={styles.progressDot} />
            </View>
            <AnimatedPressable>
              <Ionicons name="expand" size={22} color={COLORS.white} />
            </AnimatedPressable>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerInfo}>
          <Text style={styles.lessonTitle}>{courseData.tenKhoaHoc}</Text>
          <Text style={styles.courseTitle}>Giảng viên: {courseData.giangVien?.hoTen || 'EducodeAI'}</Text>
        </View>

        {/* Custom Tabs (Dark Mode) */}
        <View style={styles.tabContainer}>
          <AnimatedPressable style={[styles.tabBtn, activeTab === 'lessons' && styles.tabBtnActive]} onPress={() => setActiveTab('lessons')}>
            <Text style={[styles.tabText, activeTab === 'lessons' && styles.tabTextActive]}>Bài giảng</Text>
          </AnimatedPressable>
          <AnimatedPressable style={[styles.tabBtn, activeTab === 'docs' && styles.tabBtnActive]} onPress={() => setActiveTab('docs')}>
            <Text style={[styles.tabText, activeTab === 'docs' && styles.tabTextActive]}>Tài liệu & Hỏi đáp</Text>
          </AnimatedPressable>
        </View>

        {activeTab === 'lessons' ? (
          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {courseData.chuongHocs?.map((chuong: any, idx: number) => (
              <View key={chuong.maChuongHoc} style={{ marginBottom: 25 }}>
                <Text style={styles.sectionTitle}>Chương {idx + 1}: {chuong.tenChuong}</Text>
                {chuong.baiHocs?.map((lesson: any, bIdx: number) => {
                  const isPlaying = currentVideo === lesson.duongDanVideo;
                  return (
                    <AnimatedPressable 
                      key={lesson.maBaiHoc} 
                      style={[styles.lessonCard, isPlaying && styles.lessonPlaying]}
                      onPress={() => setCurrentVideo(lesson.duongDanVideo)}
                    >
                      <View style={styles.lessonLeft}>
                        <Text style={[styles.lessonIndex, isPlaying && { color: COLORS.primary }]}>{String(bIdx + 1).padStart(2, '0')}</Text>
                        <View>
                          <Text style={[styles.lessonName, isPlaying && { color: COLORS.white }]}>{lesson.tenBaiHoc}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="time-outline" size={14} color={isPlaying ? COLORS.primary : COLORS.gray} />
                            <Text style={[styles.lessonDuration, isPlaying && { color: COLORS.primary }]}>15:00</Text>
                          </View>
                        </View>
                      </View>
                      {isPlaying ? (
                        <View style={styles.playingIndicator}>
                          <Ionicons name="stats-chart" size={16} color={COLORS.primary} />
                        </View>
                      ) : (
                        <Ionicons name="play-circle-outline" size={26} color={COLORS.gray} />
                      )}
                    </AnimatedPressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView style={styles.listContainer}>
            <View style={styles.docCard}>
              <Ionicons name="document-text" size={32} color={COLORS.primary} />
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={styles.docTitle}>Slide Bài Giảng.pdf</Text>
                <Text style={styles.docSize}>2.4 MB</Text>
              </View>
              <Ionicons name="download-outline" size={24} color={COLORS.white} />
            </View>
            <View style={styles.docCard}>
              <Ionicons name="logo-github" size={32} color={COLORS.white} />
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={styles.docTitle}>Source Code GitHub</Text>
                <Text style={styles.docSize}>Link ngoài</Text>
              </View>
              <Ionicons name="open-outline" size={24} color={COLORS.white} />
            </View>
          </ScrollView>
        )}
      </View>

      {/* Tích hợp ChatBot Component bên dưới */}
      <ChatBot courseId={Number(id) || 0} courseName={courseData?.tenKhoaHoc || ''} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.dark },
  
  // Video Player (Cinematic)
  videoContainer: { width: '100%', aspectRatio: 16/9, backgroundColor: '#000', position: 'relative' },
  videoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between' },
  videoTopBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  iconBtn: { padding: 5 },
  playBtn: { alignSelf: 'center' },
  playGradient: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: {width:0,height:0}, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
  videoBottomBar: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingBottom: 20 },
  videoTime: { color: COLORS.white, fontSize: 13, marginRight: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
  progressBarBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginRight: 15, position: 'relative' },
  progressBarFill: { width: '35%', height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  progressDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.primary, position: 'absolute', left: '35%', top: -5, marginLeft: -7, borderWidth: 2, borderColor: COLORS.white },

  // Content (Dark Mode)
  contentContainer: { flex: 1, backgroundColor: COLORS.darkBg },
  headerInfo: { padding: 20, paddingBottom: 15 },
  lessonTitle: { fontSize: 24, fontWeight: '900', color: COLORS.white, marginBottom: 8, letterSpacing: -0.5 },
  courseTitle: { fontSize: 15, color: COLORS.gray, fontWeight: '500' },
  
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  tabBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 16, fontWeight: '700', color: COLORS.gray },
  tabTextActive: { color: COLORS.white, fontWeight: '900' },
  
  listContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white, marginBottom: 16, letterSpacing: -0.5 },
  
  lessonCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: COLORS.dark, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.lightGray },
  lessonPlaying: { borderColor: COLORS.primary, backgroundColor: 'rgba(251, 135, 63, 0.1)' },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  lessonIndex: { fontSize: 20, fontWeight: '900', color: COLORS.lightGray, marginRight: 16, fontVariant: ['tabular-nums'] },
  lessonName: { fontSize: 16, fontWeight: '700', color: '#cbd5e1', lineHeight: 22 },
  lessonDuration: { marginLeft: 6, fontSize: 13, color: COLORS.gray, fontWeight: '600' },
  playingIndicator: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(251, 135, 63, 0.2)', justifyContent: 'center', alignItems: 'center' },

  // Docs
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.dark, padding: 18, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: COLORS.lightGray },
  docTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  docSize: { fontSize: 13, color: COLORS.gray }
});
