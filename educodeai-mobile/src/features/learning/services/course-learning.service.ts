import api from '../../../shared/configs/api';
import type {
  CourseContent,
  Note,
  ReviewPayload,
  ReviewSummary,
  SaveNotePayload,
  SaveProgressPayload,
  SaveQuizResultPayload,
} from '../types/learning.types';

export const CourseLearningService = {
  async getCourseContent(courseId: number): Promise<CourseContent> {
    const response = await api.get<CourseContent>(`/NoiDungKhoaHoc/${courseId}`);
    return response.data;
  },

  async getNotes(lessonId: number, userId: number): Promise<Note[]> {
    const response = await api.get<Note[]>(`/NoiDungKhoaHoc/lay-ds-ghi-chu/${lessonId}/${userId}`);
    return response.data ?? [];
  },

  async saveNote(payload: SaveNotePayload): Promise<void> {
    await api.post('/NoiDungKhoaHoc/luu-ghi-chu', payload);
  },

  async saveProgress(payload: SaveProgressPayload): Promise<boolean> {
    try {
      const response = await api.post<{ thanhCong?: boolean }>('/NoiDungKhoaHoc/luu-tien-do', payload);
      return response.data?.thanhCong !== false;
    } catch {
      return false;
    }
  },

  async saveQuizResult(payload: SaveQuizResultPayload): Promise<boolean> {
    const response = await api.post<{ success?: boolean }>('/NoiDungKhoaHoc/BaiTap/luu-ket-qua-quiz', payload);
    return response.data?.success !== false;
  },

  async getReviews(courseId: number): Promise<ReviewSummary> {
    const response = await api.get<ReviewSummary>(`/NoiDungKhoaHoc/ds-danh-gia-khoa-hoc/${courseId}`);
    return response.data;
  },

  async addReview(payload: ReviewPayload): Promise<void> {
    await api.post('/NoiDungKhoaHoc/them-danh-gia', payload);
  },
};

export function flattenLessons(chapters: CourseContent['danhSachChuongHoc']) {
  return chapters.flatMap((chapter) =>
    chapter.danhSachBaiHoc.map((lesson) => ({ ...lesson, maChuong: chapter.id }))
  );
}

export function findLesson(lessons: ReturnType<typeof flattenLessons>, lessonId: number) {
  return lessons.find((lesson) => lesson.id === lessonId);
}

export function getNextLesson(lessons: ReturnType<typeof flattenLessons>, lessonId: number) {
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined;
}

export function getPreviousLesson(lessons: ReturnType<typeof flattenLessons>, lessonId: number) {
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return index > 0 ? lessons[index - 1] : undefined;
}

export function calculateProgress(lessons: ReturnType<typeof flattenLessons>) {
  if (!lessons.length) return 0;
  return Math.round((lessons.filter((lesson) => lesson.daXem).length / lessons.length) * 100);
}
