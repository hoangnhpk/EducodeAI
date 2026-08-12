import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, radius, shadow, spacing } from '../../../shared/theme/tokens';
import { DiscoveryHomeService } from '../services/discovery-home.service';
import { MyCoursesService } from '../services/my-courses.service';
import type {
  CourseListItemDTO,
  HomeInstructorDTO,
  HomeReviewDTO,
  MyCourseDTO,
} from '../types';
import { CourseCard } from '../components/course-card';
import { CourseCardSkeleton, EmptyState, ErrorState } from '../components/state-views';
import { FALLBACK_COURSE_IMAGE, resolveCourseImage } from '../services/media-url';
import { datBoLocKhoaHoc } from '../services/course-filter-bus';

// ===== Dữ liệu tĩnh port từ web TrangChu.tsx (stats, features, categories) =====

const STATS = [
  { icon: 'school-outline', value: '10K+', label: 'Học viên tin tưởng' },
  { icon: 'book-outline', value: '150+', label: 'Khóa học chất lượng' },
  { icon: 'easel-outline', value: '50+', label: 'Chuyên gia giảng dạy' },
  { icon: 'star-outline', value: '4.8/5', label: 'Đánh giá trung bình' },
] as const;

const AI_FEATURES = [
  {
    mciIcon: 'map-marker-path' as const,
    tint: colors.primary,
    soft: colors.primarySoft,
    title: 'AI Sinh Lộ Trình',
    desc: 'Phân tích kỹ năng hiện tại và tạo lộ trình học cá nhân hóa 100% cho bạn.',
  },
  {
    mciIcon: 'laptop' as const,
    tint: colors.warning,
    soft: '#FEF3C7',
    title: 'AI Sinh Đồ Án',
    desc: 'Tự động thiết kế yêu cầu, CSDL và API cho đồ án thực chiến khớp trình độ.',
  },
  {
    mciIcon: 'account-tie' as const,
    tint: colors.success,
    soft: '#D1FAE5',
    title: 'Phỏng Vấn Giả Lập',
    desc: 'Luyện tập với Tech Lead AI, trả lời bằng giọng nói và nhận review ngay.',
  },
];

/**
 * Chip chủ đề sinh động từ `linhVuc` thật của danh sách khóa học (thay vì
 * hard-code 8 chủ đề như web — dữ liệu không có sẽ lọc ra rỗng, trông như lỗi).
 * Backend lọc `search` theo TenKhoaHoc/LinhVuc nên bấm chip chắc chắn có kết quả.
 */
type CategoryChip = {
  name: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  tint: string;
  soft: string;
};

const CATEGORY_COLORS: { tint: string; soft: string }[] = [
  { tint: '#3B82F6', soft: '#EFF6FF' },
  { tint: '#F59E0B', soft: '#FEF3C7' },
  { tint: '#EF4444', soft: '#FEE2E2' },
  { tint: '#0EA5E9', soft: '#E0F2FE' },
  { tint: '#10B981', soft: '#D1FAE5' },
  { tint: '#8B5CF6', soft: '#F3EFFE' },
];

const chonIconLinhVuc = (
  linhVuc: string,
): React.ComponentProps<typeof MaterialCommunityIcons>['name'] => {
  const v = linhVuc.toLowerCase();
  if (v.includes('design') || v.includes('ui')) return 'pencil-ruler';
  if (v.includes('web')) return 'web';
  if (v.includes('data') || v.includes('sql')) return 'database-outline';
  if (v.includes('ai') || v.includes('trí tuệ')) return 'robot-outline';
  if (v.includes('hệ thống') || v.includes('system')) return 'chip';
  if (v.includes('công nghệ') || v.includes('it')) return 'laptop';
  return 'code-braces';
};

