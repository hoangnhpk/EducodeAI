import api from '../../../shared/configs/api';
import type { CourseDetailDTO, RegisterCourseResultDTO, ReviewPageDTO } from '../types';

/** Adapter contract từ chi-tiet-khoa-hoc.service.ts (web). */
export const CourseDetailService = {
  /** GET /api/hocvien/chitietkhoahoc/{id} */
  layChiTiet: async (maKhoaHoc: number): Promise<CourseDetailDTO> => {
    const res = await api.get<CourseDetailDTO>(`/hocvien/chitietkhoahoc/${maKhoaHoc}`);
    return res.data;
  },

  /** GET /api/hocvien/chitietkhoahoc/{id}/danh-gia */
  layDanhGia: async (
    maKhoaHoc: number,
    page = 1,
    pageSize = 5,
    filter = 'all'
  ): Promise<ReviewPageDTO> => {
    const res = await api.get<ReviewPageDTO>(`/hocvien/chitietkhoahoc/${maKhoaHoc}/danh-gia`, {
      params: { page, pageSize, filter },
    });
    return res.data;
  },

  /** POST /api/hocvien/chitietkhoahoc/dang-ky — đăng ký khóa (dùng cho khóa miễn phí). */
  dangKyKhoaHoc: async (maKhoaHoc: number): Promise<RegisterCourseResultDTO> => {
    const res = await api.post<RegisterCourseResultDTO>('/hocvien/chitietkhoahoc/dang-ky', {
      maKhoaHoc,
    });
    return res.data;
  },
};
