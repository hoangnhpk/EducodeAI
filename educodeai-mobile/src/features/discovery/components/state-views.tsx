import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, spacing } from '../../../shared/theme/tokens';

export const LoadingState = ({ message = 'Đang tải...' }: { message?: string }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.message}>{message}</Text>
  </View>
);

export const EmptyState = ({
  icon = 'search-outline',
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={48} color={colors.textMuted} />
    <Text style={styles.title}>{title}</Text>
    {!!message && <Text style={styles.message}>{message}</Text>}
    {!!actionLabel && !!onAction && (
      <AnimatedPressable style={styles.actionBtn} onPress={onAction}>
        <Text style={styles.actionText}>{actionLabel}</Text>
      </AnimatedPressable>
    )}
  </View>
);

export const ErrorState = ({
  message = 'Đã có lỗi xảy ra. Vui lòng thử lại.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <View style={styles.container}>
    <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
    <Text style={styles.title}>Không tải được dữ liệu</Text>
    <Text style={styles.message}>{message}</Text>
    {!!onRetry && (
      <AnimatedPressable style={styles.actionBtn} onPress={onRetry}>
        <Ionicons name="refresh" size={16} color="#fff" />
        <Text style={styles.actionText}>Thử lại</Text>
      </AnimatedPressable>
    )}
  </View>
);

/** Skeleton card đơn giản cho danh sách khóa học. */
export const CourseCardSkeleton = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonThumb} />
    <View style={styles.skeletonBody}>
      <View style={[styles.skeletonLine, { width: '55%' }]} />
      <View style={[styles.skeletonLine, { width: '90%' }]} />
      <View style={[styles.skeletonLine, { width: '40%' }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.subtitle,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.body,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  skeletonThumb: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.border,
  },
  skeletonBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  skeletonLine: {
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
});
