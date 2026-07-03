import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, Image, StatusBar, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

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
  warning: '#f59e0b',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  glow: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 }
};

const MOCK_CURRICULUM = [
  { id: 1, title: 'Bài 1: Giới thiệu khóa học', duration: '05:30', isLocked: false, isCompleted: true },
  { id: 2, title: 'Bài 2: Cài đặt môi trường lập trình', duration: '12:45', isLocked: false, isCompleted: false },
  { id: 3, title: 'Bài 3: Cấu trúc thư mục chuẩn', duration: '08:20', isLocked: true, isCompleted: false },
  { id: 4, title: 'Bài 4: Thành phần cơ bản (Components)', duration: '15:10', isLocked: true, isCompleted: false },
  { id: 5, title: 'Bài 5: Quản lý trạng thái (State)', duration: '22:00', isLocked: true, isCompleted: false },
];

export default function CourseDetailScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum'>('curriculum');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&q=80' }} 
            style={styles.bannerImage} 
          />
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)']} style={styles.bannerOverlay} />
          
          {/* Nút Back nổi */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playBtn} onPress={() => Alert.alert('Trailer', 'Đang phát video giới thiệu khóa học...')}>
            <Ionicons name="play" size={40} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={() => Alert.alert('Chia sẻ', 'Sao chép đường liên kết khóa học')}>
            <Ionicons name="share-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Thông tin chính */}
        <View style={styles.contentContainer}>
          <View style={styles.tagWrapper}>
            <Text style={styles.tagText}>C# ASP.NET Core</Text>
          </View>
          
          <Text style={styles.title}>Lập trình C# ASP.NET Core API Thực chiến</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color={COLORS.warning} />
              <Text style={styles.statText}><Text style={styles.statBold}>4.8</Text> (2.1k đánh giá)</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color={COLORS.primary} />
              <Text style={styles.statText}><Text style={styles.statBold}>5.2k</Text> học viên</Text>
            </View>
          </View>

          {/* Tác giả */}
          <View style={styles.authorRow}>
            <Image source={{ uri: 'https://ui-avatars.com/api/?name=Quoc+Hung&background=fb873f&color=fff' }} style={styles.authorImg} />
            <View>
              <Text style={styles.authorName}>Giảng viên: Quốc Hùng</Text>
              <Text style={styles.authorTitle}>Senior Backend Engineer</Text>
            </View>
          </View>

          {/* Custom Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Tổng quan</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'curriculum' && styles.tabBtnActive]}
              onPress={() => setActiveTab('curriculum')}
            >
              <Text style={[styles.tabText, activeTab === 'curriculum' && styles.tabTextActive]}>Chương trình học</Text>
            </TouchableOpacity>
          </View>

          {/* Nội dung Tab */}
          {activeTab === 'overview' ? (
            <View>
              <Text style={styles.sectionTitle}>Về khóa học này</Text>
              <Text style={styles.descText}>
                Khóa học cung cấp kiến thức từ cơ bản đến nâng cao về lập trình Web API sử dụng C# và framework ASP.NET Core mới nhất. 
                Bạn sẽ được thực hành xây dựng hệ thống E-commerce thực tế, học cách áp dụng Clean Architecture, Repository Pattern và JWT Authentication.
              </Text>
              
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Bạn sẽ học được gì?</Text>
              {['Thiết kế RESTful API chuẩn mực', 'Áp dụng Clean Architecture', 'Xử lý xác thực JWT & Phân quyền', 'Triển khai Docker & AWS'].map((item, idx) => (
                <View key={idx} style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.curriculumContainer}>
              <Text style={styles.sectionTitle}>Danh sách bài giảng ({MOCK_CURRICULUM.length})</Text>
              {MOCK_CURRICULUM.map((lesson, idx) => (
                <View key={lesson.id} style={[styles.lessonCard, lesson.isCompleted && styles.lessonCompleted, SHADOWS.small]}>
                  <View style={[styles.lessonIconBox, { backgroundColor: lesson.isCompleted ? COLORS.success : lesson.isLocked ? COLORS.lightGray : COLORS.primaryLight }]}>
                    <Ionicons 
                      name={lesson.isCompleted ? "checkmark" : lesson.isLocked ? "lock-closed" : "play"} 
                      size={18} 
                      color={lesson.isCompleted ? COLORS.white : lesson.isLocked ? COLORS.gray : COLORS.primary} 
                    />
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, lesson.isLocked && { color: COLORS.gray }]} numberOfLines={2}>
                      {lesson.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                      <Ionicons name="time-outline" size={14} color={COLORS.gray} />
                      <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={[styles.bottomBar, SHADOWS.glow]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceOld}>1.200.000đ</Text>
          <Text style={styles.priceNew}>799.000đ</Text>
        </View>
        <TouchableOpacity activeOpacity={0.8} style={styles.enrollBtnWrapper} onPress={() => router.push('/learning')}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.enrollBtn}>
            <Text style={styles.enrollBtnText}>Đăng ký ngay</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  
  bannerContainer: { width: '100%', height: 260, position: 'relative' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerIcons: { position: 'absolute', top: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10, alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  shareBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(251, 135, 63, 0.8)', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

  contentContainer: { padding: 20, backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 },
  
  tagWrapper: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 15 },
  tagText: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  
  title: { fontSize: 24, fontWeight: '900', color: COLORS.dark, lineHeight: 32, marginBottom: 15 },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  statText: { marginLeft: 6, fontSize: 14, color: COLORS.gray },
  statBold: { fontWeight: 'bold', color: COLORS.dark },

  authorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 16, marginBottom: 25, ...SHADOWS.small },
  authorImg: { width: 48, height: 48, borderRadius: 24, marginRight: 15 },
  authorName: { fontSize: 16, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  authorTitle: { fontSize: 14, color: COLORS.gray },

  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.lightGray, padding: 4, borderRadius: 12, marginBottom: 25 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: COLORS.white, ...SHADOWS.small },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.gray },
  tabTextActive: { color: COLORS.dark, fontWeight: '800' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 15 },
  descText: { fontSize: 15, color: COLORS.gray, lineHeight: 24 },
  
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkText: { marginLeft: 10, fontSize: 15, color: COLORS.dark, flex: 1 },

  curriculumContainer: { paddingBottom: 20 },
  lessonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 16, marginBottom: 12 },
  lessonCompleted: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1 },
  lessonIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark, lineHeight: 20 },
  lessonDuration: { marginLeft: 6, fontSize: 13, color: COLORS.gray },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 30, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  priceContainer: { flex: 1 },
  priceOld: { fontSize: 14, color: COLORS.gray, textDecorationLine: 'line-through', marginBottom: 2 },
  priceNew: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  enrollBtnWrapper: { borderRadius: 16, overflow: 'hidden', width: 180 },
  enrollBtn: { height: 54, justifyContent: 'center', alignItems: 'center' },
  enrollBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' }
});
