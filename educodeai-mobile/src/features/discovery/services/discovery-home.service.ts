import api from '../../../shared/configs/api';
import type { CourseListItemDTO, HomeInstructorDTO, HomeReviewDTO } from '../types';

/**
 * Adapter cho các endpoint trang chủ/danh sách — contract từ TrangChu.tsx (web).
 * Lưu ý: baseURL của `api` đã có sẵn `/api`, nên path ở đây KHÔNG prefix `/api`.
 */

type CourseListCache = {
  key: string;
  at: number;
  data: CourseListItemDTO[];
};

const COURSE_LIST_TTL_MS = 60_000;
let courseListCache: CourseListCache | null = null;

const cacheKey = (search: string, maGiangVien: number | null) =>
  `${search.trim().toLowerCase()}::${maGiangVien ?? ''}`;

export const DiscoveryHomeService = {
  /** GET /api/KhoaHoc/all — danh sách + tìm kiếm + lọc theo giảng viên (cache 60s). */
  layDanhSachKhoaHoc: async (
    search = '',
    maGiangVien: number | null = null,
    opts?: { bypassCache?: boolean },
  ): Promise<CourseListItemDTO[]> => {
    const key = cacheKey(search, maGiangVien);
    const now = Date.now();
    if (
      !opts?.bypassCache &&
      courseListCache &&
      courseListCache.key === key &&
      now - courseListCache.at < COURSE_LIST_TTL_MS
    ) {
      return courseListCache.data;
    }

    const res = await api.get<CourseListItemDTO[]>('/KhoaHoc/all', {
      params: { search: search || undefined, maGiangVien: maGiangVien ?? undefined },
    });
    courseListCache = { key, at: now, data: res.data };
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
