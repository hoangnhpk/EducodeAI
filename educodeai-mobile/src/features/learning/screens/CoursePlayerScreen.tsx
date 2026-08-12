import { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../auth/context/AuthContext';
import { CourseLearningService, calculateProgress, flattenLessons, getNextLesson, getPreviousLesson } from '../services/course-learning.service';
import type { CourseContent, Lesson } from '../types/learning.types';
import { LessonTools } from '../components/LessonTools';
import { QuizPanel } from '../components/QuizPanel';
import { ReviewPanel } from '../components/ReviewPanel';
import { VideoLesson } from '../components/VideoLesson';
import { VideoSummaryPanel } from '../components/VideoSummaryPanel';

export default function CoursePlayerScreen() {
  const router = useRouter();
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId?: string }>();
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const [course, setCourse] = useState<CourseContent | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLessons, setShowLessons] = useState(false);

  const lessons = useMemo(() => (course ? flattenLessons(course.danhSachChuongHoc) : []), [course]);
  const progress = useMemo(() => calculateProgress(lessons), [lessons]);

  const loadCourse = async () => {
    const id = Number(courseId);
    if (!Number.isInteger(id) || id <= 0) {
      setError('Khóa học không hợp lệ.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await CourseLearningService.getCourseContent(id);
      setCourse(data);
      const requested = lessonId ? Number(lessonId) : undefined;
      const dataLessons = flattenLessons(data.danhSachChuongHoc);
      const selected = (requested && dataLessons.find((lesson) => lesson.id === requested)) ||
        dataLessons.find((lesson) => !lesson.biKhoa) ||
        dataLessons[0];
      setCurrentLesson(selected ?? null);
    } catch {
      setError('Không thể tải nội dung khóa học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login' as never);
  }, [authLoading, router, user]);

  useEffect(() => { void loadCourse(); }, [courseId, lessonId]);

  const selectLesson = (lesson: Lesson) => {
    if (lesson.biKhoa) return;
    setCurrentLesson(lesson);
    setShowLessons(false);
  };

  const markLessonViewed = async () => {
    if (!currentLesson || !user?.maNguoiDung) return;
    await CourseLearningService.saveProgress({
      MaBaiHoc: currentLesson.id,
      MaNguoiDung: user.maNguoiDung,
      DaXem: true,
      ThoiGianHoc: currentLesson.thoiLuong || 0,
    });
    setCourse((value) => value ? {
      ...value,
      danhSachChuongHoc: value.danhSachChuongHoc.map((chapter) => ({
        ...chapter,
        danhSachBaiHoc: chapter.danhSachBaiHoc.map((lesson) => lesson.id === currentLesson.id ? { ...lesson, daXem: true } : lesson),
      })),
    } : value);
  };

  const moveLesson = (direction: 'next' | 'previous') => {
    if (!currentLesson) return;
    const target = direction === 'next' ? getNextLesson(lessons, currentLesson.id) : getPreviousLesson(lessons, currentLesson.id);
    if (target && !target.biKhoa) setCurrentLesson(target);
  };

  if (authLoading || !user) return <CenteredState text="Đang kiểm tra phiên đăng nhập..." loading />;
  if (loading) return <CenteredState text="Đang tải nội dung khóa học..." loading />;
  if (error) return <CenteredState text={error} action="Thử lại" onAction={() => void loadCourse()} />;
  if (!course || !currentLesson) return <CenteredState text="Khóa học chưa có nội dung." />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Quay lại" style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <View style={styles.headerText}>
          <Text numberOfLines={1} style={styles.courseTitle}>{course.tenKhoaHoc}</Text>
          <Text style={styles.progressText}>Tiến độ {progress}%</Text>
        </View>
        <Pressable accessibilityLabel="Mở danh sách bài học" style={styles.iconButton} onPress={() => setShowLessons((value) => !value)}>
          <Ionicons name="list-outline" size={22} color="#111827" />
        </Pressable>
      </View>

      {showLessons && <LessonList course={course} currentId={currentLesson.id} onSelect={selectLesson} />}

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lessonType}>{currentLesson.loaiBaiHoc}</Text>
        <Text style={styles.lessonTitle}>{currentLesson.tieuDe}</Text>
        {currentLesson.biKhoa ? <Text style={styles.locked}>Bài học này đang bị khóa.</Text> : <><LessonContent lesson={currentLesson} userId={user?.maNguoiDung} onComplete={() => void markLessonViewed()} /><LessonTools lesson={currentLesson} /><ReviewPanel courseId={course.maKhoaHoc} userId={user?.maNguoiDung} /></>}
        <View style={styles.navigation}>
          <Pressable style={[styles.navButton, !getPreviousLesson(lessons, currentLesson.id) && styles.disabled]} disabled={!getPreviousLesson(lessons, currentLesson.id)} onPress={() => moveLesson('previous')}>
            <Ionicons name="arrow-back" size={18} color="#f69050" /><Text style={styles.navText}>Bài trước</Text>
          </Pressable>
          <Pressable style={[styles.navButton, !getNextLesson(lessons, currentLesson.id) && styles.disabled]} disabled={!getNextLesson(lessons, currentLesson.id)} onPress={() => moveLesson('next')}>
            <Text style={styles.navText}>Bài tiếp</Text><Ionicons name="arrow-forward" size={18} color="#f69050" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonList({ course, currentId, onSelect }: { course: CourseContent; currentId: number; onSelect: (lesson: Lesson) => void }) {
  return <View style={styles.lessonList}>{course.danhSachChuongHoc.map((chapter) => <View key={chapter.id}><Text style={styles.chapterTitle}>{chapter.tieuDe}</Text>{chapter.danhSachBaiHoc.map((lesson) => <Pressable key={lesson.id} style={[styles.lessonRow, lesson.id === currentId && styles.selected]} onPress={() => onSelect(lesson)}><Ionicons name={lesson.biKhoa ? 'lock-closed-outline' : lesson.daXem ? 'checkmark-circle-outline' : 'play-circle-outline'} size={18} color={lesson.biKhoa ? '#9ca3af' : '#f69050'} /><Text numberOfLines={1} style={styles.lessonRowText}>{lesson.tieuDe}</Text></Pressable>)}</View>)}</View>;
}

