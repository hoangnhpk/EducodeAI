const fs = require('fs');
const path = require('path');

const content = `import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, TextInput, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../configs/api';
import { AuthContext } from '../context/AuthContext';
import { AnimatedPressable } from '../components/animated-pressable';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  primaryGradient: ['#ff9955', '#fb873f'] as const,
  darkGradient: ['#0f172a', '#1e293b'] as const,
  dark: '#0f172a',
  bg: '#f4f7f6', // Nền sáng sạch hơn chút
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  blurWhite: 'rgba(255, 255, 255, 0.85)',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  medium: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  glow: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = React.useContext(AuthContext);

  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/KhoaHoc/all');
        setCourses(response.data.slice(0, 3)); 
      } catch (error) {
        console.error('Lỗi khi lấy danh sách khóa học trang chủ:', error);
      }
    };
    fetchCourses();
  }, []);

  // --- HOME COMPONENT ---
  const renderHome = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarGlow}>
            <Image 
              source={{ uri: user?.anhDaiDien || \`https://ui-avatars.com/api/?name=\${user?.hoTen || 'Khach'}&background=fb873f&color=fff\` }} 
              style={styles.avatar} 
            />
          </View>
          <View>
            <Text style={styles.greeting}>Chào buổi sáng,</Text>
            <Text style={styles.userName}>{user ? user.hoTen : 'Khách'} 👋</Text>
          </View>
        </View>
        <AnimatedPressable onPress={() => router.push('/notifications')} style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.dark} />
          <View style={styles.badge} />
        </AnimatedPressable>
      </View>

      {/* Tìm kiếm */}
      <View style={[styles.searchContainer, SHADOWS.small]}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput 
          placeholder="Tìm khóa học, lộ trình..." 
          style={styles.searchInput} 
          placeholderTextColor={COLORS.gray} 
          onPressIn={() => router.push('/search')}
        />
        <AnimatedPressable style={styles.filterBtn} onPress={() => Alert.alert('Tính năng Bộ Lọc', 'Đang phát triển...')}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.filterGradient}>
            <Ionicons name="options" size={20} color={COLORS.white} />
          </LinearGradient>
        </AnimatedPressable>
      </View>

      {/* Banner Khóa học */}
      <AnimatedPressable onPress={() => router.push('/courses')}>
        <LinearGradient colors={COLORS.darkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bannerContainer, SHADOWS.medium]}>
          <View style={{ flex: 1, zIndex: 2 }}>
            <View style={styles.bannerTagWrapper}>
              <Text style={styles.bannerTag}>✨ AI POWERED</Text>
            </View>
            <Text style={styles.bannerTitle}>Định hướng{'\\n'}tương lai IT</Text>
            <View style={styles.bannerBtn}>
              <LinearGradient colors={COLORS.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bannerBtnInner}>
                <Text style={styles.bannerBtnText}>Khám phá ngay</Text>
              </LinearGradient>
            </View>
          </View>
          <Ionicons name="rocket" size={120} color="rgba(255,255,255,0.06)" style={styles.bannerIcon} />
          {/* Glass Effect Bubble */}
          <View style={styles.glassBubble} />
        </LinearGradient>
      </AnimatedPressable>

      {/* Đề xuất cho bạn */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Đề xuất cho bạn</Text>
        <TouchableOpacity onPress={() => router.push('/courses')}><Text style={styles.seeAll}>Tất cả</Text></TouchableOpacity>
      </View>
      {courses.map((c) => (
        <AnimatedPressable key={c.maKhoaHoc} style={[styles.courseCard, SHADOWS.small]} onPress={() => router.push({ pathname: '/course-detail', params: { id: c.maKhoaHoc } })}>
          <Image source={{ uri: c.hinhAnh || 'https://via.placeholder.com/500x300' }} style={styles.courseImg} />
          <View style={styles.courseInfo}>
            <View>
              <Text style={styles.courseTitle} numberOfLines={2}>{c.tenKhoaHoc}</Text>
              <Text style={styles.courseAuthor}>GV: {c.giangVien?.hoTen || 'EducodeAI'}</Text>
            </View>
            <View style={styles.courseFooter}>
              <Text style={styles.coursePrice}>{(c.giaTien === 0 || !c.giaTien) ? 'Miễn phí' : c.giaTien.toLocaleString('vi-VN') + 'đ'}</Text>
              <View style={styles.courseActionBtn}>
                <Ionicons name="play" size={14} color={COLORS.primary} />
              </View>
            </View>
          </View>
        </AnimatedPressable>
      ))}
    </ScrollView>
  );

  // --- AI MODULES ---
  const renderAI = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={styles.header}>
        <Text style={[styles.userName, { fontSize: 28 }]}>Không gian AI <Text style={{ fontSize: 24 }}>✨</Text></Text>
      </View>
      <Text style={{ color: COLORS.gray, marginBottom: 25, fontSize: 16, lineHeight: 24 }}>
        Khai phóng tiềm năng với bộ công cụ trợ lý AI thông minh tích hợp sâu vào quy trình học tập.
      </Text>

      {/* Các Card AI */}
      {[ 
        { title: 'Sinh Đồ Án Thực Chiến', desc: 'Thiết kế CSDL, API & Checklist dựa trên tech stack.', icon: 'cube', gradient: ['#e0e7ff', '#c7d2fe'], color: '#4f46e5', route: '/sinh-do-an' },
        { title: 'Phòng Phỏng Vấn Ảo', desc: 'Voice Chat 1-1 với Tech Lead AI. Phân tích & Chấm điểm.', icon: 'mic', gradient: ['#dcfce7', '#bbf7d0'], color: COLORS.success, route: '/phong-van' },
        { title: 'Thử Thách & Danh Hiệu', desc: 'Làm nhiệm vụ, đua top EXP.', icon: 'star', gradient: ['#fef3c7', '#fde68a'], color: '#f59e0b', route: '/thu-thach' },
        { title: 'Lộ Trình Cá Nhân Hóa', desc: 'Vẽ đường học tập ngắn nhất để có việc làm mơ ước.', icon: 'git-network', gradient: ['#ffedd5', '#fed7aa'], color: COLORS.primary, route: '/lo-trinh' }
      ].map((item, idx) => (
        <AnimatedPressable key={idx} style={[styles.aiModuleCard, SHADOWS.medium]} onPress={() => router.push(item.route as any)}>
          <LinearGradient colors={item.gradient as any} style={styles.aiIconWrapper}>
            <Ionicons name={item.icon as any} size={28} color={item.color} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiModuleTitle}>{item.title}</Text>
            <Text style={styles.aiModuleDesc}>{item.desc}</Text>
          </View>
          <View style={styles.aiArrow}>
            <Ionicons name="arrow-forward" size={18} color={COLORS.gray} />
          </View>
        </AnimatedPressable>
      ))}
    </ScrollView>
  );

  // --- MY COURSES ---
  const renderMyCourses = () => (
    <View style={styles.container}>
      <View style={styles.header}><Text style={[styles.userName, { fontSize: 28 }]}>Đang học 📚</Text></View>
      <AnimatedPressable style={[styles.myCourseCard, SHADOWS.medium]} onPress={() => router.push('/learning')}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=500&q=80' }} style={styles.myCourseImg} />
        <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
          <Text style={styles.myCourseTitle} numberOfLines={2}>C# ASP.NET Core API</Text>
          <Text style={styles.myCourseDesc}>Bài 2: Cài đặt môi trường</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '25%' }]} />
            </View>
            <Text style={styles.progressText}>25%</Text>
          </View>
        </View>
      </AnimatedPressable>
      
      <AnimatedPressable style={styles.continueBtnWrapper} onPress={() => router.push('/learning')}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.continueBtn}>
          <Text style={styles.continueBtnText}>Tiếp tục học</Text>
          <Ionicons name="play-circle" size={24} color={COLORS.white} style={{ marginLeft: 8 }} />
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );

  // --- PROFILE ---
  const handleLogout = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } }
    ]);
  };

  const renderProfile = () => (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatarWrapper, SHADOWS.glow]}>
          <Image 
            source={{ uri: user?.anhDaiDien || \`https://ui-avatars.com/api/?name=\${user?.hoTen || 'Khach'}&background=fb873f&color=fff\` }} 
            style={styles.profileAvatarLarge} 
          />
        </View>
        <Text style={styles.profileName}>{user ? user.hoTen : 'Tên người dùng'}</Text>
        <Text style={styles.profileEmail}>{user ? user.email : 'email@educode.vn'}</Text>

        <TouchableOpacity style={styles.editProfileBtn}>
          <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.profileMenu, SHADOWS.small]}>
        {[
          { icon: 'time', color: '#3b82f6', bg: '#eff6ff', text: 'Lịch sử học tập', action: () => {} },
          { icon: 'card', color: '#10b981', bg: '#ecfdf5', text: 'Thanh toán', action: () => {} },
          { icon: 'settings', color: '#64748b', bg: '#f1f5f9', text: 'Cài đặt', action: () => {} },
          { icon: 'help-circle', color: '#f59e0b', bg: '#fffbeb', text: 'Trợ giúp', action: () => {} },
          { icon: 'log-out', color: '#ef4444', bg: '#fef2f2', text: 'Đăng xuất', action: handleLogout }
        ].map((item, index) => (
          <AnimatedPressable key={index} style={[styles.profileMenuItem, index === 4 && { borderBottomWidth: 0 }]} onPress={item.action}>
            <View style={styles.profileMenuLeft}>
              <View style={[styles.profileMenuIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.profileMenuText, index === 4 && { color: COLORS.danger }]}>{item.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
          </AnimatedPressable>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        {activeTab === 'Home' && renderHome()}
        {activeTab === 'AI' && renderAI()}
        {activeTab === 'MyCourses' && renderMyCourses()}
        {activeTab === 'Profile' && renderProfile()}
        {activeTab === 'Menu' && renderProfile()} 

        {/* BOTTOM NAV BAR (GLASSMORPHISM) */}
        <View style={styles.floatingNavWrapper}>
          <BlurView intensity={80} tint="light" style={[styles.floatingNav, SHADOWS.medium]}>
            <AnimatedPressable style={styles.navItem} onPress={() => setActiveTab('Home')}>
              <Ionicons name={activeTab === 'Home' ? "home" : "home-outline"} size={22} color={activeTab === 'Home' ? COLORS.primary : COLORS.gray} />
              <Text style={[styles.navText, activeTab === 'Home' && styles.navTextActive]}>Trang chủ</Text>
            </AnimatedPressable>

            <AnimatedPressable style={styles.navItem} onPress={() => setActiveTab('MyCourses')}>
              <Ionicons name={activeTab === 'MyCourses' ? "book" : "book-outline"} size={22} color={activeTab === 'MyCourses' ? COLORS.primary : COLORS.gray} />
              <Text style={[styles.navText, activeTab === 'MyCourses' && styles.navTextActive]}>Học tập</Text>
            </AnimatedPressable>

            <View style={styles.navItemSpacer} />

            <AnimatedPressable style={styles.navItem} onPress={() => setActiveTab('Profile')}>
              <Ionicons name={activeTab === 'Profile' ? "person" : "person-outline"} size={22} color={activeTab === 'Profile' ? COLORS.primary : COLORS.gray} />
              <Text style={[styles.navText, activeTab === 'Profile' && styles.navTextActive]}>Hồ sơ</Text>
            </AnimatedPressable>

            <AnimatedPressable style={styles.navItem} onPress={() => setActiveTab('Menu')}>
              <Ionicons name={activeTab === 'Menu' ? "menu" : "menu-outline"} size={26} color={activeTab === 'Menu' ? COLORS.primary : COLORS.gray} />
              <Text style={[styles.navText, activeTab === 'Menu' && styles.navTextActive]}>Menu</Text>
            </AnimatedPressable>
          </BlurView>

          {/* Nút AI Float Nổi bật */}
          <AnimatedPressable style={[styles.aiFloatingBtn, SHADOWS.glow]} onPress={() => setActiveTab('AI')}>
            <LinearGradient colors={COLORS.primaryGradient} style={styles.aiBtnGradient}>
              <Ionicons name="sparkles" size={26} color={COLORS.white} />
            </LinearGradient>
          </AnimatedPressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 20 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 15 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarGlow: { padding: 3, backgroundColor: COLORS.white, borderRadius: 28, ...SHADOWS.small },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  greeting: { fontSize: 13, color: COLORS.gray, marginBottom: 2, marginLeft: 12 },
  userName: { fontSize: 20, fontWeight: '800', color: COLORS.dark, letterSpacing: -0.5, marginLeft: 12 },
  bellBtn: { width: 46, height: 46, backgroundColor: COLORS.white, borderRadius: 23, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  badge: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, backgroundColor: COLORS.danger, borderRadius: 5, borderWidth: 2, borderColor: COLORS.white },

  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, backgroundColor: COLORS.white, borderRadius: 20, paddingLeft: 18, paddingRight: 6, height: 60 },
  searchInput: { flex: 1, height: '100%', paddingLeft: 12, paddingRight: 15, color: COLORS.dark, fontSize: 16 },
  searchIcon: { marginRight: 5 },
  filterBtn: { width: 48, height: 48, borderRadius: 16, overflow: 'hidden' },
  filterGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Banner
  bannerContainer: { borderRadius: 28, padding: 25, flexDirection: 'row', overflow: 'hidden', marginBottom: 35, position: 'relative' },
  bannerTagWrapper: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 15 },
  bannerTag: { color: COLORS.white, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  bannerTitle: { color: COLORS.white, fontSize: 28, fontWeight: '900', lineHeight: 36, marginBottom: 20, letterSpacing: -0.5 },
  bannerBtn: { alignSelf: 'flex-start', borderRadius: 14, overflow: 'hidden' },
  bannerBtnInner: { paddingHorizontal: 22, paddingVertical: 12 },
  bannerBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  bannerIcon: { position: 'absolute', right: -15, bottom: -15, zIndex: 1, transform: [{ rotate: '-10deg' }] },
  glassBubble: { position: 'absolute', right: 50, top: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)', transform: [{ scale: 1.5 }] },

  // Danh mục & Khóa học
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  seeAll: { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
  courseCard: { backgroundColor: COLORS.white, borderRadius: 24, marginBottom: 20, flexDirection: 'row', padding: 12 },
  courseImg: { width: 110, height: 110, borderRadius: 16 },
  courseInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 4 },
  courseTitle: { fontSize: 17, fontWeight: '800', color: COLORS.dark, letterSpacing: -0.5, lineHeight: 24 },
  courseAuthor: { fontSize: 13, color: COLORS.gray, marginTop: 4, fontWeight: '600' },
  courseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  coursePrice: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
  courseActionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },

  // AI Center
  aiModuleCard: { backgroundColor: COLORS.white, padding: 20, borderRadius: 24, marginBottom: 18, flexDirection: 'row', alignItems: 'center' },
  aiIconWrapper: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  aiModuleTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 6, letterSpacing: -0.5 },
  aiModuleDesc: { fontSize: 14, color: COLORS.gray, lineHeight: 22, paddingRight: 5 },
  aiArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

  // Khóa học của tôi
  myCourseCard: { flexDirection: 'row', backgroundColor: COLORS.white, padding: 16, borderRadius: 24, marginBottom: 25 },
  myCourseImg: { width: 110, height: 110, borderRadius: 18 },
  myCourseTitle: { fontSize: 17, fontWeight: '800', color: COLORS.dark, marginBottom: 6 },
  myCourseDesc: { fontSize: 14, color: COLORS.gray, marginBottom: 12 },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBarBg: { flex: 1, height: 8, backgroundColor: COLORS.lightGray, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary },
  progressText: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginLeft: 12 },
  continueBtnWrapper: { borderRadius: 20, overflow: 'hidden', ...SHADOWS.glow },
  continueBtn: { flexDirection: 'row', height: 60, justifyContent: 'center', alignItems: 'center' },
  continueBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '800' },

  // Hồ sơ
  profileHeader: { alignItems: 'center', marginTop: 15, marginBottom: 35 },
  avatarWrapper: { borderRadius: 60, backgroundColor: COLORS.white, padding: 6, marginBottom: 15 },
  profileAvatarLarge: { width: 108, height: 108, borderRadius: 54 },
  profileName: { fontSize: 26, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  profileEmail: { fontSize: 16, color: COLORS.gray, marginTop: 4 },
  editProfileBtn: { marginTop: 18, backgroundColor: COLORS.primaryLight, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 },
  editProfileText: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
  profileMenu: { backgroundColor: COLORS.white, borderRadius: 28, padding: 20 },
  profileMenuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.bg },
  profileMenuLeft: { flexDirection: 'row', alignItems: 'center' },
  profileMenuIcon: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileMenuText: { fontSize: 16, color: COLORS.dark, fontWeight: '700' },

  // Floating Bottom Nav
  floatingNavWrapper: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center', zIndex: 100 },
  floatingNav: { flexDirection: 'row', width: width - 40, height: 74, borderRadius: 37, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, overflow: 'hidden', backgroundColor: COLORS.blurWhite },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 11, color: COLORS.gray, marginTop: 4, fontWeight: '800' },
  navTextActive: { color: COLORS.primary, fontWeight: '900' },
  navItemSpacer: { width: 70 },
  aiFloatingBtn: { position: 'absolute', top: -30, width: 74, height: 74, borderRadius: 37, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: 6, zIndex: 101 },
  aiBtnGradient: { width: '100%', height: '100%', borderRadius: 32, justifyContent: 'center', alignItems: 'center' }
});
`;

fs.writeFileSync(path.join(__dirname, 'Mobile', 'src', 'app', 'index.tsx'), content);
console.log('Done rewriting index.tsx for V2 UI');
