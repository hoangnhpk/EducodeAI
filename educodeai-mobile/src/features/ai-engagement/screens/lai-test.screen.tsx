import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Href, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';

const COLORS = {
  primary: '#F69050',
  ai: '#8B5CF6',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

type DiagnosticState = {
  hasToken: boolean;
  hasUser: boolean;
  checkedAt: string;
};

type TestEntry = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
};

const TEST_ENTRIES: TestEntry[] = [
  {
    title: 'Phỏng vấn AI độc lập',
    description: 'Test bắt đầu, trả lời, kết thúc, kết quả và lịch sử.',
    icon: 'chatbubbles-outline',
    route: '/phong-van-ai',
  },
  {
    title: 'Sinh đồ án AI',
    description: 'Test tạo đồ án → nộp → chuyển sang phỏng vấn đồ án.',
    icon: 'code-slash-outline',
    route: '/sinh-do-an-ai',
  },
  {
    title: 'Lộ trình AI',
    description: 'Test validation, tạo lộ trình, lịch sử và chi tiết.',
    icon: 'map-outline',
    route: '/lo-trinh-ai',
  },
];

export default function LaiTestScreen() {
  const router = useRouter();
  const [courseId, setCourseId] = useState('1');
  const [courseError, setCourseError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticState | null>(null);

  const refreshDiagnostics = useCallback(async () => {
    setChecking(true);
    try {
      const [token, user] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);
      setDiagnostics({
        hasToken: Boolean(token),
        hasUser: Boolean(user),
        checkedAt: new Date().toLocaleTimeString('vi-VN'),
      });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void refreshDiagnostics();
  }, [refreshDiagnostics]);

  const openCertificate = () => {
    const parsedCourseId = Number(courseId);
    if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
      setCourseError('Course ID phải là số nguyên lớn hơn 0.');
      return;
    }
    setCourseError(null);
    router.push({ pathname: '/chung-chi-khoa-hoc', params: { courseId: String(parsedCourseId) } });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="flask" size={22} color={COLORS.surface} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Lai Test</Text>
          <Text style={styles.headerSubtitle}>AI & Engagement mobile</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.ai} />
          <Text style={styles.noticeText}>
            Đây là màn hình kiểm thử độc lập. Nó không phụ thuộc link từ Home của Khiến hoặc Learning của Khôi.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Chẩn đoán phiên test</Text>
        <View style={styles.card}>
          <DiagnosticRow label="Nền tảng" value={`${Platform.OS} ${String(Platform.Version)}`} ok />
          <DiagnosticRow label="Expo SDK" value={Constants.expoConfig?.sdkVersion || 'Không xác định'} ok />
          <DiagnosticRow label="Token đăng nhập" value={diagnostics?.hasToken ? 'Đã có' : 'Chưa có'} ok={diagnostics?.hasToken === true} />
          <DiagnosticRow label="Thông tin user" value={diagnostics?.hasUser ? 'Đã có' : 'Chưa có'} ok={diagnostics?.hasUser === true} />
          <Text style={styles.safeText}>Không hiển thị token hoặc dữ liệu tài khoản nhạy cảm.</Text>
          <AnimatedPressable style={styles.refreshButton} onPress={() => void refreshDiagnostics()} disabled={checking}>
            {checking ? <ActivityIndicator color={COLORS.ai} /> : <Ionicons name="refresh" size={19} color={COLORS.ai} />}
            <Text style={styles.refreshText}>{diagnostics ? `Kiểm tra lại · ${diagnostics.checkedAt}` : 'Kiểm tra phiên'}</Text>
          </AnimatedPressable>
        </View>

        <Text style={styles.sectionTitle}>Chức năng của Lai</Text>
        {TEST_ENTRIES.map(entry => (
          <AnimatedPressable key={entry.title} style={styles.featureCard} onPress={() => router.push(entry.route)}>
            <View style={styles.featureIcon}>
              <Ionicons name={entry.icon} size={24} color={COLORS.ai} />
            </View>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>{entry.title}</Text>
              <Text style={styles.featureDescription}>{entry.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
          </AnimatedPressable>
        ))}

        <View style={styles.certificateCard}>
          <View style={styles.featureHeading}>
            <View style={styles.featureIcon}>
              <Ionicons name="ribbon-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>Chứng chỉ khóa học</Text>
              <Text style={styles.featureDescription}>Nhập ID khóa học thật để kiểm tra trạng thái và bài thi.</Text>
            </View>
          </View>
          <Text style={styles.inputLabel}>Course ID</Text>
          <TextInput
            style={styles.input}
            value={courseId}
            onChangeText={value => {
              setCourseId(value);
              setCourseError(null);
            }}
            keyboardType="number-pad"
            placeholder="Ví dụ: 1"
            placeholderTextColor={COLORS.muted}
          />
          {courseError && <Text style={styles.errorText}>{courseError}</Text>}
          <AnimatedPressable style={styles.primaryButton} onPress={openCertificate}>
            <Text style={styles.primaryButtonText}>Mở chứng chỉ</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.surface} />
          </AnimatedPressable>
        </View>

        <Text style={styles.sectionTitle}>Cách đọc log terminal</Text>
        <View style={styles.logCard}>
          <LogLine code="401" text="Auth chưa có token hoặc token hết hạn — VERIFY ÂU/AUTH." />
          <LogLine code="404" text="Đường dẫn API không khớp backend." />
          <LogLine code="Network Error" text="Điện thoại không truy cập được backend/IP máy tính." />
          <LogLine code="Unable to resolve" text="Bundle thiếu module hoặc import sai; gửi nguyên log Metro để kiểm tra." />
          <Text style={styles.logHint}>Khi gặp lỗi, giữ Metro đang chạy và gửi các dòng đỏ trong terminal; không gửi token hoặc Authorization header.</Text>
        </View>

        <View style={styles.phaseThreeNotice}>
          <Ionicons name="people-outline" size={22} color={COLORS.warning} />
          <Text style={styles.phaseThreeText}>Challenges, Leaderboard và Danh hiệu thuộc AI Phase 3. Không dùng màn hình đó để kết luận phần Lai đã hoàn thành.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function DiagnosticRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <View style={styles.diagnosticRow}>
      <Text style={styles.diagnosticLabel}>{label}</Text>
      <View style={styles.diagnosticValue}>
        <Ionicons name={ok ? 'checkmark-circle' : 'alert-circle'} size={18} color={ok ? COLORS.success : COLORS.warning} />
        <Text style={styles.diagnosticText}>{value}</Text>
      </View>
    </View>
  );
}

