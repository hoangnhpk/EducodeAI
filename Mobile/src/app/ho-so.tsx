import React, { useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { COLORS, RADIUS, SHADOWS } from '../configs/theme';
import { AnimatedPressable } from '../components/animated-pressable';

export default function HoSoScreen() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    router.replace('/dang-nhap');
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Hồ Sơ Của Tôi</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
             <Text style={styles.avatarText}>{user?.hoTen?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.hoTen || 'Học viên'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
             <Text style={styles.roleText}>{user?.vaiTro || 'Học viên'}</Text>
          </View>
        </View>

        <View style={styles.menuList}>
           <AnimatedPressable style={styles.menuItem} onPress={() => alert('Đang phát triển')}>
              <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
                 <Ionicons name="settings" size={20} color="#d97706" />
              </View>
              <Text style={styles.menuText}>Cài đặt tài khoản</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.grayLight} />
           </AnimatedPressable>

           <AnimatedPressable style={styles.menuItem} onPress={() => alert('Đang phát triển')}>
              <View style={[styles.menuIcon, { backgroundColor: '#e0f2fe' }]}>
                 <Ionicons name="document-text" size={20} color="#0284c7" />
              </View>
              <Text style={styles.menuText}>Chứng chỉ của tôi</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.grayLight} />
           </AnimatedPressable>

           <AnimatedPressable style={styles.menuItem} onPress={() => alert('Đang phát triển')}>
              <View style={[styles.menuIcon, { backgroundColor: '#fce7f3' }]}>
                 <Ionicons name="help-circle" size={20} color="#db2777" />
              </View>
              <Text style={styles.menuText}>Hỗ trợ / Trợ giúp</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.grayLight} />
           </AnimatedPressable>
        </View>

        <AnimatedPressable style={[styles.btnActionWrapper, { marginTop: 'auto', marginBottom: 40 }]} onPress={handleLogout}>
          <LinearGradient colors={[COLORS.danger, '#b91c1c']} style={styles.btnAction}>
            <Text style={styles.btnActionText}>Đăng Xuất</Text>
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.bg },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  
  content: { flex: 1, padding: 20 },
  
  profileCard: { alignItems: 'center', backgroundColor: COLORS.white, padding: 30, borderRadius: RADIUS.card, ...SHADOWS.medium, marginBottom: 30 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  userName: { fontSize: 22, fontWeight: '900', color: COLORS.dark, marginBottom: 5 },
  userEmail: { fontSize: 14, color: COLORS.gray, marginBottom: 15 },
  roleBadge: { backgroundColor: COLORS.dark, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  roleText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },

  menuList: { backgroundColor: COLORS.white, borderRadius: RADIUS.card, padding: 10, ...SHADOWS.small },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.bg },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.dark },
  
  btnActionWrapper: { borderRadius: RADIUS.button, overflow: 'hidden', ...SHADOWS.glow },
  btnAction: { height: 56, justifyContent: 'center', alignItems: 'center' },
  btnActionText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});
