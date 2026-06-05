import axiosClient from '@/configs/axios';
import type {
  ThongKeOverview,
  TrangThaiHocVien,
  HocVien,
  PagedResult,
  HocVienParams,
  ThuNhapTongQuan,
  ThuNhapTheoThoiGian,
  ThuNhapTheoKhoaHoc,
  NhomThuNhapTheoThoiGian,
} from '../pages/giang-vien/thong-ke-hoc-tap/components/Types';

export const thongKeHocTapService = {
  /**
   * Lấy thống kê tổng quan
   * GET /api/giang-vien/thong-ke/overview
   */
  getOverview: async (): Promise<ThongKeOverview> => {
    return axiosClient.get<ThongKeOverview>('/api/giang-vien/thong-ke/overview');
  },

  /**
   * Lấy trạng thái học viên (cho biểu đồ)
   * GET /api/giang-vien/thong-ke/trang-thai-hoc-vien
   */
  getTrangThaiHocVien: async (): Promise<TrangThaiHocVien[]> => {
    return axiosClient.get<TrangThaiHocVien[]>('/api/giang-vien/thong-ke/trang-thai-hoc-vien');
  },

  /**
   * Lấy danh sách học viên (có phân trang và search)
   * GET /api/giang-vien/thong-ke/hoc-vien
   */
  getHocVien: async (params?: HocVienParams): Promise<PagedResult<HocVien>> => {
    return axiosClient.get<PagedResult<HocVien>>('/api/giang-vien/thong-ke/hoc-vien', {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        search: params?.search || undefined,
      },
    });
  },

  getThuNhapTongQuan: async (): Promise<ThuNhapTongQuan> => {
    return axiosClient.get<ThuNhapTongQuan>('/api/giang-vien/thong-ke/thu-nhap/tong-quan');
  },

  getThuNhapTheoThoiGian: async (nhomTheo: NhomThuNhapTheoThoiGian): Promise<ThuNhapTheoThoiGian[]> => {
    return axiosClient.get<ThuNhapTheoThoiGian[]>('/api/giang-vien/thong-ke/thu-nhap/theo-thoi-gian', {
      params: { nhomTheo },
    });
  },

  getThuNhapTheoKhoaHoc: async (top = 8): Promise<ThuNhapTheoKhoaHoc[]> => {
    return axiosClient.get<ThuNhapTheoKhoaHoc[]>('/api/giang-vien/thong-ke/thu-nhap/theo-khoa-hoc', {
      params: { top },
    });
  },

  guiCanhBaoHocVienNguyCoBoHoc: async (maHocVien: number): Promise<{ message: string }> => {
    return axiosClient.post<{ message: string }>(`/api/giang-vien/thong-ke/hoc-vien/${maHocVien}/gui-canh-bao`);
  },
};

export default thongKeHocTapService;