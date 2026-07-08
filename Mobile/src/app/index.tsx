import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Image, TextInput, StatusBar, Dimensions, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- BẢNG MÀU CHUẨN THƯƠNG HIỆU (ĐỒNG BỘ WEB) ---
const COLORS = {
  primary: '#fb873f',     // Cam chủ đạo
  primaryLight: '#fff3ed', // Cam nhạt
  primaryGradient: ['#ff9955', '#fb873f'] as const, // Cam rực rỡ
  dark: '#0f172a',        // Xanh đen (Slate 900)
  darkLight: '#1e293b',   // Xanh đen nhạt
  darkGradient: ['#1e293b', '#0f172a'] as const,
  bg: '#f8fafc',          // Nền xám nhạt (Slate 50)
  white: '#ffffff',
  gray: '#64748b',        // Xám text
  lightGray: '#e2e8f0',   // Xám viền
  success: '#10b981',     // Xanh lá (Hoàn thành)
  danger: '#ef4444'       // Đỏ (Cảnh báo/Đăng xuất)
};

// --- BÓNG ĐỔ (SHADOWS) CAO CẤP ---
const SHADOWS = {
  small: {
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // --- COMPONENT: TRANG CHỦ ---
  const renderHome = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: 'https://ui-avatars.com/api/?name=Lưu+Lai&background=fb873f&color=fff' }} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Chào buổi sáng,</Text>
            <Text style={styles.userName}>Lưu Lai 👋</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.dark} />
          <View style={styles.badge} />
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.filterBtn} onPress={() => Alert.alert('Tính năng Bộ Lọc', 'Đang phát triển...')}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.filterGradient}>
            <Ionicons name="options" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <LinearGradient colors={COLORS.darkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bannerContainer, SHADOWS.medium]}>
        <View style={{ flex: 1, zIndex: 2 }}>
          <View style={styles.bannerTagWrapper}>
            <Text style={styles.bannerTag}>✨ AI POWERED</Text>
          </View>
          <Text style={styles.bannerTitle}>Định hướng{'\n'}tương lai IT</Text>
          <TouchableOpacity onPress={() => router.push('/courses')}>
            <LinearGradient colors={COLORS.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Khám phá ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Ionicons name="rocket" size={110} color="rgba(255,255,255,0.08)" style={styles.bannerIcon} />
      </LinearGradient>

      {/* Danh mục */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chủ đề nổi bật</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {['C# .NET', 'ReactJS', 'Python', 'AWS Cloud'].map((cat, index) => {
          const isActive = index === 0;
          return (
            <TouchableOpacity key={index} onPress={() => router.push('/courses')}>
              {isActive ? (
                <LinearGradient colors={COLORS.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.catCard, { borderWidth: 0 }, SHADOWS.glow]}>
                  <Text style={[styles.catText, { color: COLORS.white }]}>{cat}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.catCard}>
                  <Text style={styles.catText}>{cat}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ width: 20 }} />
      </ScrollView>

      {/* Khóa học đề xuất */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Đề xuất cho bạn</Text>
        <TouchableOpacity onPress={() => router.push('/courses')}><Text style={styles.seeAll}>Tất cả</Text></TouchableOpacity>
      </View>
      {[
        { id: 1, title: 'Lập trình C# ASP.NET Core API', author: 'Quốc Hùng', img: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=500&q=80' },
        { id: 2, title: 'Thực chiến ReactJS từ Zero', author: 'Huy Hoàng', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80' }
      ].map((c) => (
        <TouchableOpacity key={c.id} style={[styles.courseCard, SHADOWS.small]} onPress={() => router.push('/course-detail')}>
          <Image source={{ uri: c.img }} style={styles.courseImg} />
          <View style={styles.courseInfo}>
            <View>
              <Text style={styles.courseTitle} numberOfLines={2}>{c.title}</Text>
              <Text style={styles.courseAuthor}>GV: {c.author}</Text>
            </View>
            <View style={styles.courseFooter}>
              <Text style={styles.coursePrice}>Miễn phí</Text>
              <View style={styles.courseActionBtn}>
                <Ionicons name="play" size={12} color={COLORS.primary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // --- COMPONENT: TRUNG TÂM AI (ĐẤT DIỄN MODULE CỦA SẾP) ---
  const renderAI = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.header}>
        <Text style={[styles.userName, { fontSize: 26 }]}>Không gian AI <Text style={{ fontSize: 22 }}>✨</Text></Text>
      </View>
      <Text style={{ color: COLORS.gray, marginBottom: 25, fontSize: 15, lineHeight: 22 }}>
        Trợ lý thông minh hỗ trợ học tập, sinh đồ án và rèn luyện kỹ năng phỏng vấn.
      </Text>

      {/* Sinh Đồ Án */}
      <TouchableOpacity style={[styles.aiModuleCard, SHADOWS.medium]} onPress={() => router.push('/sinh-do-an')}>
        <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={styles.aiIconWrapper}>
          <Ionicons name="cube" size={28} color="#4f46e5" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.aiModuleTitle}>Sinh Đồ Án Thực Chiến</Text>
          <Text style={styles.aiModuleDesc}>Thiết kế CSDL, API & Checklist dựa trên tech stack.</Text>
        </View>
        <View style={styles.aiArrow}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </View>
      </TouchableOpacity>

      {/* Phỏng Vấn Giả Lập */}
      <TouchableOpacity style={[styles.aiModuleCard, SHADOWS.medium]} onPress={() => router.push('/phong-van')}>
        <LinearGradient colors={['#dcfce7', '#bbf7d0']} style={styles.aiIconWrapper}>
          <Ionicons name="mic" size={28} color={COLORS.success} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.aiModuleTitle}>Phòng Phỏng Vấn Ảo</Text>
          <Text style={styles.aiModuleDesc}>Voice Chat 1-1 với Tech Lead AI. Phân tích chấm điểm.</Text>
        </View>
        <View style={styles.aiArrow}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </View>
      </TouchableOpacity>

      {/* Lộ Trình */}
      <TouchableOpacity style={[styles.aiModuleCard, SHADOWS.medium]} onPress={() => router.push('/lo-trinh')}>
        <LinearGradient colors={['#ffedd5', '#fed7aa']} style={styles.aiIconWrapper}>
          <Ionicons name="git-network" size={28} color={COLORS.primary} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.aiModuleTitle}>Lộ Trình Cá Nhân Hóa</Text>
          <Text style={styles.aiModuleDesc}>Vẽ đường học tập ngắn nhất để có việc làm mơ ước.</Text>
        </View>
        <View style={styles.aiArrow}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  // --- COMPONENT: KHÓA HỌC CỦA TÔI ---
  const renderMyCourses = () => (
    <View style={styles.container}>
      <View style={styles.header}><Text style={[styles.userName, { fontSize: 26 }]}>Đang học 📚</Text></View>
      <View style={[styles.myCourseCard, SHADOWS.medium]}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=500&q=80' }} style={styles.myCourseImg} />
        <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
          <Text style={styles.myCourseTitle} numberOfLines={2}>C# ASP.NET Core API</Text>
          <Text style={styles.myCourseDesc}>Bài 2: Cài đặt môi trường</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '25%' }]} />
            </View>
            <Text style={styles.progressText}>25%</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity activeOpacity={0.8} style={styles.continueBtnWrapper} onPress={() => router.push('/learning')}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.continueBtn}>
          <Text style={styles.continueBtnText}>Tiếp tục học</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 5 }} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // --- COMPONENT: HỒ SƠ ---
  const renderProfile = () => (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatarWrapper, SHADOWS.glow]}>
          <Image source={{ uri: 'https://ui-avatars.com/api/?name=Lưu+Lai&background=fb873f&color=fff' }} style={styles.profileAvatarLarge} />
        </View>
        <Text style={styles.profileName}>Đinh Lưu Lai</Text>
        <Text style={styles.profileEmail}>lai.dinh@educode.vn</Text>

        <TouchableOpacity style={styles.editProfileBtn} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.profileMenu, SHADOWS.small]}>
        {[
          { icon: 'ribbon-outline', text: 'Chứng chỉ của tôi', color: COLORS.primary, route: '/certificates' },
          { icon: 'shield-checkmark-outline', text: 'Bảo mật tài khoản', color: COLORS.success, route: '/settings' },
          { icon: 'help-buoy-outline', text: 'Trợ giúp & Hỗ trợ', color: COLORS.gray, route: '/about' }
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.profileMenuItem} onPress={() => item.route && router.push(item.route as any)}>
            <View style={styles.profileMenuLeft}>
              <View style={[styles.profileMenuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.profileMenuText}>{item.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.profileMenuItem, { borderBottomWidth: 0, marginTop: 10 }]} onPress={() => router.push('/login')}>
          <View style={styles.profileMenuLeft}>
            <View style={[styles.profileMenuIcon, { backgroundColor: COLORS.danger + '15' }]}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            </View>
            <Text style={[styles.profileMenuText, { color: COLORS.danger, fontWeight: 'bold' }]}>Đăng xuất</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // --- COMPONENT: MENU MỞ RỘNG ---
  const renderMenu = () => (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.header}>
        <Text style={[styles.userName, { fontSize: 26 }]}>Mở rộng ⚙️</Text>
      </View>

      <View style={[styles.profileMenu, SHADOWS.small, { marginBottom: 20 }]}>
        <Text style={[styles.sectionTitle, { marginBottom: 15, fontSize: 16 }]}>Hệ thống</Text>
        {[
          { icon: 'settings-outline', text: 'Cài đặt chung', color: COLORS.dark, route: '/settings' },
          { icon: 'notifications-outline', text: 'Quản lý thông báo', color: COLORS.dark, route: '/settings' },
          { icon: 'color-palette-outline', text: 'Giao diện & Trưng bày', color: COLORS.dark, route: '/settings' }
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.profileMenuItem} onPress={() => item.route && router.push(item.route as any)}>
            <View style={styles.profileMenuLeft}>
              <View style={[styles.profileMenuIcon, { backgroundColor: COLORS.bg }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.profileMenuText}>{item.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.profileMenu, SHADOWS.small]}>
        <Text style={[styles.sectionTitle, { marginBottom: 15, fontSize: 16 }]}>Khác</Text>
        <TouchableOpacity style={styles.profileMenuItem} onPress={() => router.push('/about')}>
          <View style={styles.profileMenuLeft}>
            <View style={[styles.profileMenuIcon, { backgroundColor: COLORS.bg }]}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.gray} />
            </View>
            <Text style={styles.profileMenuText}>Giới thiệu EducodeAI</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.profileMenuItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/about')}>
          <View style={styles.profileMenuLeft}>
            <View style={[styles.profileMenuIcon, { backgroundColor: COLORS.bg }]}>
              <Ionicons name="star-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.profileMenuText}>Đánh giá ứng dụng</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Vùng hiển thị nội dung theo Tab */}
      {activeTab === 'Home' && renderHome()}
      {activeTab === 'AI' && renderAI()}
      {activeTab === 'MyCourses' && renderMyCourses()}
      {activeTab === 'Profile' && renderProfile()}
      {activeTab === 'Menu' && renderMenu()}

      {/* Floating Bottom Navigation */}
      <View style={[styles.floatingNavWrapper, { bottom: Platform.OS === 'ios' ? Math.max(25, insets.bottom) : Math.max(15, insets.bottom + 15) }]}>
        <View style={[styles.floatingNav, SHADOWS.medium]}>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Home')}>
            <Ionicons name={activeTab === 'Home' ? "home" : "home-outline"} size={22} color={activeTab === 'Home' ? COLORS.primary : COLORS.gray} />
            <Text style={[styles.navText, activeTab === 'Home' && styles.navTextActive]}>Trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('MyCourses')}>
            <Ionicons name={activeTab === 'MyCourses' ? "book" : "book-outline"} size={22} color={activeTab === 'MyCourses' ? COLORS.primary : COLORS.gray} />
            <Text style={[styles.navText, activeTab === 'MyCourses' && styles.navTextActive]}>Học tập</Text>
          </TouchableOpacity>

          {/* Nút AI Float Cao Cấp */}
          <View style={styles.navItemSpacer} />

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Profile')}>
            <Ionicons name={activeTab === 'Profile' ? "person" : "person-outline"} size={22} color={activeTab === 'Profile' ? COLORS.primary : COLORS.gray} />
            <Text style={[styles.navText, activeTab === 'Profile' && styles.navTextActive]}>Hồ sơ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Menu')}>
            <Ionicons name={activeTab === 'Menu' ? "menu" : "menu-outline"} size={26} color={activeTab === 'Menu' ? COLORS.primary : COLORS.gray} />
            <Text style={[styles.navText, activeTab === 'Menu' && styles.navTextActive]}>Menu</Text>
          </TouchableOpacity>
        </View>

        {/* Nút AI Float Tuyệt đẹp nằm chèn lên trên */}
        <TouchableOpacity activeOpacity={0.8} style={[styles.aiFloatingBtn, SHADOWS.glow]} onPress={() => setActiveTab('AI')}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.aiBtnGradient}>
            <Ionicons name="sparkles" size={26} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- STYLESHEET CHUẨN ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 15 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 15 },
  greeting: { fontSize: 13, color: COLORS.gray, marginBottom: 2 },
  userName: { fontSize: 19, fontWeight: '800', color: COLORS.dark, letterSpacing: -0.5 },
  bellBtn: { width: 46, height: 46, backgroundColor: COLORS.white, borderRadius: 23, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.lightGray },
  badge: { position: 'absolute', top: 12, right: 12, width: 9, height: 9, backgroundColor: COLORS.danger, borderRadius: 5, borderWidth: 1.5, borderColor: COLORS.white },

  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, backgroundColor: COLORS.white, borderRadius: 16, paddingLeft: 15, paddingRight: 5, height: 56 },
  searchInput: { flex: 1, height: '100%', paddingLeft: 10, paddingRight: 15, color: COLORS.dark, fontSize: 15 },
  searchIcon: { marginRight: 5 },
  filterBtn: { width: 46, height: 46, borderRadius: 12, overflow: 'hidden' },
  filterGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Banner
  bannerContainer: { borderRadius: 24, padding: 25, flexDirection: 'row', overflow: 'hidden', marginBottom: 35, position: 'relative' },
  bannerTagWrapper: { backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 15 },
  bannerTag: { color: COLORS.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  bannerTitle: { color: COLORS.white, fontSize: 24, fontWeight: '900', lineHeight: 32, marginBottom: 20, letterSpacing: -0.5 },
  bannerBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  bannerBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  bannerIcon: { position: 'absolute', right: -20, bottom: -20, zIndex: 1, transform: [{ rotate: '-15deg' }] },

  // Danh mục & Khóa học
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: COLORS.dark, letterSpacing: -0.5 },
  seeAll: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  catScroll: { marginBottom: 30, paddingLeft: 20, marginLeft: -20 },
  catCard: { backgroundColor: COLORS.white, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14, marginRight: 12, borderWidth: 1, borderColor: COLORS.lightGray },
  catText: { color: COLORS.gray, fontWeight: '700', fontSize: 14 },
  courseCard: { backgroundColor: COLORS.white, borderRadius: 20, marginBottom: 18, flexDirection: 'row', padding: 12 },
  courseImg: { width: 110, height: 110, borderRadius: 16 },
  courseInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 4 },
  courseTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark, letterSpacing: -0.5, lineHeight: 22 },
  courseAuthor: { fontSize: 13, color: COLORS.gray, marginTop: 4, fontWeight: '500' },
  courseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  coursePrice: { fontSize: 15, fontWeight: '900', color: COLORS.primary },
  courseActionBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },

  // AI Center
  aiModuleCard: { backgroundColor: COLORS.white, padding: 18, borderRadius: 22, marginBottom: 18, flexDirection: 'row', alignItems: 'center' },
  aiIconWrapper: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  aiModuleTitle: { fontSize: 17, fontWeight: '800', color: COLORS.dark, marginBottom: 6, letterSpacing: -0.5 },
  aiModuleDesc: { fontSize: 13, color: COLORS.gray, lineHeight: 20, paddingRight: 5 },
  aiArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

  // Khóa học của tôi
  myCourseCard: { flexDirection: 'row', backgroundColor: COLORS.white, padding: 15, borderRadius: 20, marginBottom: 20 },
  myCourseImg: { width: 100, height: 100, borderRadius: 15 },
  myCourseTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  myCourseDesc: { fontSize: 13, color: COLORS.gray, marginBottom: 10 },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBarBg: { flex: 1, height: 6, backgroundColor: COLORS.lightGray, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary },
  progressText: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginLeft: 10 },
  continueBtnWrapper: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.glow },
  continueBtn: { flexDirection: 'row', height: 56, justifyContent: 'center', alignItems: 'center' },
  continueBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },

  // Hồ sơ
  profileHeader: { alignItems: 'center', marginTop: 15, marginBottom: 35 },
  avatarWrapper: { borderRadius: 55, backgroundColor: COLORS.white, padding: 4, marginBottom: 15 },
  profileAvatarLarge: { width: 100, height: 100, borderRadius: 50 },
  profileName: { fontSize: 24, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  profileEmail: { fontSize: 15, color: COLORS.gray, marginTop: 4 },
  editProfileBtn: { marginTop: 15, backgroundColor: COLORS.primaryLight, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  editProfileText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  profileMenu: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20 },
  profileMenuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.bg },
  profileMenuLeft: { flexDirection: 'row', alignItems: 'center' },
  profileMenuIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  profileMenuText: { fontSize: 15, color: COLORS.dark, fontWeight: '600' },

  // Floating Bottom Nav
  floatingNavWrapper: { position: 'absolute', width: '100%', alignItems: 'center' },
  floatingNav: { flexDirection: 'row', backgroundColor: COLORS.white, width: width - 40, height: 70, borderRadius: 35, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 10, color: COLORS.gray, marginTop: 4, fontWeight: '700' },
  navTextActive: { color: COLORS.primary, fontWeight: '900' },
  navItemSpacer: { width: 60 },
  aiFloatingBtn: { position: 'absolute', top: -25, width: 66, height: 66, borderRadius: 33, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: 5 },
  aiBtnGradient: { width: '100%', height: '100%', borderRadius: 30, justifyContent: 'center', alignItems: 'center' }
});