const taoCategoryChips = (courses: CourseListItemDTO[]): CategoryChip[] => {
  const seen = new Set<string>();
  const chips: CategoryChip[] = [];
  for (const c of courses) {
    const linhVuc = c.linhVuc?.trim();
    if (!linhVuc || seen.has(linhVuc.toLowerCase())) continue;
    seen.add(linhVuc.toLowerCase());
    const color = CATEGORY_COLORS[chips.length % CATEGORY_COLORS.length];
    chips.push({ name: linhVuc, icon: chonIconLinhVuc(linhVuc), ...color });
  }
  return chips;
};

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
const INSTRUCTOR_COLORS = ['#0D8ABC', '#fb873f', '#22c55e', '#a855f7'];

const layChuCaiDau = (hoTen: string) =>
  hoTen
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(-2)
    .toUpperCase();

const laAnhHopLe = (src?: string) => !!src && !src.includes('default') && src.startsWith('http');

// ===== Sub-components =====

/**
 * Hàng tự cuộn ngang (marquee) dựa trên ScrollView thật thay vì transform:
 * transform + native driver làm hit-test lệch vị trí → chip lúc bấm được lúc không.
 * ScrollView tự cuộn giữ vị trí bấm luôn chuẩn, user vẫn vuốt tay được.
 * `reverse` đảo chiều chạy; `speed` px/giây.
 */
