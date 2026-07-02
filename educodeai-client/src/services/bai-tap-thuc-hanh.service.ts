import axiosClient from '@/configs/axios';
import type {
  GenerateBaiTapThucHanhDTO,
  BaiTapThucHanhData,
  SaveBaiTapThucHanhDTO,
  ApiResponse,
  GenerateQuizAIDTO,
  QuizAIData,
  CreateQuizDTO,
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
      timeout: 120000,
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

  // ── QUIZ AI: POST /api/BaiTap/tao-bang-ai ──
  generateQuiz: (dto: GenerateQuizAIDTO) =>
    axiosClient.post<{ success: boolean; message: string; data: QuizAIData }>(
      '/api/BaiTap/tao-bang-ai',
      dto,
      { timeout: 120000 }
    ),

  // ── Lưu Quiz: POST /api/BaiTap/xuat-ban ──
  saveQuiz: (dto: CreateQuizDTO) =>
    axiosClient.post<{ success: boolean; message: string; maBaiTapQuiz: number }>(
      '/api/BaiTap/xuat-ban',
      dto
    ),
};