function LessonContent({ lesson, userId, onComplete }: { lesson: Lesson; userId?: number; onComplete: () => void }) {
  if (lesson.loaiBaiHoc === 'Ide') return <View style={styles.lockedCard}><Ionicons name="desktop-outline" size={28} color="#6b7280" /><Text style={styles.locked}>Bài thực hành chỉ được hỗ trợ trên phiên bản máy tính.</Text></View>;
  if (lesson.loaiBaiHoc === 'Video') return <><VideoLesson lesson={lesson} onComplete={onComplete} /><VideoSummaryPanel lessonId={lesson.id} /></>;
  if (lesson.loaiBaiHoc === 'Quiz') return <QuizPanel lesson={lesson} userId={userId} />;
  return <View style={styles.theoryCard}><Text style={styles.theory}>{lesson.noiDung || 'Bài học chưa có nội dung.'}</Text></View>;
}

function CenteredState({ text, loading, action, onAction }: { text: string; loading?: boolean; action?: string; onAction?: () => void }) { return <SafeAreaView style={styles.center}><>{loading && <ActivityIndicator size="large" color="#f69050" />}<Text style={styles.stateText}>{text}</Text>{action && <Pressable style={styles.retry} onPress={onAction}><Text style={styles.retryText}>{action}</Text></Pressable>}</></SafeAreaView>; }

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: '#f9fafb' }, header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, headerText: { flex: 1, marginHorizontal: 8 }, courseTitle: { color: '#111827', fontSize: 16, fontWeight: '700' }, progressText: { color: '#6b7280', fontSize: 12, marginTop: 2 }, content: { padding: 20, paddingBottom: 40 }, lessonType: { color: '#f69050', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }, lessonTitle: { color: '#111827', fontSize: 24, fontWeight: '800', marginTop: 8, marginBottom: 20 }, mediaCard: { minHeight: 220, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb' }, mediaText: { color: '#111827', fontSize: 18, fontWeight: '700', marginTop: 12 }, muted: { color: '#6b7280', textAlign: 'center', marginTop: 8 }, theoryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb' }, theory: { color: '#111827', fontSize: 16, lineHeight: 26 }, completeButton: { marginTop: 18, minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#f69050' }, completeText: { color: '#fff', fontWeight: '700' }, lockedCard: { alignItems: 'center', padding: 28, backgroundColor: '#f3f4f6', borderRadius: 16 }, locked: { color: '#6b7280', textAlign: 'center', marginTop: 10 }, navigation: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }, navButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#fef3ec' }, navText: { color: '#d97706', fontWeight: '700' }, disabled: { opacity: 0.4 }, lessonList: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }, chapterTitle: { color: '#111827', fontWeight: '800', paddingVertical: 8 }, lessonRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, borderRadius: 8 }, selected: { backgroundColor: '#fef3ec' }, lessonRowText: { flex: 1, color: '#374151' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f9fafb' }, stateText: { color: '#374151', textAlign: 'center', marginTop: 12 }, retry: { marginTop: 16, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center', borderRadius: 10, backgroundColor: '#f69050' }, retryText: { color: '#fff', fontWeight: '700' } });