function LogLine({ code, text }: { code: string; text: string }) {
  return (
    <View style={styles.logLine}>
      <Text style={styles.logCode}>{code}</Text>
      <Text style={styles.logText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: Platform.OS === 'android' ? 24 : 0, backgroundColor: COLORS.background },
  header: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  logo: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.ai },
  headerCopy: { marginLeft: 12 },
  headerTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  headerSubtitle: { marginTop: 2, color: COLORS.muted, fontSize: 13 },
  content: { padding: 16, paddingBottom: 48 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 12, backgroundColor: '#F5F3FF' },
  noticeText: { flex: 1, marginLeft: 10, color: COLORS.text, lineHeight: 21 },
  sectionTitle: { marginTop: 24, marginBottom: 10, color: COLORS.text, fontSize: 20, fontWeight: '800' },
  card: { padding: 16, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, backgroundColor: COLORS.surface },
  diagnosticRow: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  diagnosticLabel: { color: COLORS.muted },
  diagnosticValue: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  diagnosticText: { marginLeft: 6, color: COLORS.text, fontWeight: '600' },
  safeText: { marginTop: 8, color: COLORS.muted, fontSize: 12 },
  refreshButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, borderRadius: 10, backgroundColor: '#F5F3FF' },
  refreshText: { marginLeft: 8, color: COLORS.ai, fontWeight: '700' },
  featureCard: { minHeight: 88, flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, backgroundColor: COLORS.surface },
  featureIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F3FF' },
  featureCopy: { flex: 1, marginHorizontal: 12 },
  featureTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  featureDescription: { marginTop: 4, color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  certificateCard: { padding: 16, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, backgroundColor: COLORS.surface },
  featureHeading: { flexDirection: 'row', alignItems: 'center' },
  inputLabel: { marginTop: 16, marginBottom: 6, color: COLORS.text, fontWeight: '700' },
  input: { minHeight: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, color: COLORS.text, fontSize: 16 },
  errorText: { marginTop: 7, color: COLORS.danger },
  primaryButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, borderRadius: 11, backgroundColor: COLORS.primary },
  primaryButtonText: { marginRight: 8, color: COLORS.surface, fontWeight: '800' },
  logCard: { padding: 16, borderRadius: 16, backgroundColor: '#111827' },
  logLine: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  logCode: { minWidth: 92, color: '#FBBF24', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: '700' },
  logText: { flex: 1, color: '#E5E7EB', lineHeight: 20 },
  logHint: { marginTop: 4, color: '#9CA3AF', fontSize: 12, lineHeight: 18 },
  phaseThreeNotice: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 18, padding: 14, borderRadius: 12, backgroundColor: '#FFFBEB' },
  phaseThreeText: { flex: 1, marginLeft: 9, color: '#92400E', lineHeight: 20 },
});
