import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, shadow, spacing } from '../../../shared/theme/tokens';
import { CourseDetailService } from '../services/course-detail.service';
import { docLoiBackend } from '../services/commerce.service';
import type { ChapterDTO, CourseDetailDTO, ReviewDTO } from '../types';
import { ErrorState, LoadingState } from '../components/state-views';
import { FALLBACK_COURSE_IMAGE, resolveCourseImage } from '../services/media-url';
import { formatGiaKhoaHoc, laKhoaHocMienPhi } from '../utils/format-gia';

const ChapterItem = ({ chapter, index }: { chapter: ChapterDTO; index: number }) => {
  const [expanded, setExpanded] = useState(index === 0);
  return (
    <View style={styles.chapterCard}>
      <AnimatedPressable
        style={styles.chapterHeader}
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
      >
        <Text style={styles.chapterTitle} numberOfLines={2}>
          {index + 1}. {chapter.tenChuong}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </AnimatedPressable>
      {expanded &&
        chapter.baiHocs.map((bh) => (
          <View key={bh.maBaiHoc} style={styles.lessonRow}>
            <Ionicons name="play-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.lessonName} numberOfLines={1}>
              {bh.tenBaiHoc}
            </Text>
          </View>
        ))}
    </View>
  );
};

const ReviewItem = ({ review }: { review: ReviewDTO }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.reviewAvatar}>
        <Text style={styles.reviewAvatarText}>
          {(review.nguoiDung?.hoTen || 'A').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.reviewName}>{review.nguoiDung?.hoTen || 'Ẩn danh'}</Text>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {Array.from({ length: 5 }).map((_, s) => (
            <Ionicons
              key={s}
              name="star"
              size={12}
              color={s < review.soSao ? colors.warning : colors.border}
            />
          ))}
        </View>
      </View>
    </View>
    {!!review.nhanXet && (
      <Text style={styles.reviewText} numberOfLines={4}>
        {review.nhanXet}
      </Text>
    )}
  </View>
);

