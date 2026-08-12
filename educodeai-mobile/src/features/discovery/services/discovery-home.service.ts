import api from '../../../shared/configs/api';
import type { CourseListItemDTO, HomeInstructorDTO, HomeReviewDTO } from '../types';

/**
 * Adapter cho các endpoint trang chủ/danh sách — contract từ TrangChu.tsx (web).
 * Lưu ý: baseURL của `api` đã có sẵn `/api`, nên path ở đây KHÔNG prefix `/api`.
 * (Web gọi `api/KhoaHoc/all` với baseURL root.)
 */
export const DiscoveryHomeService = {
  /** GET /api/KhoaHoc/all — danh sách + tìm kiếm + lọc theo giảng viên. */
  layDanhSachKhoaHoc: async (search = '', maGiangVien: number | null = null): Promise<CourseListItemDTO[]> => {
    const res = await api.get<CourseListItemDTO[]>('/KhoaHoc/all', {
      params: { search: search || undefined, maGiangVien: maGiangVien ?? undefined },
    });
    return res.data;
  },

  /** GET /api/hocvien/chitietkhoahoc/danh-gia-trang-chu */
  layDanhGiaTrangChu: async (soLuong = 10): Promise<HomeReviewDTO[]> => {
    const res = await api.get<HomeReviewDTO[]>('/hocvien/chitietkhoahoc/danh-gia-trang-chu', {
      params: { soLuong },
    });
    return res.data;
  },

  /** GET /api/hocvien/chitietkhoahoc/giang-vien-tieu-bieu */
  layGiangVienTieuBieu: async (soLuong = 4): Promise<HomeInstructorDTO[]> => {
    const res = await api.get<HomeInstructorDTO[]>('/hocvien/chitietkhoahoc/giang-vien-tieu-bieu', {
      params: { soLuong },
    });
    return res.data;
  },
};
