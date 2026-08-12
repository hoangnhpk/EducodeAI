import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = { primary: '#f69050', dark: '#111827', muted: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', white: '#fff', purple: '#8b5cf6' };

export default function PublicHomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>EduCodeAI</Text>
            <Text style={styles.tagline}>Học để tạo ra sản phẩm thật</Text>
          </View>
          <Pressable accessibilityRole="button" style={styles.loginButton} onPress={() => router.push('/auth/login' as never)}>
            <Text style={styles.loginText}>Đăng nhập</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Bắt đầu hành trình học lập trình</Text>
            <Text style={styles.heroDescription}>Khám phá khóa học, học theo tiến độ của bạn và luyện tập từng kỹ năng.</Text>
            <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => router.push('/thu-thach')}>
              <Text style={styles.primaryButtonText}>Khám phá trải nghiệm</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </Pressable>
          </View>
          <Ionicons name="sparkles" size={72} color={COLORS.white} />
        </View>

        <Text style={styles.sectionTitle}>Bạn có thể làm gì trên mobile?</Text>
        <View style={styles.grid}>
          <FeatureCard icon="book-outline" title="Học khóa học" description="Xem video, lý thuyết và quiz trên một trình học tập." color={COLORS.primary} />
          <FeatureCard icon="trophy-outline" title="Thử thách" description="Rèn luyện đều đặn với các nhiệm vụ học tập." color="#f59e0b" onPress={() => router.push('/thu-thach')} />
          <FeatureCard icon="chatbubbles-outline" title="Phỏng vấn đồ án" description="Chuẩn bị tốt hơn cho phần trình bày sản phẩm." color={COLORS.purple} onPress={() => router.push('/phong-van-do-an')} />
          <FeatureCard icon="desktop-outline" title="Công cụ desktop" description="IDE và runner tiếp tục được hỗ trợ trên bản web." color="#2563eb" />
        </View>
        <Text style={styles.note}>Đăng nhập khi bạn muốn truy cập nội dung khóa học và lưu tiến độ học tập.</Text>
      </ScrollView>
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Trang chủ" active onPress={() => router.replace('/')} />
        <NavItem icon="book-outline" label="Khóa học" onPress={() => router.push('/khoa-hoc' as never)} />
        <NavItem icon="trophy-outline" label="Thử thách" onPress={() => router.push('/thu-thach')} />
        <NavItem icon="person-outline" label="Tài khoản" onPress={() => router.push('/auth/login' as never)} />
      </View>
    </SafeAreaView>
  );
}

function NavItem({ icon, label, active, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; active?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color={active ? COLORS.primary : COLORS.muted} />
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
  </Pressable>;
}

function FeatureCard({ icon, title, description, color, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string; color: string; onPress?: () => void }) {
  const content = <><View style={[styles.icon, { backgroundColor: `${color}18` }]}><Ionicons name={icon} size={24} color={color} /></View><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardDescription}>{description}</Text></>;
  return onPress ? <Pressable style={styles.card} onPress={onPress}>{content}</Pressable> : <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: COLORS.bg }, content: { padding: 20, paddingBottom: 120 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }, brand: { color: COLORS.dark, fontSize: 24, fontWeight: '800' }, tagline: { color: COLORS.muted, marginTop: 3 }, loginButton: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 }, loginText: { color: COLORS.primary, fontWeight: '700' }, hero: { backgroundColor: COLORS.primary, borderRadius: 22, padding: 22, flexDirection: 'row', alignItems: 'center', marginBottom: 28 }, heroCopy: { flex: 1, marginRight: 12 }, heroTitle: { color: COLORS.white, fontSize: 25, lineHeight: 31, fontWeight: '800' }, heroDescription: { color: '#fff7ed', marginTop: 10, lineHeight: 21 }, primaryButton: { backgroundColor: COLORS.dark, alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 8 }, primaryButtonText: { color: COLORS.white, fontWeight: '700' }, sectionTitle: { color: COLORS.dark, fontSize: 19, fontWeight: '800', marginBottom: 14 }, grid: { gap: 12 }, card: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 135 }, icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, cardTitle: { color: COLORS.dark, fontSize: 16, fontWeight: '800' }, cardDescription: { color: COLORS.muted, lineHeight: 19, marginTop: 5 }, note: { textAlign: 'center', color: COLORS.muted, marginTop: 24, lineHeight: 20 }, bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 72, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 6 }, navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 64, minHeight: 52 }, navLabel: { color: COLORS.muted, fontSize: 11, marginTop: 4 }, navLabelActive: { color: COLORS.primary, fontWeight: '700' }, });
