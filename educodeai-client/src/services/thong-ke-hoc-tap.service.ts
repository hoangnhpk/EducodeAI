import axiosClient from '@/configs/axios';
import type {
  ThongKeOverview,
  TrangThaiHocVien,
  HocVien,
  PagedResult,
  HocVienParams,
} from '../pages/giang-vien/thong-ke-hoc-tap/components/Types';

export const thongKeHocTapService = {
  /**
   * Lấy thống kê tổng quan
   * GET /api/giang-vien/thong-ke/overview
   */
  getOverview: async (): Promise<ThongKeOverview> => {
    return axiosClient.get<ThongKeOverview>('/giang-vien/thong-ke/overview');
  },

  /**
   * Lấy trạng thái học viên (cho biểu đồ)
   * GET /api/giang-vien/thong-ke/trang-thai-hoc-vien
   */
  getTrangThaiHocVien: async (): Promise<TrangThaiHocVien[]> => {
    return axiosClient.get<TrangThaiHocVien[]>('/giang-vien/thong-ke/trang-thai-hoc-vien');
  },

  /**
   * Lấy danh sách học viên (có phân trang và search)
   * GET /api/giang-vien/thong-ke/hoc-vien
   */
  getHocVien: async (params?: HocVienParams): Promise<PagedResult<HocVien>> => {
    return axiosClient.get<PagedResult<HocVien>>('/giang-vien/thong-ke/hoc-vien', {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        search: params?.search || undefined,
      },
    });
  },
};

export default thongKeHocTapService;