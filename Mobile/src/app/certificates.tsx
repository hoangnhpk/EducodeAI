import React from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, StatusBar, ImageBackground, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
  gold: '#fbbf24',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  glow: { shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 }
};

export default function CertificatesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chứng chỉ của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Certificate Card */}
        <View style={[styles.certWrapper, SHADOWS.glow]}>
          <LinearGradient colors={['#fef3c7', '#fde68a']} style={styles.certCard}>
            <View style={styles.certInnerBorder}>
              <View style={styles.certHeader}>
                <Ionicons name="ribbon" size={40} color="#d97706" />
                <Text style={styles.certTitle}>CERTIFICATE</Text>
                <Text style={styles.certSubtitle}>OF COMPLETION</Text>
              </View>

              <Text style={styles.presentedText}>This is proudly presented to</Text>
              <Text style={styles.studentName}>Đinh Lưu Lai</Text>
              
              <Text style={styles.courseDesc}>For successfully completing the course</Text>
              <Text style={styles.courseName}>Khóa học C# ASP.NET Core API</Text>
              
              <View style={styles.signatureRow}>
                <View style={styles.signatureCol}>
                  <Text style={styles.signatureDate}>15/05/2026</Text>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureLabel}>Date</Text>
                </View>
                
                {/* Logo or Seal */}
                <View style={styles.seal}>
                  <Ionicons name="shield-checkmark" size={30} color={COLORS.white} />
                </View>

                <View style={styles.signatureCol}>
                  <Text style={styles.signatureName}>Quốc Hùng</Text>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureLabel}>Instructor</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity activeOpacity={0.8} style={[styles.actionBtn, { backgroundColor: COLORS.white }, SHADOWS.small]} onPress={() => Alert.alert('Tải xuống', 'Đang tải PDF chứng chỉ...')}>
            <Ionicons name="download-outline" size={20} color={COLORS.dark} style={{ marginRight: 8 }} />
            <Text style={[styles.actionText, { color: COLORS.dark }]}>Tải PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity activeOpacity={0.8} style={[styles.actionBtn, { backgroundColor: '#0a66c2' }, SHADOWS.small]} onPress={() => Alert.alert('Chia sẻ', 'Mở ứng dụng LinkedIn để chia sẻ.')}>
            <Ionicons name="logo-linkedin" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={[styles.actionText, { color: COLORS.white }]}>Chia sẻ LinkedIn</Text>
          </TouchableOpacity>
        </View>

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

  certWrapper: { borderRadius: 20, overflow: 'hidden', marginBottom: 30 },
  certCard: { width: '100%', padding: 15 },
  certInnerBorder: { borderWidth: 2, borderColor: '#d97706', borderRadius: 10, padding: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)' },
  
  certHeader: { alignItems: 'center', marginBottom: 20 },
  certTitle: { fontSize: 24, fontWeight: '900', color: '#b45309', letterSpacing: 4, marginTop: 10 },
  certSubtitle: { fontSize: 12, fontWeight: '700', color: '#d97706', letterSpacing: 2 },
  
  presentedText: { fontSize: 14, color: '#92400e', fontStyle: 'italic', marginBottom: 10 },
  studentName: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark, fontFamily: 'serif', marginBottom: 20 },
  
  courseDesc: { fontSize: 13, color: '#92400e', marginBottom: 5 },
  courseName: { fontSize: 18, fontWeight: '800', color: '#b45309', textAlign: 'center', marginBottom: 30 },
  
  signatureRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' },
  signatureCol: { alignItems: 'center', width: '35%' },
  signatureDate: { fontSize: 14, color: COLORS.dark, fontWeight: '600', marginBottom: 5 },
  signatureName: { fontSize: 16, fontFamily: 'serif', fontStyle: 'italic', color: COLORS.dark, marginBottom: 5 },
  signatureLine: { width: '100%', height: 1, backgroundColor: '#d97706', marginBottom: 5 },
  signatureLabel: { fontSize: 12, color: '#b45309' },
  
  seal: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#d97706', justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },

  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 12, marginHorizontal: 5 },
  actionText: { fontSize: 15, fontWeight: '700' }
});
