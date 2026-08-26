import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, shadow, spacing } from '../../../shared/theme/tokens';
import { CommerceService, docLoiBackend } from '../services/commerce.service';

export default function GiftRedeemScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const ma = code.trim().toUpperCase();
    if (!ma) {
      Alert.alert('Thiếu dữ liệu', 'Vui lòng nhập mã quà tặng.');
      return;
    }
    try {
      setSubmitting(true);
      const ketQua = await CommerceService.nhapMaQuaTang(ma);
      setCode('');
      Alert.alert('Thành công', ketQua.thongBao, [
        { text: 'Xem khóa học', onPress: () => router.push(`/course/${ketQua.maKhoaHoc}`) },
        { text: 'Đóng', style: 'cancel' },
      ]);
    } catch (e) {
      Alert.alert('Lỗi', docLoiBackend(e, 'Không thể nhập mã quà tặng lúc này.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.topBarTitle}>Nhập mã quà tặng</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="gift" size={36} color={colors.primary} />
            </View>
            <Text style={styles.title}>Nhập mã quà tặng khóa học</Text>
            <Text style={styles.hint}>
              Nhập mã do người tặng gửi để mở khóa học vào tài khoản của bạn.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: EDG-ABCD-EFGH-JKLM"
              placeholderTextColor={colors.textMuted}
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <AnimatedPressable
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              disabled={submitting}
              onPress={() => void handleSubmit()}
            >
              <Text style={styles.submitText}>
                {submitting ? 'Đang xử lý...' : 'Nhập mã quà tặng'}
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={styles.historyLink}
              onPress={() => router.push('/gifts/history')}
            >
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={styles.historyLinkText}>Xem lịch sử mã quà tặng</Text>
            </AnimatedPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: fontSize.bodyLg,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'stretch',
    ...shadow.card,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  hint: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    minHeight: MIN_TOUCH_TARGET + 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.bodyLg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 1,
  },
  submitBtn: {
    minHeight: MIN_TOUCH_TARGET + 4,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: fontSize.bodyLg,
    fontWeight: '800',
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: MIN_TOUCH_TARGET,
  },
  historyLinkText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: fontSize.body,
  },
});
