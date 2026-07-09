import axiosInstance from "@/configs/axios";

const api = axiosInstance as any;

export interface TrangThaiHoSo {
  success: boolean;
  maHoSo: number;
  hoTen: string;
  email: string;
  trangThai: string; // ChoDuyet | CanBoSung | DaDuyet | TuChoi
  trangThaiHienThi: string;
  lyDo: string | null;
  ngayTao: string;
  ngayCapNhat: string;
  ngayDuyet: string | null;
  daNopBoSung?: boolean;
  ngayNopBoSung?: string | null;
}

export const hoSoGiangVienService = {
  /** Giảng viên tra cứu trạng thái hồ sơ theo email (public). */
  traCuuTrangThai: async (email: string): Promise<TrangThaiHoSo> => {
    return await api.get("/api/XacThuc/trang-thai-ho-so", { params: { email } });
  },

  /** Giảng viên kiểm tra quyền bổ sung hồ sơ theo token từ email (public). */
  kiemTraQuyenBoSung: async (maHoSo: number, token: string): Promise<{ valid: boolean }> => {
    return await api.get(`/api/XacThuc/kiem-tra-quyen-bo-sung/${maHoSo}`, { params: { token } });
  },

  /** Giảng viên nộp lại hồ sơ bổ sung (chỉ khi trạng thái = CanBoSung và token hợp lệ). */
  boSungHoSo: async (maHoSo: number, formData: FormData) => {
    return await api.put(`/api/XacThuc/bo-sung-ho-so/${maHoSo}`, formData);
  },
};