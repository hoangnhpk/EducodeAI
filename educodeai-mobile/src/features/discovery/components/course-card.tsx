import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, radius, shadow, spacing } from '../../../shared/theme/tokens';
import type { CourseListItemDTO } from '../types';
import { FALLBACK_COURSE_IMAGE, resolveCourseImage } from '../services/media-url';
import { formatGiaKhoaHoc, laKhoaHocMienPhi } from '../utils/format-gia';

interface CourseCardProps {
  course: CourseListItemDTO;
  onPress: (maKhoaHoc: number) => void;
}

const parseKyNangTags = (raw?: string): string[] => {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
};

/** Card khóa học dùng chung cho Home, danh sách và tìm kiếm. */
export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const isFree = laKhoaHocMienPhi(course.donViTienTe);
  const tags = parseKyNangTags(course.kyNangChinh);
  const imageSource = imageError
    ? FALLBACK_COURSE_IMAGE
    : resolveCourseImage(course.hinhAnh) || FALLBACK_COURSE_IMAGE;

  return (
    <AnimatedPressable
      containerStyle={styles.cardContainer}
      style={styles.card}
      onPress={() => onPress(course.maKhoaHoc)}
      accessibilityRole="button"
      accessibilityLabel={`Khóa học ${course.tenKhoaHoc}`}
    >
      <View style={styles.thumbnailWrap}>
        <Image
          source={{ uri: imageSource }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
          onError={() => setImageError(true)}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {course.linhVuc}
          </Text>
        </View>
        {course.khoaHocDaDangKy ? (
          <View style={[styles.stateBadge, { backgroundColor: colors.success }]}>
            <Ionicons name="play-circle" size={12} color="#fff" />
            <Text style={styles.stateBadgeText}>Đang học</Text>
          </View>
        ) : isFree ? (
          <View style={[styles.stateBadge, { backgroundColor: colors.info }]}>
            <Text style={styles.stateBadgeText}>Miễn phí</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={styles.levelBadge}>
            <Ionicons name="layers-outline" size={12} color={colors.primaryDark} />
            <Text style={styles.levelText} numberOfLines={1}>
              {course.trinhDo}
            </Text>
          </View>
          <View style={styles.ratingWrap}>
            <Ionicons name="star" size={13} color={colors.warning} />
            <Text style={styles.ratingText}>{course.diemDanhGiaTB.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {course.tenKhoaHoc}
        </Text>

        {tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.map((tag, i) => (
              <View key={`${course.maKhoaHoc}-${tag}-${i}`} style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.durationWrap}>
            <Ionicons name="time-outline" size={13} color={colors.primary} />
            <Text style={styles.durationText}>{course.thoiLuongGio} giờ học</Text>
          </View>
          <Text style={[styles.price, isFree && { color: colors.success }]}>
            {formatGiaKhoaHoc(course.giaKhoaHoc, course.donViTienTe)}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  // flex: 1 để card fill chiều cao hàng trong grid 2 cột → 2 card cùng hàng cao bằng nhau.
  cardContainer: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  thumbnailWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.background,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    maxWidth: '60%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(17,24,39,0.78)',
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stateBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  stateBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    flexGrow: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '70%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  levelText: {
    color: colors.primaryDark,
    fontSize: fontSize.caption,
    fontWeight: '700',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: colors.text,
    fontSize: fontSize.caption,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.body,
    fontWeight: '700',
    lineHeight: 20,
    minHeight: 40,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  tag: {
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(246,144,80,0.22)',
  },
  tagText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Ghim footer xuống đáy card khi card bị kéo cao bằng card cùng hàng.
    marginTop: 'auto',
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  durationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    color: colors.textMuted,
    fontSize: fontSize.caption,
  },
  price: {
    color: colors.primary,
    fontSize: fontSize.body,
    fontWeight: '800',
  },
});
