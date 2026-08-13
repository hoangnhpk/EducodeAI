import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHtml from 'react-native-render-html';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/hooks/use-auth';
import { CourseLearningService, calculateProgress, flattenLessons, getNextLesson, getPreviousLesson } from '../services/course-learning.service';
import type { CourseContent, Lesson } from '../types/learning.types';
import { LessonTools } from '../components/LessonTools';
import { QuizPanel } from '../components/QuizPanel';
import { ReviewPanel } from '../components/ReviewPanel';
import { VideoLesson } from '../components/VideoLesson';
import { VideoSummaryPanel } from '../components/VideoSummaryPanel';

const C = { primary: '#f69050', dark: '#111827', muted: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', white: '#fff', green: '#059669' };

export default function CoursePlayerScreen() {
  const router = useRouter();
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId?: string }>();
  const { session, status: authStatus } = useAuth();
  const user = session?.user;
  const authLoading = authStatus === 'bootstrapping';
  const [course, setCourse] = useState<CourseContent | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLessons, setShowLessons] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const handleTimeUpdate = (seconds: number) => setVideoTime(seconds);

  const lessons = useMemo(() => (course ? flattenLessons(course.danhSachChuongHoc) : []), [course]);
  const progress = useMemo(() => calculateProgress(lessons), [lessons]);
  const previous = currentLesson ? getPreviousLesson(lessons, currentLesson.id) : undefined;
  const next = currentLesson ? getNextLesson(lessons, currentLesson.id) : undefined;

  const loadCourse = async () => {
    const id = Number(courseId);
    if (!Number.isInteger(id) || id <= 0) { setError('Khóa học không hợp lệ.'); setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const data = await CourseLearningService.getCourseContent(id);
      const dataLessons = flattenLessons(data.danhSachChuongHoc);
      const requested = lessonId ? Number(lessonId) : undefined;
      setCourse(data);
      setCurrentLesson((requested && dataLessons.find((lesson) => lesson.id === requested)) || dataLessons.find((lesson) => !lesson.biKhoa) || dataLessons[0] || null);
    } catch (requestError: any) {
      const status = requestError?.response?.status;
      const message = requestError?.response?.data?.message;
      setError(message ? `${message}${status ? ` (${status})` : ''}` : status ? `Không thể tải nội dung khóa học (${status}).` : 'Không thể kết nối tới Backend. Kiểm tra IP và port API.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (!authLoading && !user) router.replace(`/auth/login?courseId=${courseId}` as never); }, [authLoading, router, user, courseId]);
  useEffect(() => { void loadCourse(); }, [courseId, lessonId]);

  const selectLesson = (lesson: Lesson) => { const index = lessons.findIndex((item) => item.id === lesson.id); const prerequisite = index > 0 ? lessons[index - 1] : undefined; if (lesson.biKhoa || (prerequisite && !prerequisite.daXem && !lesson.daXem)) return; setCurrentLesson(lesson); setShowLessons(false); setShowTools(false); };
  const markLessonViewed = async () => {
    if (!currentLesson || !user?.maNguoiDung) return;
    const completedLessonId = currentLesson.id;
    const saved = await CourseLearningService.saveProgress({ MaBaiHoc: completedLessonId, MaNguoiDung: user.maNguoiDung, DaXem: true, ThoiGianHoc: currentLesson.thoiLuong || 0 });
    if (!saved) return;
    setCurrentLesson((value) => value && value.id === completedLessonId ? { ...value, daXem: true } : value);
    setCourse((value) => value ? { ...value, danhSachChuongHoc: value.danhSachChuongHoc.map((chapter) => ({ ...chapter, danhSachBaiHoc: chapter.danhSachBaiHoc.map((lesson) => lesson.id === completedLessonId ? { ...lesson, daXem: true } : lesson) })) } : value);
  };
  const moveLesson = (target?: Lesson) => { if (target && !target.biKhoa && (target.daXem || !currentLesson || target.id < currentLesson.id)) { setCurrentLesson(target); setShowTools(false); } };

  if (authLoading || !user) return <CenteredState text="Đang kiểm tra phiên đăng nhập..." loading />;
  if (loading) return <CenteredState text="Đang tải nội dung khóa học..." loading />;
  if (error) return <CenteredState text={error} action="Thử lại" onAction={() => void loadCourse()} />;
  if (!course || !currentLesson) return <CenteredState text="Khóa học chưa có nội dung." />;

  return <SafeAreaView style={styles.safeArea}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="Quay lại" style={styles.iconButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={C.dark} /></Pressable>
      <View style={styles.headerText}><Text numberOfLines={1} style={styles.courseTitle}>{course.tenKhoaHoc}</Text><View style={styles.progressLine}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><Text style={styles.progressText}>{progress}% hoàn thành</Text></View>
      <Pressable accessibilityLabel="Mở danh sách bài học" style={styles.iconButton} onPress={() => setShowLessons(true)}><Ionicons name="list-outline" size={22} color={C.dark} /></Pressable>
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.lessonHeading}><Text style={styles.lessonType}>{currentLesson.loaiBaiHoc === 'Text' ? 'LÝ THUYẾT' : currentLesson.loaiBaiHoc.toUpperCase()}</Text><Text style={styles.lessonTitle}>{currentLesson.tieuDe}</Text><Text style={styles.lessonMeta}>{currentLesson.daXem ? 'Đã hoàn thành' : 'Bài học hiện tại'} · {formatDuration(currentLesson.thoiLuong)}</Text></View>
      <LessonContent lesson={currentLesson} userId={user.maNguoiDung} onComplete={() => void markLessonViewed()} onTimeUpdate={setVideoTime} />
      <Pressable style={styles.toolsToggle} onPress={() => setShowTools((value) => !value)}><Ionicons name="briefcase-outline" size={19} color={C.primary} /><Text style={styles.toolsText}>Công cụ bài học</Text><Ionicons name={showTools ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} /></Pressable>
      {showTools && <LessonTools lesson={currentLesson} videoTime={videoTime} />}
      <ReviewPanel courseId={course.maKhoaHoc} userId={user.maNguoiDung} canReview={progress >= 100} />
      {progress >= 100 && <View style={styles.certificateCard}><Ionicons name="ribbon-outline" size={26} color={C.primary} /><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.certificateTitle}>Chứng chỉ hoàn thành</Text><Text style={styles.lessonMeta}>Bạn đã hoàn thành khóa học. Chứng chỉ sẽ được xử lý theo tài khoản học viên.</Text></View></View>}
      <View style={styles.navigation}><Pressable style={[styles.navButton, !previous && styles.disabled]} disabled={!previous} onPress={() => moveLesson(previous)}><Ionicons name="arrow-back" size={18} color={C.primary} /><Text style={styles.navText}>Bài trước</Text></Pressable><Pressable style={[styles.navButton, (!next || !currentLesson.daXem) && styles.disabled]} disabled={!next || !currentLesson.daXem} onPress={() => moveLesson(next)}><Text style={styles.navText}>{currentLesson.daXem ? 'Bài tiếp' : 'Xem hết video để tiếp tục'}</Text><Ionicons name="arrow-forward" size={18} color={C.primary} /></Pressable></View>
    </ScrollView>
    <LessonNavigator visible={showLessons} course={course} currentId={currentLesson.id} progress={progress} onClose={() => setShowLessons(false)} onSelect={selectLesson} />
  </SafeAreaView>;
}

function LessonContent({ lesson, userId, onComplete, onTimeUpdate }: { lesson: Lesson; userId?: number; onComplete: () => void; onTimeUpdate?: (seconds: number) => void }) {
  const [videoTime, setVideoTime] = useState(lesson.thoiGianDaXem ?? 0);
  const [showAttachedQuiz, setShowAttachedQuiz] = useState(false);
  useEffect(() => { setVideoTime(lesson.thoiGianDaXem ?? 0); }, [lesson.id, lesson.thoiGianDaXem]);
  const handleVideoComplete = () => { if (lesson.thongTinQuiz) setShowAttachedQuiz(true); else onComplete(); };
  useEffect(() => { setShowAttachedQuiz(false); }, [lesson.id]);
  useEffect(() => { if (lesson.loaiBaiHoc === 'Text' && !lesson.daXem) onComplete(); }, [lesson.id, lesson.daXem, lesson.loaiBaiHoc, onComplete]);
  if (lesson.loaiBaiHoc === 'Ide') return <View style={styles.lockedCard}><Ionicons name="desktop-outline" size={34} color={C.muted} /><Text style={styles.lockedTitle}>Bài thực hành chỉ dùng trên máy tính</Text><Text style={styles.locked}>Mở EduCodeAI trên desktop để sử dụng IDE và trình chạy mã.</Text></View>;
  if (lesson.loaiBaiHoc === 'Video') return <><VideoLessonWithSummary lesson={lesson} onComplete={handleVideoComplete} onTimeUpdate={onTimeUpdate} />{showAttachedQuiz && <QuizPanel lesson={lesson} userId={userId} onPassed={onComplete} />}</>;
  if (lesson.loaiBaiHoc === 'Quiz') return <QuizPanel lesson={lesson} userId={userId} onPassed={onComplete} />;
  return <View style={styles.theoryCard}><RenderHtml contentWidth={Dimensions.get('window').width - 72} source={{ html: lesson.noiDung || '<p>Bài học chưa có nội dung.</p>' }} baseStyle={styles.theory} /></View>;
}

function VideoLessonWithSummary({ lesson, onComplete, onTimeUpdate }: { lesson: Lesson; onComplete: () => void; onTimeUpdate?: (seconds: number) => void }) { return <><VideoLesson lesson={lesson} onComplete={onComplete} onTimeUpdate={onTimeUpdate} /><VideoSummaryPanel lesson={lesson} /></>; }

function LessonNavigator({ visible, course, currentId, progress, onClose, onSelect }: { visible: boolean; course: CourseContent; currentId: number; progress: number; onClose: () => void; onSelect: (lesson: Lesson) => void }) {
  const [open, setOpen] = useState<number[]>([]);
  const allLessons = course.danhSachChuongHoc.flatMap((chapter) => chapter.danhSachBaiHoc);
  const isLocked = (lesson: Lesson) => { const index = allLessons.findIndex((item) => item.id === lesson.id); const previous = index > 0 ? allLessons[index - 1] : undefined; return Boolean(lesson.biKhoa || (previous && !previous.daXem && !lesson.daXem)); };
  useEffect(() => { const chapter = course.danhSachChuongHoc.find((item) => item.danhSachBaiHoc.some((lesson) => lesson.id === currentId)); if (chapter) setOpen([chapter.id]); }, [currentId, course.danhSachChuongHoc]);
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}><View style={styles.sheetBackdrop}><View style={styles.sheet}><View style={styles.sheetHandle} /><View style={styles.sheetHeader}><View><Text style={styles.sheetTitle}>Nội dung khóa học</Text><Text style={styles.sheetMeta}>{progress}% hoàn thành</Text></View><Pressable style={styles.closeButton} onPress={onClose}><Ionicons name="close" size={22} color={C.dark} /></Pressable></View><ScrollView>{course.danhSachChuongHoc.map((chapter) => { const expanded = open.includes(chapter.id); const chapterDone = chapter.danhSachBaiHoc.filter((lesson) => lesson.daXem).length; return <View key={chapter.id} style={styles.chapter}><Pressable style={styles.chapterHead} onPress={() => setOpen((value) => expanded ? value.filter((id) => id !== chapter.id) : [...value, chapter.id])}><View style={{ flex: 1 }}><Text style={styles.chapterTitle}>{chapter.tieuDe}</Text><Text style={styles.chapterMeta}>{chapterDone}/{chapter.danhSachBaiHoc.length} bài hoàn thành</Text></View><Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} /></Pressable>{expanded && chapter.danhSachBaiHoc.map((lesson) => { const locked = isLocked(lesson); return <Pressable key={lesson.id} style={[styles.lessonRow, lesson.id === currentId && styles.selected, locked && styles.lockedLesson]} onPress={() => onSelect(lesson)}><Ionicons name={locked ? 'lock-closed-outline' : lesson.daXem ? 'checkmark-circle' : lesson.loaiBaiHoc === 'Video' ? 'play-circle-outline' : lesson.loaiBaiHoc === 'Quiz' ? 'help-circle-outline' : 'document-text-outline'} size={19} color={locked ? '#9ca3af' : lesson.daXem ? C.green : C.primary} /><View style={styles.lessonRowMain}><Text numberOfLines={2} style={[styles.lessonRowText, locked && styles.lockedText]}>{lesson.tieuDe}</Text><Text style={[styles.lessonRowMeta, locked && styles.lockedText]}>{lesson.loaiBaiHoc === 'Text' ? 'Lý thuyết' : lesson.loaiBaiHoc} · {formatDuration(lesson.thoiLuong)}{locked ? ' · Chưa mở khóa' : ''}</Text></View></Pressable>; })}</View>; })}</ScrollView></View></View></Modal>;
}
function formatDuration(seconds = 0) { const minutes = Math.floor(seconds / 60); return minutes ? `${minutes} phút` : `${seconds} giây`; }
function CenteredState({ text, loading, action, onAction }: { text: string; loading?: boolean; action?: string; onAction?: () => void }) { return <SafeAreaView style={styles.center}>{loading && <ActivityIndicator size="large" color={C.primary} />}<Text style={styles.stateText}>{text}</Text>{action && <Pressable style={styles.retry} onPress={onAction}><Text style={styles.retryText}>{action}</Text></Pressable>}</SafeAreaView>; }

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: C.bg }, header: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, headerText: { flex: 1, marginHorizontal: 8 }, courseTitle: { color: C.dark, fontSize: 15, fontWeight: '700' }, progressLine: { height: 5, backgroundColor: '#f3f4f6', borderRadius: 4, marginTop: 7, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 4 }, progressText: { color: C.muted, fontSize: 11, marginTop: 4 }, content: { padding: 16, paddingBottom: 40 }, lessonHeading: { marginBottom: 16 }, lessonType: { color: C.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1 }, lessonTitle: { color: C.dark, fontSize: 24, fontWeight: '800', marginTop: 7 }, lessonMeta: { color: C.muted, marginTop: 8 }, theoryCard: { backgroundColor: C.white, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: C.border }, certificateCard: { flexDirection: 'row', alignItems: 'center', marginTop: 14, padding: 16, backgroundColor: '#fff7ed', borderRadius: 14, borderWidth: 1, borderColor: '#fed7aa' }, certificateTitle: { color: C.dark, fontWeight: '800' }, theory: { color: C.dark, fontSize: 16, lineHeight: 27 }, completeButton: { marginTop: 20, minHeight: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: C.primary }, completeText: { color: C.white, fontWeight: '700' }, lockedCard: { alignItems: 'center', padding: 28, backgroundColor: '#f3f4f6', borderRadius: 16 }, lockedTitle: { color: C.dark, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 12 }, locked: { color: C.muted, textAlign: 'center', lineHeight: 21, marginTop: 8 }, toolsToggle: { minHeight: 50, marginTop: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12 }, toolsText: { flex: 1, color: C.dark, fontWeight: '700' }, navigation: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 20 }, navButton: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 9, borderRadius: 10, backgroundColor: '#fef3ec' }, navText: { color: '#d97706', fontWeight: '700', textAlign: 'center', fontSize: 13 }, disabled: { opacity: 0.4 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: C.bg }, stateText: { color: '#374151', textAlign: 'center', marginTop: 12 }, retry: { marginTop: 16, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center', borderRadius: 10, backgroundColor: C.primary }, retryText: { color: C.white, fontWeight: '700' }, sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,24,39,0.45)' }, sheet: { maxHeight: '86%', backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 }, sheetHandle: { width: 42, height: 4, backgroundColor: '#d1d5db', borderRadius: 4, alignSelf: 'center', marginBottom: 14 }, sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }, sheetTitle: { color: C.dark, fontSize: 20, fontWeight: '800' }, sheetMeta: { color: C.muted, marginTop: 4 }, closeButton: { marginLeft: 'auto', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, chapter: { backgroundColor: C.white, borderRadius: 12, marginTop: 10, overflow: 'hidden', borderWidth: 1, borderColor: C.border }, chapterHead: { minHeight: 58, padding: 14, flexDirection: 'row', alignItems: 'center' }, chapterTitle: { color: C.dark, fontWeight: '800' }, chapterMeta: { color: C.muted, fontSize: 12, marginTop: 3 }, lessonRow: { minHeight: 58, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6' }, lockedLesson: { backgroundColor: '#f3f4f6', opacity: .72 }, lockedText: { color: '#9ca3af' }, selected: { backgroundColor: '#fff5eb' }, lessonRowMain: { flex: 1, marginLeft: 10 }, lessonRowText: { color: '#374151', fontWeight: '600' }, lessonRowMeta: { color: C.muted, fontSize: 12, marginTop: 3 } });
