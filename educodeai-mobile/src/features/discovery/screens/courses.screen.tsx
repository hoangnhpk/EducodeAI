import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, spacing } from '../../../shared/theme/tokens';
import { DiscoveryHomeService } from '../services/discovery-home.service';
import type { CourseListItemDTO } from '../types';
import { CourseCard } from '../components/course-card';
import { CourseCardSkeleton, EmptyState, ErrorState } from '../components/state-views';
import {
  CoursePagination,
  paginateCourses,
  totalCoursePages,
} from '../components/course-pagination';
import { useDebounce } from '../hooks/use-debounce';
import { layBoLocKhoaHoc } from '../services/course-filter-bus';

export default function CoursesScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [filterMaGV, setFilterMaGV] = useState<number | null>(null);
  const [filterTenGV, setFilterTenGV] = useState('');
  const [courses, setCourses] = useState<CourseListItemDTO[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nhận bộ lọc Home gửi qua bus mỗi lần tab được focus
  // (params của Expo Router không tin cậy khi navigate sang tab đã mount).
  useFocusEffect(
    useCallback(() => {
      const boLoc = layBoLocKhoaHoc();
      if (!boLoc) return;
      setSearchTerm(boLoc.search ?? '');
      setFilterMaGV(boLoc.maGiangVien ?? null);
      setFilterTenGV(boLoc.tenGiangVien ?? '');
      setPage(1);
    }, []),
  );

  const loadData = useCallback(async (search: string, maGiangVien: number | null, bypassCache = false) => {
    setError(null);
    try {
      const data = await DiscoveryHomeService.layDanhSachKhoaHoc(search, maGiangVien, { bypassCache });
      setCourses(data);
      setPage(1);
    } catch {
      setError('Không thể tải danh sách khóa học. Kiểm tra mạng và thử lại.');
      setCourses([]);
      setPage(1);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadData(debouncedSearch, filterMaGV);
      setLoading(false);
    })();
  }, [debouncedSearch, filterMaGV, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(debouncedSearch, filterMaGV, true);
    setRefreshing(false);
  }, [debouncedSearch, filterMaGV, loadData]);

  const clearInstructorFilter = () => {
    setFilterMaGV(null);
    setFilterTenGV('');
    setPage(1);
  };

  const pagedCourses = useMemo(() => paginateCourses(courses, page), [courses, page]);

  const changePage = (next: number) => {
    const max = totalCoursePages(courses.length);
    setPage(Math.min(Math.max(1, next), max));
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.listContent}>
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </View>
      );
    }
    if (error) {
      return <ErrorState message={error} onRetry={() => void onRefresh()} />;
    }
    return (
      <FlatList
        data={pagedCourses}
        keyExtractor={(item) => String(item.maKhoaHoc)}
        numColumns={2}
        columnWrapperStyle={styles.courseRow}
        renderItem={({ item }) => (
          <View style={styles.courseCol}>
            <CourseCard course={item} onPress={(id) => router.push(`/course/${id}`)} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListFooterComponent={
          <CoursePagination page={page} totalItems={courses.length} onChange={changePage} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Không có danh mục khóa học bạn cần tìm"
            message={
              debouncedSearch || filterMaGV
                ? 'Thử từ khóa khác hoặc bấm "Xem tất cả" để xem toàn bộ khóa học.'
                : 'Hiện chưa có khóa học nào. Vui lòng quay lại sau.'
            }
            actionLabel={debouncedSearch || filterMaGV ? 'Xem tất cả' : undefined}
            onAction={
              debouncedSearch || filterMaGV
                ? () => {
                    setSearchTerm('');
                    clearInstructorFilter();
                  }
                : undefined
            }
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Khám phá</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn học gì? (VD: Java, Python...)"
            placeholderTextColor={colors.textMuted}
            value={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text);
              setPage(1);
            }}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchTerm.length > 0 && (
            <AnimatedPressable
              style={styles.clearBtn}
              onPress={() => {
                setSearchTerm('');
                setPage(1);
              }}
              accessibilityLabel="Xóa tìm kiếm"
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </AnimatedPressable>
          )}
        </View>
        {filterMaGV != null && (
          <AnimatedPressable
            style={styles.filterChip}
            onPress={clearInstructorFilter}
            accessibilityLabel="Xóa bộ lọc giảng viên"
          >
            <Ionicons name="easel-outline" size={14} color={colors.primaryDark} />
            <Text style={styles.filterChipText} numberOfLines={1}>
              GV: {filterTenGV || `#${filterMaGV}`}
            </Text>
            <Ionicons name="close-circle" size={16} color={colors.primaryDark} />
          </AnimatedPressable>
        )}
      </View>
      {renderBody()}
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
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.titleLg,
    fontWeight: '800',
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clearBtn: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(246, 144, 80, 0.35)',
    maxWidth: '100%',
  },
  filterChipText: {
    flexShrink: 1,
    fontSize: fontSize.caption,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  courseRow: {
    justifyContent: 'space-between',
  },
  courseCol: {
    width: '48.5%',
  },
});
