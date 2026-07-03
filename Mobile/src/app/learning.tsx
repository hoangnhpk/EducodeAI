import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, Image, StatusBar, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
  success: '#10b981',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
};

const MOCK_LESSONS = [
  { id: 1, title: 'Bài 1: Giới thiệu khóa học', duration: '05:30', status: 'completed' },
  { id: 2, title: 'Bài 2: Cài đặt môi trường lập trình', duration: '12:45', status: 'playing' },
  { id: 3, title: 'Bài 3: Cấu trúc thư mục chuẩn', duration: '08:20', status: 'locked' },
  { id: 4, title: 'Bài 4: Thành phần cơ bản (Components)', duration: '15:10', status: 'locked' },
  { id: 5, title: 'Bài 5: Quản lý trạng thái (State)', duration: '22:00', status: 'locked' },
];

export default function LearningScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lessons' | 'docs'>('lessons');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Video Player Mock */}
      <View style={styles.videoContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80' }} 
          style={styles.videoImg} 
        />
        <View style={styles.videoOverlay}>
          {/* Top Bar inside Video */}
          <View style={styles.videoTopBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-down" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Cài đặt', 'Chỉnh chất lượng video & Tốc độ phát')}>
              <Ionicons name="settings-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          {/* Play Button */}
          <TouchableOpacity style={styles.playBtn} onPress={() => Alert.alert('Phát', 'Video đang tạm dừng. (Mock)')}>
            <Ionicons name="play" size={32} color={COLORS.white} style={{ marginLeft: 5 }} />
          </TouchableOpacity>
          
          {/* Bottom Control Bar */}
          <View style={styles.videoBottomBar}>
            <Text style={styles.videoTime}>02:15 / 12:45</Text>
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
              <View style={styles.progressDot} />
            </View>
            <Ionicons name="expand" size={20} color={COLORS.white} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <Text style={styles.lessonTitle}>Bài 2: Cài đặt môi trường lập trình</Text>
          <Text style={styles.courseTitle}>Lập trình C# ASP.NET Core API</Text>
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'lessons' && styles.tabBtnActive]}
            onPress={() => setActiveTab('lessons')}
          >
            <Text style={[styles.tabText, activeTab === 'lessons' && styles.tabTextActive]}>Bài giảng (5)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'docs' && styles.tabBtnActive]}
            onPress={() => setActiveTab('docs')}
          >
            <Text style={[styles.tabText, activeTab === 'docs' && styles.tabTextActive]}>Tài liệu</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'lessons' ? (
          <View style={styles.listContainer}>
            {MOCK_LESSONS.map((lesson) => (
              <TouchableOpacity key={lesson.id} activeOpacity={lesson.status === 'locked' ? 1 : 0.7} style={[styles.lessonCard, lesson.status === 'playing' && styles.lessonPlaying]}>
                <View style={styles.lessonIconBox}>
                  {lesson.status === 'completed' ? (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  ) : lesson.status === 'playing' ? (
                    <View style={styles.playingBars}>
                      <View style={[styles.bar, { height: 12 }]} />
                      <View style={[styles.bar, { height: 18 }]} />
                      <View style={[styles.bar, { height: 10 }]} />
                    </View>
                  ) : (
                    <Text style={styles.lessonIndex}>{lesson.id}</Text>
                  )}
                </View>
                
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonName, lesson.status === 'playing' && { color: COLORS.primary }, lesson.status === 'locked' && { color: COLORS.gray }]}>
                    {lesson.title}
                  </Text>
                  <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                </View>
                
                {lesson.status === 'locked' && (
                  <Ionicons name="lock-closed" size={18} color={COLORS.lightGray} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.docsContainer}>
            <View style={[styles.docCard, SHADOWS.small]}>
              <View style={styles.docIconBox}>
                <Ionicons name="document-text" size={24} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docTitle}>Slide_Bai2_CaiDat.pdf</Text>
                <Text style={styles.docSize}>2.4 MB</Text>
              </View>
              <Ionicons name="download-outline" size={24} color={COLORS.dark} />
            </View>
            <View style={[styles.docCard, SHADOWS.small]}>
              <View style={styles.docIconBox}>
                <Ionicons name="logo-github" size={24} color={COLORS.dark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docTitle}>Source Code (Github)</Text>
                <Text style={styles.docSize}>Link truy cập</Text>
              </View>
              <Ionicons name="open-outline" size={24} color={COLORS.dark} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  
  // Video Player
  videoContainer: { width: '100%', height: 230, backgroundColor: '#000', position: 'relative' },
  videoImg: { width: '100%', height: '100%', opacity: 0.6 },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between' },
  videoTopBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 15 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  playBtn: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(251, 135, 63, 0.9)', justifyContent: 'center', alignItems: 'center' },
  videoBottomBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 15 },
  videoTime: { color: COLORS.white, fontSize: 12, fontWeight: '600', marginRight: 10 },
  progressBarBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginRight: 15, position: 'relative' },
  progressBarFill: { width: '25%', height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  progressDot: { position: 'absolute', left: '25%', top: -4, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary, marginLeft: -6 },

  // Content
  contentContainer: { flex: 1 },
  headerInfo: { padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  lessonTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 5 },
  courseTitle: { fontSize: 14, color: COLORS.gray },

  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  tabBtn: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.gray },
  tabTextActive: { color: COLORS.primary, fontWeight: '800' },

  listContainer: { padding: 20 },
  lessonCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  lessonPlaying: { backgroundColor: COLORS.primaryLight, padding: 12, borderRadius: 12, marginHorizontal: -12 },
  lessonIconBox: { width: 30, alignItems: 'center', marginRight: 10 },
  lessonIndex: { fontSize: 16, fontWeight: '700', color: COLORS.gray },
  playingBars: { flexDirection: 'row', alignItems: 'flex-end', height: 20 },
  bar: { width: 4, backgroundColor: COLORS.primary, marginHorizontal: 2, borderRadius: 2 },
  lessonInfo: { flex: 1 },
  lessonName: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 4, lineHeight: 20 },
  lessonDuration: { fontSize: 13, color: COLORS.gray },

  docsContainer: { padding: 20 },
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 16, marginBottom: 15 },
  docIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  docTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  docSize: { fontSize: 13, color: COLORS.gray },
});