export default function CourseDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const maKhoaHoc = Number(courseId);

  const [course, setCourse] = useState<CourseDetailDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadData = useCallback(async () => {
    if (!maKhoaHoc) return;
    setError(null);
    setLoading(true);
    try {
      // Hiện chi tiết trước; đánh giá tải song song, lỗi review không chặn trang.
      const detailPromise = CourseDetailService.layChiTiet(maKhoaHoc);
      const reviewPromise = CourseDetailService.layDanhGia(maKhoaHoc).catch(() => null);

      const data = await detailPromise;
      setCourse(data);
      setImageError(false);
      setLoading(false);

      const reviewPage = await reviewPromise;
      setReviews(reviewPage?.items ?? []);
    } catch {
      setCourse(null);
      setError('Không tải được chi tiết khóa học. Kiểm tra mạng Wi‑Fi rồi thử lại.');
      setLoading(false);
    }
  }, [maKhoaHoc]);

  useEffect(() => {
    setCourse(null);
    setReviews([]);
    void loadData();
  }, [loadData]);

  const goLearn = () => {
    // Deep-link sang module Learning (Khôi) — chỉ truyền courseId theo contract module.
    router.push(`/khoa-hoc/hoc/${maKhoaHoc}`);
  };

  const goHocThu = () => {
    // Học thử như web: vào thẳng trang học, backend tự mở chế độ học thử
    // (laCheDoHocThu — chỉ xem được N video đầu) khi user chưa sở hữu khóa.
    // Path chính = /khoa-hoc/hoc/...; /learn/... là alias cùng player.
    router.push(`/khoa-hoc/hoc/${maKhoaHoc}?hocThu=1`);
  };

  const dangKyMienPhi = async () => {
    if (!course || registering) return;
    try {
      setRegistering(true);
      const kq = await CourseDetailService.dangKyKhoaHoc(course.maKhoaHoc);
      Alert.alert('Thành công', kq.message || 'Đăng ký khóa học thành công.', [
        { text: 'Vào học ngay', onPress: goLearn },
      ]);
      // Cập nhật lại trạng thái sở hữu sau khi đăng ký.
      await loadData();
    } catch (e) {
      Alert.alert('Lỗi', docLoiBackend(e, 'Không thể đăng ký khóa học lúc này.'));
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LoadingState message="Đang tải chi tiết khóa học..." />
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState
          message={error ?? 'Không tìm thấy khóa học.'}
          onRetry={() => {
            setLoading(true);
            setError(null);
            void loadData();
          }}
        />
      </SafeAreaView>
    );
  }

  const isFree = laKhoaHocMienPhi(course.donViTienTe);
  const isOwned = course.khoaHocDaDangKy;

  const renderCTA = () => {
    if (isOwned) {
      return (
        <AnimatedPressable
          style={[styles.ctaBtn, { backgroundColor: colors.success }]}
          onPress={goLearn}
        >
          <Ionicons name="play-circle" size={20} color="#fff" />
          <Text style={styles.ctaText}>Học ngay</Text>
        </AnimatedPressable>
      );
    }
    if (isFree) {
      return (
        <AnimatedPressable
          style={[styles.ctaBtn, registering && styles.ctaBtnDisabled]}
          onPress={() => void dangKyMienPhi()}
          disabled={registering}
        >
          <Ionicons name="gift-outline" size={20} color="#fff" />
          <Text style={styles.ctaText}>
            {registering ? 'Đang đăng ký...' : 'Đăng ký miễn phí'}
          </Text>
        </AnimatedPressable>
      );
    }
    // Khóa trả phí chưa mua — như web: "Học thử" (outline) + "Mua ngay" (solid).
    return (
      <View style={styles.ctaRow}>
        <AnimatedPressable
          containerStyle={styles.ctaTrialContainer}
          style={styles.ctaTrialBtn}
          onPress={goHocThu}
        >
          <Ionicons name="play-outline" size={18} color={colors.primary} />
          <Text style={styles.ctaTrialText}>Học thử</Text>
        </AnimatedPressable>
        <AnimatedPressable
          containerStyle={styles.ctaBuyContainer}
          style={styles.ctaBtn}
          onPress={() => router.push(`/course/${maKhoaHoc}/checkout`)}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.ctaText}>
            Mua ngay · {formatGiaKhoaHoc(course.giaKhoaHoc, course.donViTienTe)}
          </Text>
        </AnimatedPressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          Chi tiết khóa học
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{
            uri: imageError
              ? FALLBACK_COURSE_IMAGE
              : resolveCourseImage(course.hinhAnh) || FALLBACK_COURSE_IMAGE,
          }}
          style={styles.hero}
          contentFit="cover"
          onError={() => setImageError(true)}
        />

        <View style={styles.content}>
          <Text style={styles.courseTitle}>{course.tenKhoaHoc}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.metaText}>
                {course.diemDanhGiaTB.toFixed(1)} ({course.tongDanhGia})
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{course.tongSoHocVien} học viên</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{course.thoiLuongGio} giờ</Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{course.linhVuc}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{course.trinhDo}</Text>
            </View>
            {course.coChungChi && (
              <View style={[styles.badge, { backgroundColor: colors.aiAccentSoft }]}>
                <Text style={[styles.badgeText, { color: colors.aiAccentPressed }]}>
                  Có chứng chỉ
                </Text>
              </View>
            )}
          </View>

          {!!course.moTa && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Giới thiệu</Text>
              <Text style={styles.description}>{course.moTa}</Text>
            </View>
          )}

          {course.banSeHocDuocGi?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bạn sẽ học được gì</Text>
              {course.banSeHocDuocGi.map((item, i) => (
                <View key={i} style={styles.learnRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.learnText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {course.giangVien && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Giảng viên</Text>
              <View style={styles.instructorRow}>
                <View style={styles.instructorAvatar}>
                  <Text style={styles.instructorAvatarText}>
                    {course.giangVien.hoTen.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.instructorName}>{course.giangVien.hoTen}</Text>
              </View>
            </View>
          )}

          {course.chuongs?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Nội dung khóa học ({course.chuongs.length} chương)
              </Text>
              {course.chuongs.map((chuong, i) => (
                <ChapterItem key={chuong.maChuong} chapter={chuong} index={i} />
              ))}
            </View>
          )}

          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đánh giá của học viên</Text>
              {reviews.slice(0, 5).map((rv) => (
                <ReviewItem key={rv.maDanhGia} review={rv} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}>
        {/* Khóa trả phí: giá đã nằm trong nút "Mua ngay", nhường chỗ cho nút "Học thử". */}
        {!isOwned && isFree && (
          <View style={styles.priceWrap}>
            <Text style={styles.priceLabel}>Giá khóa học</Text>
            <Text style={[styles.priceValue, { color: colors.success }]}>
              {formatGiaKhoaHoc(course.giaKhoaHoc, course.donViTienTe)}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>{renderCTA()}</View>
      </View>
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
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.border,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  courseTitle: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  badgeText: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.subtitle,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  learnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  learnText: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 20,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorAvatarText: {
    color: '#fff',
    fontSize: fontSize.subtitle,
    fontWeight: '800',
  },
  instructorName: {
    fontSize: fontSize.bodyLg,
    fontWeight: '700',
    color: colors.text,
  },
  chapterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    gap: spacing.sm,
  },
  chapterTitle: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lessonName: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    color: '#fff',
    fontWeight: '800',
  },
  reviewName: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  reviewText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.card,
  },
  priceWrap: {
    gap: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  priceValue: {
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.primary,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH_TARGET + 4,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: '#fff',
    fontSize: fontSize.bodyLg,
    fontWeight: '800',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ctaTrialContainer: {
    flex: 1,
  },
  ctaBuyContainer: {
    flex: 1.6,
  },
  ctaTrialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: MIN_TOUCH_TARGET + 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  ctaTrialText: {
    color: colors.primary,
    fontSize: fontSize.bodyLg,
    fontWeight: '800',
  },
});
