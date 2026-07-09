import React from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, StatusBar, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#fb873f',
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

export default function AboutScreen() {
  const router = useRouter();

  const renderLinkItem = (icon: string, title: string) => (
    <TouchableOpacity style={styles.linkItem} onPress={() => Alert.alert('Trang', `Đang mở: ${title}`)}>
      <View style={styles.linkLeft}>
        <Ionicons name={icon as any} size={22} color={COLORS.gray} style={{ marginRight: 15 }} />
        <Text style={styles.linkTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giới thiệu & Hỗ trợ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* App Info Header */}
        <View style={styles.appInfoSection}>
          <View style={[styles.logoWrapper, SHADOWS.glow]}>
            <LinearGradient colors={COLORS.primaryGradient} style={styles.logoGradient}>
              <Ionicons name="rocket" size={40} color={COLORS.white} />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>EducodeAI</Text>
          <Text style={styles.appVersion}>Phiên bản 1.0.0 (Build 100)</Text>
          <Text style={styles.appDesc}>
            Nền tảng học tập Lập trình thông minh tích hợp công nghệ Trí Tuệ Nhân Tạo. Định hướng tương lai IT cho hàng triệu lập trình viên.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity activeOpacity={0.8} style={[styles.actionBtnBox, SHADOWS.small]} onPress={() => Alert.alert('Hỗ trợ', 'Bắt đầu chat với nhân viên CSKH...')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="chatbubbles" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.actionBtnText}>Chat CSKH</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={[styles.actionBtnBox, SHADOWS.small]} onPress={() => Alert.alert('Đánh giá', 'Cảm ơn bạn đã đánh giá 5 sao!')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#fff3ed' }]}>
              <Ionicons name="star" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionBtnText}>Đánh giá App</Text>
          </TouchableOpacity>
        </View>

        {/* Links List */}
        <View style={[styles.linksContainer, SHADOWS.small]}>
          {renderLinkItem('document-text-outline', 'Điều khoản sử dụng')}
          <View style={styles.divider} />
          {renderLinkItem('shield-checkmark-outline', 'Chính sách bảo mật')}
          <View style={styles.divider} />
          {renderLinkItem('globe-outline', 'Website chính thức')}
          <View style={styles.divider} />
          {renderLinkItem('logo-facebook', 'Cộng đồng trên Facebook')}
        </View>

        <Text style={styles.copyright}>© 2026 EducodeAI. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  
  container: { flex: 1, paddingHorizontal: 20 },
  
  appInfoSection: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  logoWrapper: { borderRadius: 30, marginBottom: 15 },
  logoGradient: { width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  appName: { fontSize: 24, fontWeight: '900', color: COLORS.dark, marginBottom: 5 },
  appVersion: { fontSize: 14, color: COLORS.gray, marginBottom: 15, fontWeight: '600' },
  appDesc: { textAlign: 'center', fontSize: 14, color: COLORS.gray, lineHeight: 22, paddingHorizontal: 10 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  actionBtnBox: { flex: 1, backgroundColor: COLORS.white, borderRadius: 20, padding: 20, alignItems: 'center', marginHorizontal: 5 },
  actionIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.dark },

  linksContainer: { backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 15 },
  linkItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  linkLeft: { flexDirection: 'row', alignItems: 'center' },
  linkTitle: { fontSize: 15, fontWeight: '500', color: COLORS.dark },
  divider: { height: 1, backgroundColor: COLORS.bg, marginLeft: 37 },

  copyright: { textAlign: 'center', fontSize: 12, color: COLORS.lightGray, marginTop: 40, fontWeight: '500' }
});
