import React from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, StatusBar 
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
  danger: '#ef4444',
  info: '#3b82f6',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
};

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'course', title: 'Khóa học mới ra mắt!', desc: 'Khóa học Thực chiến React Native đã chính thức lên kệ. Đăng ký ngay để nhận ưu đãi 30%.', time: '2 giờ trước', isRead: false },
  { id: 2, type: 'system', title: 'Cập nhật hệ thống', desc: 'Hệ thống AI Phỏng vấn vừa được cập nhật thêm chuyên ngành Data Science.', time: '5 giờ trước', isRead: false },
  { id: 3, type: 'promo', title: 'Ưu đãi cuối tuần', desc: 'Nhập mã WEEKEND để giảm 50k cho tất cả các khóa học.', time: '1 ngày trước', isRead: true },
  { id: 4, type: 'course', title: 'Bài giảng mới', desc: 'Giảng viên Quốc Hùng vừa thêm 2 bài giảng mới vào khóa C# ASP.NET Core.', time: '2 ngày trước', isRead: true },
  { id: 5, type: 'system', title: 'Chào mừng bạn mới', desc: 'Cảm ơn bạn đã gia nhập EducodeAI. Hãy bắt đầu hành trình học tập ngay thôi!', time: '1 tuần trước', isRead: true },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const getIconData = (type: string) => {
    switch(type) {
      case 'course': return { name: 'book', color: COLORS.primary, bg: COLORS.primaryLight };
      case 'promo': return { name: 'pricetag', color: COLORS.danger, bg: '#fee2e2' };
      case 'system': default: return { name: 'notifications', color: COLORS.info, bg: '#dbeafe' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity>
          <Ionicons name="checkmark-done-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {MOCK_NOTIFICATIONS.map((item) => {
          const icon = getIconData(item.type);
          return (
            <TouchableOpacity key={item.id} activeOpacity={0.7} style={[styles.notiCard, !item.isRead && styles.notiCardUnread]}>
              <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
                <Ionicons name={icon.name as any} size={22} color={icon.color} />
              </View>
              <View style={styles.contentBox}>
                <Text style={[styles.title, !item.isRead && { color: COLORS.dark }]}>{item.title}</Text>
                <Text style={styles.desc} numberOfLines={2}>{item.desc}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  
  container: { flex: 1, paddingHorizontal: 20 },
  
  notiCard: { flexDirection: 'row', backgroundColor: COLORS.white, padding: 15, borderRadius: 16, marginBottom: 12, ...SHADOWS.small },
  notiCardUnread: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' }, // Xanh lá nhạt
  
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contentBox: { flex: 1 },
  
  title: { fontSize: 15, fontWeight: '800', color: COLORS.gray, marginBottom: 4 },
  desc: { fontSize: 13, color: COLORS.gray, lineHeight: 18, marginBottom: 6 },
  time: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.success, marginLeft: 10, marginTop: 5 },
});