const MarqueeRow = ({
  children,
  reverse = false,
  speed = 30,
}: {
  children: React.ReactNode;
  reverse?: boolean;
  speed?: number;
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const offsetRef = useRef(0);
  const contentWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const [soBanSao, setSoBanSao] = useState(2);

  useEffect(() => {
    const TICK_MS = 33;
    const delta = (speed * TICK_MS) / 1000;
    const interval = setInterval(() => {
      const w = contentWidthRef.current;
      if (!w || pausedRef.current) return;
      let next = offsetRef.current + (reverse ? -delta : delta);
      if (next >= w) next -= w;
      if (next < 0) next += w;
      offsetRef.current = next;
      scrollRef.current?.scrollTo({ x: next, animated: false });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [reverse, speed]);

  const doLayoutBanDau = (width: number) => {
    contentWidthRef.current = width;
    if (width > 0) {
      const screenWidth = Dimensions.get('window').width;
      // Nhân đủ bản sao để phủ kín màn hình kể cả khi nội dung hẹp (ít chip).
      setSoBanSao(Math.max(2, Math.ceil((screenWidth + width) / width) + 1));
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.marqueeClip}
      scrollEventThrottle={16}
      onScrollBeginDrag={() => {
        pausedRef.current = true;
      }}
      onScrollEndDrag={(e) => {
        const w = contentWidthRef.current || 1;
        offsetRef.current = ((e.nativeEvent.contentOffset.x % w) + w) % w;
        pausedRef.current = false;
      }}
    >
      {Array.from({ length: soBanSao }).map((_, i) => (
        <View
          key={i}
          style={styles.marqueeContent}
          onLayout={i === 0 ? (e) => doLayoutBanDau(Math.round(e.nativeEvent.layout.width)) : undefined}
        >
          {children}
        </View>
      ))}
    </ScrollView>
  );
};

/** Tiêu đề section: eyebrow pill cam + title — theo section-eyebrow của web. */
const SectionHeading = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <View style={styles.sectionHeading}>
    <View style={styles.eyebrowPill}>
      <View style={styles.eyebrowDot} />
      <Text style={styles.eyebrowText}>{eyebrow}</Text>
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

/** Card ngang "học tiếp" cho khóa đang học dở (mobile-specific, giữ nguyên). */
const ContinueCard = ({ course, onPress }: { course: MyCourseDTO; onPress: () => void }) => {
  const [imageError, setImageError] = useState(false);
  const pct = Math.min(100, Math.max(0, course.tienDo));
  return (
    <AnimatedPressable style={styles.continueCard} onPress={onPress}>
      <Image
        source={{
          uri: imageError
            ? FALLBACK_COURSE_IMAGE
            : resolveCourseImage(course.hinhAnh) || FALLBACK_COURSE_IMAGE,
        }}
        style={styles.continueThumb}
        contentFit="cover"
        onError={() => setImageError(true)}
      />
      <View style={styles.continueBody}>
        <Text style={styles.continueTitle} numberOfLines={2}>
          {course.tenKhoaHoc}
        </Text>
        <Text style={styles.continueMeta} numberOfLines={1}>
          {course.linhVuc} · {course.thoiLuongGio} giờ
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressText}>Tiến độ {pct}%</Text>
      </View>
      <Ionicons name="play-circle" size={28} color={colors.primary} />
    </AnimatedPressable>
  );
};

/** Card giảng viên tiêu biểu — port instructor-card của web. */
const InstructorCard = ({
  gv,
  index,
  onViewCourses,
}: {
  gv: HomeInstructorDTO;
  index: number;
  onViewCourses: () => void;
}) => {
  const hoTen = gv.hoTen || 'Ẩn danh';
  const bgColor = INSTRUCTOR_COLORS[index % INSTRUCTOR_COLORS.length];
  return (
    <View style={styles.instructorCard}>
      <View style={styles.instructorRating}>
        <Ionicons name="star" size={11} color="#92400E" />
        <Text style={styles.instructorRatingText}>
          {gv.diemTrungBinh ? gv.diemTrungBinh.toFixed(1) : '5.0'}
        </Text>
      </View>
      {laAnhHopLe(gv.anhDaiDien) ? (
        <Image source={{ uri: gv.anhDaiDien }} style={styles.instructorAvatar} contentFit="cover" />
      ) : (
        <View style={[styles.instructorAvatar, styles.avatarFallback, { backgroundColor: bgColor }]}>
          <Text style={styles.instructorInitials}>{layChuCaiDau(hoTen)}</Text>
        </View>
      )}
      <Text style={styles.instructorName} numberOfLines={1}>
        {hoTen}
      </Text>
      {!!gv.chuyenMon && (
        <Text style={styles.instructorField} numberOfLines={1}>
          {gv.chuyenMon}
        </Text>
      )}
      <Text style={styles.instructorCount}>{gv.tongKhoaHoc ?? 0} khóa học xuất bản</Text>
      <AnimatedPressable style={styles.instructorBtn} onPress={onViewCourses}>
        <Ionicons name="search" size={13} color={colors.primary} />
        <Text style={styles.instructorBtnText}>Xem khóa học</Text>
      </AnimatedPressable>
    </View>
  );
};

/** Card đánh giá học viên — port review-card của web. */
const ReviewCard = ({ review, index }: { review: HomeReviewDTO; index: number }) => {
  const hoTen = review.nguoiDung?.hoTen || 'Ẩn danh';
  const bgColor = AVATAR_COLORS[(review.maDanhGia || index) % AVATAR_COLORS.length];
  const avatarSrc = review.nguoiDung?.anhDaiDien;
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewStars}>
        {Array.from({ length: 5 }).map((_, s) => (
          <Ionicons
            key={s}
            name="star"
            size={14}
            color={s < review.soSao ? '#fbbf24' : colors.border}
          />
        ))}
      </View>
      <Text style={styles.reviewContent}>{`\u201C${review.nhanXet}\u201D`}</Text>
      <View style={styles.reviewCourseBox}>
        <View style={styles.reviewCourseRow}>
          <Ionicons name="book-outline" size={12} color="#3b82f6" />
          <Text style={styles.reviewCourseName} numberOfLines={1}>
            {review.khoaHoc?.tenKhoaHoc || 'Khóa học'}
          </Text>
        </View>
        <View style={styles.reviewCourseRow}>
          <Ionicons name="easel-outline" size={12} color={colors.aiAccent} />
          <Text style={styles.reviewTeacher} numberOfLines={1}>
            GV: {review.khoaHoc?.giangVien || 'Chưa rõ'}
          </Text>
        </View>
      </View>
      <View style={styles.reviewUserRow}>
        {laAnhHopLe(avatarSrc) ? (
          <Image source={{ uri: avatarSrc }} style={styles.reviewAvatar} contentFit="cover" />
        ) : (
          <View style={[styles.reviewAvatar, styles.avatarFallback, { backgroundColor: bgColor }]}>
            <Text style={styles.reviewInitials}>{layChuCaiDau(hoTen)}</Text>
          </View>
        )}
        <View>
          <Text style={styles.reviewUserName}>{hoTen}</Text>
          <Text style={styles.reviewUserRole}>Học viên EduCode</Text>
        </View>
      </View>
    </View>
  );
};

// ===== Screen =====

export default function HomeScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseListItemDTO[]>([]);
  const [myCourses, setMyCourses] = useState<MyCourseDTO[]>([]);
  const [reviews, setReviews] = useState<HomeReviewDTO[]>([]);
  const [instructors, setInstructors] = useState<HomeInstructorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [allCourses, mine, danhGia, giangVien] = await Promise.all([
        DiscoveryHomeService.layDanhSachKhoaHoc(),
        // Chưa đăng nhập / lỗi phiên → ẩn khối "học tiếp", không chặn Home.
        MyCoursesService.layDanhSach().catch(() => [] as MyCourseDTO[]),
        // Reviews/instructors lỗi cũng không chặn Home (giống web chỉ console.error).
        DiscoveryHomeService.layDanhGiaTrangChu(10).catch(() => [] as HomeReviewDTO[]),
        DiscoveryHomeService.layGiangVienTieuBieu(4).catch(() => [] as HomeInstructorDTO[]),
      ]);
      setCourses(allCourses);
      setMyCourses(mine.filter((c) => c.tienDo < 100));
      setReviews(danhGia);
      setInstructors(giangVien);
    } catch {
      setError('Không thể kết nối máy chủ. Kiểm tra mạng và thử lại.');
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

  // Web hiển thị 3 đánh giá ngẫu nhiên — mobile shuffle 1 lần mỗi lượt tải.
  const displayedReviews = useMemo(
    () => [...reviews].sort(() => Math.random() - 0.5).slice(0, 3),
    [reviews],
  );

  // Chip chủ đề từ lĩnh vực thật của khóa học, chia 2 hàng marquee.
  const categoryChips = useMemo(() => taoCategoryChips(courses), [courses]);
  const categoryRows = useMemo(() => {
    const mid = Math.ceil(categoryChips.length / 2);
    return [categoryChips.slice(0, mid), categoryChips.slice(mid)].filter((r) => r.length > 0);
  }, [categoryChips]);

  const goDetail = (maKhoaHoc: number) => router.push(`/course/${maKhoaHoc}`);
  const goCourses = (filter?: { search?: string; maGiangVien?: number; tenGiangVien?: string }) => {
    // Ghi bộ lọc vào bus (params của Tabs không tin cậy) rồi chuyển tab.
    datBoLocKhoaHoc(filter ?? {});
    router.navigate('/courses');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.header}>
            <Text style={styles.brand}>EduCodeAI</Text>
            <Text style={styles.headerSub}>Hôm nay bạn muốn học gì?</Text>
          </View>
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState message={error} onRetry={() => void onRefresh()} />
      </SafeAreaView>
    );
  }

  const ListHeader = (
    <View>
      <View style={styles.header}>
        <Text style={styles.brand}>EduCodeAI</Text>
        <Text style={styles.headerSub}>Hôm nay bạn muốn học gì?</Text>
      </View>

      {/* 1. Hero — port hero-section của web (nền tối + badge + CTA) */}
      <LinearGradient
        colors={['#0B1120', '#111827', '#1F2937']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>KHỞI ĐẦU TƯƠNG LAI</Text>
        </View>
        <Text style={styles.heroTitle}>
          Học Lập Trình{'\n'}
          <Text style={styles.heroTitleAccent}>Dễ Dàng & Hiệu Quả</Text>
        </Text>
        <Text style={styles.heroSub}>
          Nền tảng e-learning thông minh với lộ trình bài bản, đồ án thực chiến và phòng phỏng vấn
          ảo được hỗ trợ 100% bởi Trí tuệ nhân tạo.
        </Text>
        <AnimatedPressable style={styles.heroCta} onPress={() => goCourses()}>
          <Text style={styles.heroCtaText}>Khám phá khóa học</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </AnimatedPressable>
      </LinearGradient>

      {/* 2. Stats — strip nổi đè lên đáy hero như web */}
      <View style={styles.statsCard}>
        {STATS.map((s) => (
          <View key={s.label} style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name={s.icon} size={18} color={colors.primaryDark} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Học tiếp (mobile-specific — chỉ hiện khi đã đăng nhập và có khóa dở) */}
      {myCourses.length > 0 && (
        <View style={styles.section}>
          <SectionHeading eyebrow="Tiếp tục" title="Học tiếp" />
          {myCourses.slice(0, 3).map((c) => (
            <ContinueCard key={c.maDangKy} course={c} onPress={() => goDetail(c.maKhoaHoc)} />
          ))}
        </View>
      )}

      {/* 3. Hệ sinh thái AI — port features-section (route AI thuộc module Lai, sẽ gắn sau) */}
      <View style={styles.section}>
        <SectionHeading eyebrow="Tại sao chọn EduCode?" title="Hệ sinh thái Trí Tuệ Nhân Tạo" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {AI_FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: f.soft }]}>
                <MaterialCommunityIcons name={f.mciIcon} size={22} color={f.tint} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 4. Categories — chip theo lĩnh vực thật của khóa học, bấm → tab Khám phá.
          2 hàng marquee tự chạy ngược chiều nhau như dải logo thương hiệu. */}
      {categoryRows.length > 0 && (
        <View style={styles.section}>
          <SectionHeading eyebrow="Danh mục" title="Chủ đề phổ biến" />
          <View style={styles.categoryColumns}>
            {categoryRows.map((row, rowIndex) => (
              <MarqueeRow key={rowIndex} reverse={rowIndex === 1}>
                {row.map((cat) => (
                  <AnimatedPressable
                    key={cat.name}
                    style={styles.categoryChip}
                    onPress={() => goCourses({ search: cat.name })}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: cat.soft }]}>
                      <MaterialCommunityIcons name={cat.icon} size={20} color={cat.tint} />
                    </View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </AnimatedPressable>
                ))}
              </MarqueeRow>
            ))}
          </View>
        </View>
      )}

      {/* 5. Courses */}
      <SectionHeading eyebrow="Hành trình tri thức" title="Khám Phá Các Khóa Học" />
    </View>
  );

  const ListFooter = (
    <View>
      {/* 6. Giảng viên tiêu biểu — dữ liệu thật từ API như web */}
      <View style={styles.section}>
        <SectionHeading eyebrow="Đội ngũ chuyên gia" title="Giảng viên tiêu biểu" />
        {instructors.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {instructors.map((gv, index) => (
              <InstructorCard
                key={gv.maGiangVien || index}
                gv={gv}
                index={index}
                onViewCourses={() =>
                  goCourses({ maGiangVien: gv.maGiangVien, tenGiangVien: gv.hoTen })
                }
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptySectionText}>Chưa có giảng viên tiêu biểu.</Text>
        )}
      </View>

      {/* 7. Reviews — dữ liệu thật từ API như web */}
      <View style={styles.section}>
        <SectionHeading eyebrow="Đánh giá thực tế" title="Học viên nói gì về EduCode?" />
        {displayedReviews.length > 0 ? (
          displayedReviews.map((review, i) => (
            <ReviewCard key={`review-${review.maDanhGia}-${i}`} review={review} index={i} />
          ))
        ) : (
          <Text style={styles.emptySectionText}>Chưa có đánh giá nào. Hãy là người đầu tiên!</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={courses}
        keyExtractor={(item) => String(item.maKhoaHoc)}
        numColumns={2}
        columnWrapperStyle={styles.courseRow}
        renderItem={({ item }) => (
          <View style={styles.courseCol}>
            <CourseCard course={item} onPress={goDetail} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="Chưa có khóa học nào"
            message="Hiện chưa có khóa học. Vui lòng quay lại sau."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  brand: {
    fontSize: fontSize.titleLg,
    fontWeight: '800',
    color: colors.primary,
  },
  headerSub: {
    marginTop: 2,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  courseRow: {
    justifyContent: 'space-between',
  },
  courseCol: {
    width: '48.5%',
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionHeading: {
    marginBottom: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(246, 144, 80, 0.25)',
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primaryDark,
  },
  sectionTitle: {
    fontSize: fontSize.subtitle,
    fontWeight: '700',
    color: colors.text,
  },
  emptySectionText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },

  // Hero
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + spacing.xl,
    overflow: 'hidden',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(246, 144, 80, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246, 144, 80, 0.35)',
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.primary,
  },
  heroTitle: {
    fontSize: fontSize.display,
    lineHeight: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.md,
  },
  heroTitleAccent: {
    color: colors.primary,
  },
  heroSub: {
    fontSize: fontSize.body,
    lineHeight: 21,
    color: 'rgba(243, 244, 246, 0.75)',
    marginBottom: spacing.xl,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    minHeight: 48,
    paddingHorizontal: spacing.xxl,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  heroCtaText: {
    fontSize: fontSize.bodyLg,
    fontWeight: '700',
    color: '#fff',
  },

  // Stats — nổi đè lên đáy hero như web
  statsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    marginTop: -spacing.xxxl,
    marginHorizontal: spacing.sm,
    ...shadow.card,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  statValue: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },

  // Học tiếp
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  continueThumb: {
    width: 84,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  continueBody: {
    flex: 1,
    gap: 3,
  },
  continueTitle: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  continueMeta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 11,
    color: colors.textMuted,
  },

  // Hệ sinh thái AI
  hScroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  featureCard: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  featureTitle: {
    fontSize: fontSize.bodyLg,
    fontWeight: '700',
    color: colors.text,
  },
  featureDesc: {
    fontSize: fontSize.caption,
    lineHeight: 18,
    color: colors.textMuted,
  },

  // Categories — 2 hàng marquee tự chạy
  categoryColumns: {
    gap: spacing.md,
  },
  marqueeClip: {
    // Bleed ra sát mép màn hình để chip chạy hết chiều ngang.
    marginHorizontal: -spacing.lg,
  },
  marqueeContent: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.md,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs + 2,
    paddingLeft: spacing.xs + 2,
    paddingRight: spacing.lg,
    ...shadow.card,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },

  // Giảng viên tiêu biểu
  instructorCard: {
    width: 190,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 3,
    ...shadow.card,
  },
  instructorRating: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FDE68A',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  instructorRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  instructorAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorInitials: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  instructorName: {
    fontSize: fontSize.bodyLg,
    fontWeight: '700',
    color: colors.text,
  },
  instructorField: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  instructorCount: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  instructorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  instructorBtnText: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    color: colors.primary,
  },

  // Reviews
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 3,
  },
  reviewContent: {
    fontSize: fontSize.body,
    lineHeight: 22,
    fontStyle: 'italic',
    color: '#4b5563',
  },
  reviewCourseBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 4,
  },
  reviewCourseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewCourseName: {
    flex: 1,
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: '#1e40af',
  },
  reviewTeacher: {
    flex: 1,
    fontSize: fontSize.caption,
    color: '#5b21b6',
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  reviewInitials: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: '#fff',
  },
  reviewUserName: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  reviewUserRole: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
});
