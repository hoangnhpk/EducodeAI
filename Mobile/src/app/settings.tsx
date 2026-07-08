import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, StatusBar, Switch, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#fb873f',
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
  success: '#10b981',
  danger: '#ef4444',
  purple: '#8b5cf6',
  blue: '#3b82f6',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
};

export default function SettingsScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderSettingItem = (icon: string, color: string, title: string, rightComponent: React.ReactNode, onPress?: () => void) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      activeOpacity={onPress ? 0.7 : 1} 
      onPress={onPress}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
      <View style={styles.itemRight}>
        {rightComponent}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trung tâm Cài đặt</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Account Section */}
        {renderSectionHeader('Tài khoản & Bảo mật')}
        <View style={[styles.sectionBlock, SHADOWS.small]}>
          {renderSettingItem('person', COLORS.primary, 'Thông tin cá nhân', <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />, () => router.push('/edit-profile'))}
          <View style={styles.divider} />
          {renderSettingItem('shield-checkmark', COLORS.success, 'Đổi mật khẩu', <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />, () => Alert.alert('Bảo mật', 'Mở trang Đổi mật khẩu.'))}
          <View style={styles.divider} />
          {renderSettingItem('card', COLORS.blue, 'Thanh toán & Mua sắm', <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />, () => Alert.alert('Thanh toán', 'Quản lý thẻ tín dụng.'))}
        </View>

        {/* Preferences Section */}
        {renderSectionHeader('Tùy chọn')}
        <View style={[styles.sectionBlock, SHADOWS.small]}>
          {renderSettingItem(
            'moon', COLORS.purple, 'Chế độ tối (Dark Mode)', 
            <Switch 
              value={isDarkMode} 
              onValueChange={setIsDarkMode} 
              trackColor={{ false: COLORS.lightGray, true: COLORS.purple }} 
              thumbColor={COLORS.white} 
            />
          )}
          <View style={styles.divider} />
          {renderSettingItem('language', COLORS.primary, 'Ngôn ngữ', <Text style={styles.valueText}>Tiếng Việt</Text>)}
        </View>

        {/* Notifications Section */}
        {renderSectionHeader('Thông báo')}
        <View style={[styles.sectionBlock, SHADOWS.small]}>
          {renderSettingItem(
            'notifications', COLORS.danger, 'Thông báo đẩy (Push)', 
            <Switch 
              value={isPushEnabled} 
              onValueChange={setIsPushEnabled} 
              trackColor={{ false: COLORS.lightGray, true: COLORS.success }} 
              thumbColor={COLORS.white} 
            />
          )}
          <View style={styles.divider} />
          {renderSettingItem(
            'mail', COLORS.blue, 'Email Marketing', 
            <Switch 
              value={isEmailEnabled} 
              onValueChange={setIsEmailEnabled} 
              trackColor={{ false: COLORS.lightGray, true: COLORS.success }} 
              thumbColor={COLORS.white} 
            />
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.push('/login')}>
          <Text style={styles.logoutText}>Đăng xuất khỏi thiết bị</Text>
        </TouchableOpacity>

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
  
  sectionHeader: { fontSize: 14, fontWeight: '700', color: COLORS.gray, textTransform: 'uppercase', marginBottom: 10, marginLeft: 10, marginTop: 25 },
  sectionBlock: { backgroundColor: COLORS.white, borderRadius: 20, overflow: 'hidden' },
  
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  valueText: { fontSize: 15, color: COLORS.gray, fontWeight: '500' },
  
  divider: { height: 1, backgroundColor: COLORS.bg, marginLeft: 65 },

  logoutBtn: { marginTop: 40, paddingVertical: 15, alignItems: 'center' },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.danger },
});
