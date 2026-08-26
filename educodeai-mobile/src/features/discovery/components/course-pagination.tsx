import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, spacing } from '../../../shared/theme/tokens';

export const COURSE_PAGE_SIZE = 12;

export function paginateCourses<T>(items: T[], page: number, pageSize = COURSE_PAGE_SIZE): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalCoursePages(totalItems: number, pageSize = COURSE_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(Math.max(0, totalItems) / pageSize));
}

interface CoursePaginationProps {
  page: number;
  totalItems: number;
  pageSize?: number;
  onChange: (page: number) => void;
}

/** Phân trang khóa học — 12 item/trang (Home + Khám phá). */
export function CoursePagination({
  page,
  totalItems,
  pageSize = COURSE_PAGE_SIZE,
  onChange,
}: CoursePaginationProps) {
  const totalPages = totalCoursePages(totalItems, pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pageButtons = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const set = new Set<number>([1, totalPages, safePage, safePage - 1, safePage + 1]);
    return [...set].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  }, [safePage, totalPages]);

  if (totalItems <= pageSize) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.meta}>
        Trang {safePage}/{totalPages} · {totalItems} khóa học
      </Text>
      <View style={styles.row}>
        <AnimatedPressable
          style={[styles.navBtn, safePage <= 1 && styles.navBtnDisabled]}
          onPress={() => onChange(safePage - 1)}
          disabled={safePage <= 1}
          accessibilityLabel="Trang trước"
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={safePage <= 1 ? colors.textMuted : colors.text}
          />
        </AnimatedPressable>

        {pageButtons.map((p, idx) => {
          const prev = pageButtons[idx - 1];
          const showEllipsis = prev != null && p - prev > 1;
          return (
            <React.Fragment key={p}>
              {showEllipsis && <Text style={styles.ellipsis}>…</Text>}
              <AnimatedPressable
                style={[styles.pageBtn, p === safePage && styles.pageBtnActive]}
                onPress={() => onChange(p)}
                accessibilityLabel={`Trang ${p}`}
              >
                <Text style={[styles.pageText, p === safePage && styles.pageTextActive]}>{p}</Text>
              </AnimatedPressable>
            </React.Fragment>
          );
        })}

        <AnimatedPressable
          style={[styles.navBtn, safePage >= totalPages && styles.navBtnDisabled]}
          onPress={() => onChange(safePage + 1)}
          disabled={safePage >= totalPages}
          accessibilityLabel="Trang sau"
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={safePage >= totalPages ? colors.textMuted : colors.text}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  meta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  navBtn: {
    minWidth: MIN_TOUCH_TARGET - 8,
    minHeight: MIN_TOUCH_TARGET - 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
  pageBtn: {
    minWidth: 36,
    minHeight: 36,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pageText: {
    fontSize: fontSize.caption,
    fontWeight: '800',
    color: colors.text,
  },
  pageTextActive: {
    color: '#fff',
  },
  ellipsis: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    paddingHorizontal: 2,
  },
});
