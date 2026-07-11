const fs = require('fs');
const path = require('path');

const content = `import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, Image, StatusBar, Dimensions, Alert, ActivityIndicator, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../configs/api';
import { AnimatedPressable } from '../components/animated-pressable';

const { width, height } = Dimensions.get('window');

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
  blurWhite: 'rgba(255, 255, 255, 0.85)',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  medium: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 },
  glow: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }
};

export default function CourseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum'>('curriculum');
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetail();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      const response = await api.get(\`/hocvien/chitietkhoahoc/\${id}\`);
      setCourse(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết khóa học:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCourse = async () => {
    if (course.giaTien > 0) {
      Alert.alert(
        'Thanh toán qua ZaloPay',
        \`Số tiền: \${(course.giaTien - (course.giamGia || 0)).toLocaleString('vi-VN')}đ\\nBạn có chắc chắn muốn thanh toán?\`,
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Thanh toán', 
            onPress: async () => {
              setRegistering(true);
              try {
                await new Promise(r => setTimeout(r, 1000)); 
                await api.post('/hocvien/chitietkhoahoc/dang-ky', { maKhoaHoc: Number(id) });
                Alert.alert('Thành công', 'Thanh toán ZaloPay thành công. Bạn đã đăng ký khóa học này!');
                fetchCourseDetail();
              } catch (error: any) {
                Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đăng ký khóa học này.');
              } finally {
                setRegistering(false);
              }
            }
          }
        ]
      );
      return;
    }

    setRegistering(true);
    try {
      await api.post('/hocvien/chitietkhoahoc/dang-ky', { maKhoaHoc: Number(id) });
      Alert.alert('Thành công', 'Bạn đã đăng ký khóa học này!');
      fetchCourseDetail();
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đăng ký khóa học này.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Không tìm thấy khoá học</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.primary }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, backgroundColor: COLORS.bg }}>
        {/* Banner Cinematic Image */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: course.hinhAnh || 'https://via.placeholder.com/800x600' }} 
            style={styles.bannerImage} 
          />
          <LinearGradient 
            colors={['rgba(0,0,0,0.6)', 'transparent', COLORS.bg]} 
            locations={[0, 0.4, 1]}
            style={styles.bannerOverlay} 
          />
          <View style={styles.headerIcons}>
            <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </AnimatedPressable>
            <AnimatedPressable style={styles.shareBtn}>
              <Ionicons name="share-outline" size={24} color={COLORS.white} />
            </AnimatedPressable>
          </View>
        </View>

        {/* Course Info */}
        <View style={styles.contentContainer}>
          <View style={styles.tagWrapper}>
            <Text style={styles.tagText}>{course.tenTheLoai || 'Lập trình'}</Text>
          </View>
          
          <Text style={styles.title}>{course.tenKhoaHoc}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color={COLORS.warning} />
              <Text style={styles.statText}><Text style={styles.statBold}>4.8</Text> (2.1k)</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={COLORS.gray} />
              <Text style={styles.statText}>24h 30m</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={18} color={COLORS.gray} />
              <Text style={styles.statText}>{course.soHocVien || 150}+</Text>
            </View>
          </View>

          {/* Instructor Card */}
          <View style={[styles.authorRow, SHADOWS.small]}>
            <Image source={{ uri: course.giangVien?.anhDaiDien || 'https://ui-avatars.com/api/?name=GV&background=10b981&color=fff' }} style={styles.authorImg} />
            <View>
              <Text style={styles.authorName}>{course.giangVien?.hoTen || 'Đội ngũ EducodeAI'}</Text>
              <Text style={styles.authorTitle}>Giảng viên Cao cấp</Text>
            </View>
          </View>

          {/* Custom Tabs */}
          <View style={styles.tabContainer}>
            <AnimatedPressable style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]} onPress={() => setActiveTab('overview')}>
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Tổng quan</Text>
            </AnimatedPressable>
            <AnimatedPressable style={[styles.tabBtn, activeTab === 'curriculum' && styles.tabBtnActive]} onPress={() => setActiveTab('curriculum')}>
              <Text style={[styles.tabText, activeTab === 'curriculum' && styles.tabTextActive]}>Chương trình</Text>
            </AnimatedPressable>
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' ? (
            <View>
              <Text style={styles.sectionTitle}>Về khóa học này</Text>
              <Text style={styles.descText}>{course.moTa || 'Khóa học trang bị cho bạn các kiến thức từ cơ bản đến nâng cao với phương pháp thực chiến.'}</Text>
              
              <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Bạn sẽ học được gì</Text>
              {['Nắm vững kiến thức nền tảng vững chắc', 'Xây dựng dự án thực tế đưa vào CV', 'Kỹ năng giải quyết vấn đề và Debug'].map((item, idx) => (
                <View key={idx} style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.curriculumContainer}>
              {course.chuongHocs?.map((chuong: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 20 }}>
                  <Text style={styles.sectionTitle}>{chuong.tenChuong}</Text>
                  {chuong.baiHocs?.map((bai: any, bIdx: number) => (
                    <AnimatedPressable key={bIdx} style={[styles.lessonCard, SHADOWS.small, bai.daHoc && styles.lessonCompleted]}>
                      <View style={[styles.lessonIconBox, { backgroundColor: bai.daHoc ? '#dcfce7' : COLORS.primaryLight }]}>
                        <Ionicons name={bai.daHoc ? 'checkmark' : 'play'} size={20} color={bai.daHoc ? COLORS.success : COLORS.primary} />
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={styles.lessonTitle}>{bai.tenBaiHoc}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <Ionicons name="time-outline" size={14} color={COLORS.gray} />
                          <Text style={styles.lessonDuration}>15 phút</Text>
                        </View>
                      </View>
                      {!bai.daHoc && <Ionicons name="lock-closed-outline" size={20} color={COLORS.lightGray} />}
                    </AnimatedPressable>
                  ))}
                </View>
              ))}
              {(!course.chuongHocs || course.chuongHocs.length === 0) && (
                <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 20 }}>Nội dung đang được cập nhật.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Bar (Glassmorphism) */}
      <BlurView intensity={90} tint="light" style={styles.bottomBarWrapper}>
        <View style={styles.bottomBarInner}>
          <View style={styles.priceContainer}>
            {course.giamGia > 0 && <Text style={styles.priceOld}>{(course.giaTien).toLocaleString('vi-VN')}đ</Text>}
            <Text style={styles.priceNew}>{(course.giaTien - (course.giamGia || 0)).toLocaleString('vi-VN')}đ</Text>
          </View>
          <AnimatedPressable scaleTo={0.95} style={styles.enrollBtnWrapper} onPress={handleRegisterCourse} disabled={registering}>
            <LinearGradient colors={COLORS.primaryGradient} style={styles.enrollBtn}>
              {registering ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.enrollBtnText}>Đăng ký ngay</Text>}
            </LinearGradient>
          </AnimatedPressable>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  
  // Cinematic Banner
  bannerContainer: { width: '100%', height: 340, position: 'relative' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerIcons: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10, alignItems: 'center' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  shareBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  contentContainer: { padding: 24, backgroundColor: COLORS.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -40 },
  
  tagWrapper: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 15 },
  tagText: { color: COLORS.primary, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  
  title: { fontSize: 26, fontWeight: '900', color: COLORS.dark, lineHeight: 34, marginBottom: 15, letterSpacing: -0.5 },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 22 },
  statText: { marginLeft: 6, fontSize: 14, color: COLORS.gray },
  statBold: { fontWeight: 'bold', color: COLORS.dark },

  authorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 18, borderRadius: 20, marginBottom: 30 },
  authorImg: { width: 56, height: 56, borderRadius: 28, marginRight: 16 },
  authorName: { fontSize: 17, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  authorTitle: { fontSize: 14, color: COLORS.gray },

  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.lightGray, padding: 5, borderRadius: 16, marginBottom: 25 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabBtnActive: { backgroundColor: COLORS.white, ...SHADOWS.small },
  tabText: { fontSize: 15, fontWeight: '700', color: COLORS.gray },
  tabTextActive: { color: COLORS.dark, fontWeight: '900' },

  sectionTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, marginBottom: 16, letterSpacing: -0.5 },
  descText: { fontSize: 16, color: COLORS.gray, lineHeight: 26 },
  
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  checkText: { marginLeft: 12, fontSize: 16, color: COLORS.dark, flex: 1 },

  curriculumContainer: { paddingBottom: 20 },
  lessonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 20, marginBottom: 14 },
  lessonCompleted: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1 },
  lessonIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark, lineHeight: 22 },
  lessonDuration: { marginLeft: 6, fontSize: 14, color: COLORS.gray },

  // Glass Footer
  bottomBarWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  bottomBarInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 25, backgroundColor: 'rgba(255,255,255,0.7)' },
  priceContainer: { flex: 1 },
  priceOld: { fontSize: 15, color: COLORS.gray, textDecorationLine: 'line-through', marginBottom: 2 },
  priceNew: { fontSize: 26, fontWeight: '900', color: COLORS.primary },
  enrollBtnWrapper: { borderRadius: 20, overflow: 'hidden', width: 180, ...SHADOWS.glow },
  enrollBtn: { height: 60, justifyContent: 'center', alignItems: 'center' },
  enrollBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '900' }
});
`;

fs.writeFileSync(path.join(__dirname, 'Mobile', 'src', 'app', 'course-detail.tsx'), content);
console.log('Done rewriting course-detail.tsx for V2 UI');
