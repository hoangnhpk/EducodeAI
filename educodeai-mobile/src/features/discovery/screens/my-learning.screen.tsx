import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, shadow, spacing } from '../../../shared/theme/tokens';
import { MyCoursesService } from '../services/my-courses.service';
import type { MyCourseDTO } from '../types';
import { EmptyState, ErrorState, LoadingState } from '../components/state-views';
import { FALLBACK_COURSE_IMAGE, resolveCourseImage } from '../services/media-url';

const gioiHanTienDo = (x: number): number => {
  if (Number.isNaN(x)) return 0;
  return Math.min(100, Math.max(0, x));
};

const hienThiTrangThai = (t?: string | null): string => {
  const s = (t ?? '').trim();
  if (!s) return 'Đang học';
  if (s.toLowerCase() === 'hoanthanh') return 'Đã hoàn thành';
  if (s.toLowerCase() === 'danghoc') return 'Đang học';
  return s;
};

const MyCourseCard = ({ course, onPress }: { course: MyCourseDTO; onPress: () => void }) => {
  const [imageError, setImageError] = useState(false);
  const pct = gioiHanTienDo(course.tienDo);
  const daHoanThanh = pct >= 100;

  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      <Image
        source={{
          uri: imageError
            ? FALLBACK_COURSE_IMAGE
            : resolveCourseImage(course.hinhAnh) || FALLBACK_COURSE_IMAGE,
        }}
        style={styles.thumb}
        contentFit="cover"
        transition={200}
        onError={() => setImageError(true)}
      />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {course.tenKhoaHoc}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {course.linhVuc} · {course.thoiLuongGio} giờ · {hienThiTrangThai(course.trangThai)}
        </Text>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${pct}%` },
                daHoanThanh && { backgroundColor: colors.success },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{pct}%</Text>
        </View>
        <View style={styles.ctaRow}>
          <Ionicons
            name={daHoanThanh ? 'checkmark-circle' : 'play-circle'}
            size={16}
            color={daHoanThanh ? colors.success : colors.primary}
          />
          <Text style={[styles.ctaText, daHoanThanh && { color: colors.success }]}>
            {daHoanThanh ? 'Xem lại khóa học' : 'Tiếp tục học'}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default function MyLearningScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<MyCourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const data = await MyCoursesService.layDanhSach();
      setCourses(data);
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      setError(
        status === 401
          ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
          : 'Không tải được danh sách khóa học. Vui lòng thử lại sau.'
      );
      setCourses([]);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    })();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khóa học của tôi</Text>
        <Text style={styles.headerSub}>Các khóa học bạn sở hữu và tiến độ học tập</Text>
      </View>

      {loading ? (
        <LoadingState message="Đang tải khóa học..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void onRefresh()} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => String(item.maDangKy)}
          renderItem={({ item }) => (
            <MyCourseCard
              course={item}
              // Chuyển sang chi tiết; từ đó CTA "Học ngay" deep-link /khoa-hoc/hoc/[courseId].
              onPress={() => router.push(`/course/${item.maKhoaHoc}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="book-outline"
              title="Bạn chưa có khóa học nào"
              message="Hãy khám phá và chọn khóa học phù hợp với bạn."
              actionLabel="Khám phá khóa học"
              onAction={() => router.push('/courses')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.titleLg,
    fontWeight: '800',
    color: colors.text,
  },
  headerSub: {
    marginTop: 2,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    ...shadow.card,
  },
  thumb: {
    width: 110,
    height: 78,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    minWidth: 32,
    textAlign: 'right',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ctaText: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    color: colors.primary,
  },
});
