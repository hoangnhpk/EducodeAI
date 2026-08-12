import api from '../../../shared/configs/api';
import type { MyCourseDTO } from '../types';

/** Adapter contract từ khoa-hoc-da-mua-hoc-vien.service.ts (web). */
export const MyCoursesService = {
  /** GET /api/hocvien/khoa-hoc-da-mua */
  layDanhSach: async (): Promise<MyCourseDTO[]> => {
    const res = await api.get<MyCourseDTO[]>('/hocvien/khoa-hoc-da-mua');
    return res.data;
  },
};
