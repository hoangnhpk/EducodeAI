import axiosClient from '@/configs/axios';
import type {
  GenerateBaiTapThucHanhDTO,
  BaiTapThucHanhData,
  SaveBaiTapThucHanhDTO,
  ApiResponse,
} from '@/pages/giang-vien/bai-tap-thuc-hanh/BaiTapThucHanhDTO';

// Base API cho giảng viên quản lý bài tập thực hành
const BASE = '/api/lecturer/practice-exercises';

export const BaiTapThucHanhService = {
  // ── Cascade selectors (Dùng chung bộ lọc của hệ thống Bài Tập) ──
  getKhoaHocs: () => axiosClient.get<any>('/api/BaiTap/khoa-hoc'),
  getChuongHocs: (maKhoaHoc: number) => axiosClient.get<any>(`/api/BaiTap/chuong-hoc/${maKhoaHoc}`),
  getBaiHocs: (maChuong: number) => axiosClient.get<any>(`/api/BaiTap/bai-hoc/${maChuong}`),

  // ── Danh sách bài tập (IDE) của giảng viên ──
  getDanhSachThucHanh: () => axiosClient.get<any>('/api/BaiTap/ds-bai-tap'),

  // ── AI Generate: POST /api/lecturer/practice-exercises/generate ──
  generateBaiTap: (dto: GenerateBaiTapThucHanhDTO) =>
    axiosClient.post<ApiResponse<BaiTapThucHanhData>>(`${BASE}/generate`, dto, {
      timeout: 120000, // AI có thể mất thời gian lâu để suy nghĩ
    }),

  // ── Save: POST /api/lecturer/practice-exercises?lessonId=... ──
  saveBaiTap: (dto: BaiTapThucHanhData, lessonId: number) =>
    axiosClient.post<ApiResponse<any>>(`${BASE}?lessonId=${lessonId}`, dto),

  // ── Get Chi Tiết: GET /api/lecturer/practice-exercises/{maBaiTap} ──
  getChiTiet: (maBaiTap: number) =>
    axiosClient.get<ApiResponse<BaiTapThucHanhData>>(`${BASE}/${maBaiTap}`),

  // ── Update: PUT /api/lecturer/practice-exercises/{maBaiTap} ──
  updateBaiTap: (maBaiTap: number, dto: SaveBaiTapThucHanhDTO) =>
    axiosClient.put<ApiResponse<any>>(`${BASE}/${maBaiTap}`, dto),

  // ── Delete: DELETE /api/lecturer/practice-exercises/{maBaiTap} ──
  deleteBaiTap: (maBaiTap: number) =>
    axiosClient.delete<ApiResponse<null>>(`${BASE}/${maBaiTap}`),
};
