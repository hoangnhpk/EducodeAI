import React, { useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONT, RADIUS, SHADOWS } from '../configs/theme';
import { AnimatedPressable } from '../components/animated-pressable';
import { ChatBot } from '../components/chat-bot';

export default function TrangChuScreen() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    router.replace('/dang-nhap');
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable style={styles.userInfo} onPress={() => router.push('/ho-so')}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user?.hoTen?.charAt(0) || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>{user?.hoTen || 'Học viên'}</Text>
          </View>
        </AnimatedPressable>
        <AnimatedPressable style={styles.profileBtn} onPress={() => router.push('/ho-so')}>
          <Ionicons name="settings-outline" size={24} color={COLORS.dark} />
        </AnimatedPressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner/Stats */}
        <LinearGradient colors={COLORS.primaryGradient} style={[styles.statsCard, SHADOWS.medium]}>
          <View style={styles.statsInfo}>
            <Text style={styles.statsTitle}>Sẵn sàng bứt phá?</Text>
            <Text style={styles.statsSub}>Tiếp tục hành trình trở thành Master Coder.</Text>
            <View style={styles.badge}>
              <Ionicons name="star" size={14} color={COLORS.gold} />
              <Text style={styles.badgeText}> Danh hiệu: Tập Sự</Text>
            </View>
          </View>
          <Ionicons name="rocket" size={60} color="rgba(255,255,255,0.2)" style={styles.statsIcon} />
        </LinearGradient>

        <Text style={styles.sectionTitle}>Tính năng AI</Text>

        {/* Menu Grid */}
        <View style={styles.grid}>
          {/* Sinh Đồ Án AI */}
          <AnimatedPressable 
            style={[styles.menuCard, SHADOWS.small]} 
            onPress={() => router.push('/phong-van-do-an')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="code-working" size={28} color="#0284c7" />
            </View>
            <Text style={styles.menuTitle}>Sinh Đồ Án AI</Text>
            <Text style={styles.menuDesc}>Tạo đồ án thực chiến</Text>
          </AnimatedPressable>

          {/* Phỏng Vấn AI */}
          <AnimatedPressable 
            style={[styles.menuCard, SHADOWS.small]} 
            onPress={() => router.push('/phong-van-ai')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="mic" size={28} color="#d97706" />
            </View>
            <Text style={styles.menuTitle}>Phỏng Vấn AI</Text>
            <Text style={styles.menuDesc}>Luyện phỏng vấn 1-1</Text>
          </AnimatedPressable>

          {/* Thử Thách */}
          <AnimatedPressable 
            style={[styles.menuCard, SHADOWS.small]} 
            onPress={() => router.push('/thu-thach')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="trophy" size={28} color="#16a34a" />
            </View>
            <Text style={styles.menuTitle}>Thử Thách</Text>
            <Text style={styles.menuDesc}>Nhiệm vụ & quà tặng</Text>
          </AnimatedPressable>

          {/* Lộ Trình */}
          <AnimatedPressable 
            style={[styles.menuCard, SHADOWS.small]} 
            onPress={() => router.push('/lo-trinh-ai')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="map" size={28} color="#9333ea" />
            </View>
            <Text style={styles.menuTitle}>Lộ Trình AI</Text>
            <Text style={styles.menuDesc}>Roadmap cá nhân hóa</Text>
          </AnimatedPressable>
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* Floating Chat Bot */}
      <ChatBot courseName="Educode AI Mobile" />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16, backgroundColor: COLORS.bg
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  greeting: { fontSize: 13, color: COLORS.gray, fontWeight: '600' },
  userName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  
  content: { padding: 24 },
  statsCard: {
    flexDirection: 'row', padding: 24, borderRadius: RADIUS.card,
    marginBottom: 32, overflow: 'hidden'
  },
  statsInfo: { flex: 1, zIndex: 2 },
  statsTitle: { fontSize: 22, fontWeight: '900', color: COLORS.white, marginBottom: 8 },
  statsSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 16, lineHeight: 20 },
  badge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12
  },
  badgeText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  statsIcon: { position: 'absolute', right: -10, bottom: -10, zIndex: 1 },
  
  sectionTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginBottom: 16, letterSpacing: -0.5 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuCard: {
    width: '48%', backgroundColor: COLORS.white, borderRadius: RADIUS.card,
    padding: 20, marginBottom: 16, alignItems: 'center'
  },
  iconWrapper: {
    width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  menuTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 6, textAlign: 'center' },
  menuDesc: { fontSize: 12, color: COLORS.gray, textAlign: 'center', lineHeight: 18 },
});
