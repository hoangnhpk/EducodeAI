import React from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Clipboard, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  success: '#10b981',
  successLight: '#dcfce7',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
};

export default function KetQuaDoAnScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ data: string }>();

  let projectData = null;
  try {
    if (data) projectData = JSON.parse(data);
  } catch (e) {
    console.error("Invalid project data", e);
  }

  const handleCopy = () => {
    if (projectData) {
      Clipboard.setString(JSON.stringify(projectData, null, 2));
      Alert.alert('Thành công', 'Đã copy dữ liệu đồ án vào bộ nhớ tạm!');
    }
  };

  if (!projectData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lỗi Dữ Liệu</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.gray }}>Không tìm thấy thông tin đồ án.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Đồ Án</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
          <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Banner Tổng quan */}
        <View style={[styles.card, SHADOWS.small]}>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.statusText}>HOÀN TẤT</Text>
          </View>
          <Text style={styles.projectTitle}>{projectData.tenDoAn}</Text>
          <Text style={styles.projectDesc}>{projectData.moTa}</Text>
        </View>

        {/* Yêu cầu chức năng */}
        <View style={[styles.card, SHADOWS.small, { marginTop: 20 }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="list" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Yêu cầu Chức năng</Text>
          </View>
          <View style={styles.featureList}>
            {projectData.yeuCauChucNang?.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureBullet}>{(index + 1).toString().padStart(2, '0')}.</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cấu trúc Database */}
        <View style={[styles.card, SHADOWS.small, { marginTop: 20 }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="server" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Cấu trúc Database</Text>
          </View>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{projectData.cauTrucDatabase}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  copyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  container: { flex: 1, paddingHorizontal: 20 },

  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20 },

  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.successLight, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 15 },
  statusText: { color: COLORS.success, fontSize: 12, fontWeight: '800', marginLeft: 4, letterSpacing: 0.5 },
  projectTitle: { fontSize: 22, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5, marginBottom: 10 },
  projectDesc: { fontSize: 15, color: COLORS.gray, lineHeight: 22 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },

  featureList: { marginLeft: 5 },
  featureItem: { flexDirection: 'row', marginBottom: 12 },
  featureBullet: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginRight: 10, width: 25 },
  featureText: { flex: 1, fontSize: 15, color: COLORS.gray, lineHeight: 22 },

  codeBlock: { backgroundColor: COLORS.dark, padding: 15, borderRadius: 16, marginTop: 5 },
  codeText: { fontFamily: 'monospace', color: COLORS.success, fontSize: 13, lineHeight: 22 }
});
