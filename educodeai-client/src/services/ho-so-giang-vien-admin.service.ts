import axiosClient from "@/configs/axios";

export interface HoSoGiangVienListItem {
  maHoSoDangKyGiangVien: number;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  linhVucGiangDay: string;
  loaiGiayTo: string;
  soGiayTo: string;
  anhDaiDienUrl?: string;
  trangThaiHoSo: string;
  lyDoTuChoi?: string;
  ngayTao: string;
  ngayDuyet?: string;
  maNguoiDung?: number;
}

export interface HoSoGiangVienDetail extends HoSoGiangVienListItem {
  taiKhoan: string;
  tieuSu: string;
  linkedInUrl?: string;
  websiteUrl?: string;
  anhGiayToMatTruocUrl: string;
  anhGiayToMatSauUrl: string;
  phuongThucThanhToan: string;
  tenNganHang?: string;
  soTaiKhoanNhanTien?: string;
  tenChuTaiKhoan?: string;
  maSoThue?: string;
  loaiDoiTuongThue?: string;
  maQuanTriVienDuyet?: number;
  ngayCapNhat: string;
}

export const HoSoGiangVienAdminService = {
  layDanhSach: async (trangThai?: string): Promise<HoSoGiangVienListItem[]> => {
    const params: Record<string, string> = {};
    if (trangThai) params.trangThai = trangThai;
    return await axiosClient.get<HoSoGiangVienListItem[]>(
      "/api/QuanTriVien/quan-ly-ho-so-giang-vien/ds-ho-so",
      { params }
    );
  },

  layChiTiet: async (maHoSo: number): Promise<HoSoGiangVienDetail> => {
    return await axiosClient.get<HoSoGiangVienDetail>(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/chi-tiet/${maHoSo}`
    );
  },

  demChoDuyet: async (): Promise<number> => {
    const res = await axiosClient.get<{ soLuong: number }>(
      "/api/QuanTriVien/quan-ly-ho-so-giang-vien/dem-cho-duyet"
    );
    return res.soLuong;
  },

  duyetHoSo: async (maHoSo: number) => {
    return await axiosClient.put(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/duyet/${maHoSo}`
    );
  },

  tuChoiHoSo: async (maHoSo: number, lyDoTuChoi: string) => {
    return await axiosClient.put(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/tu-choi/${maHoSo}`,
      { lyDoTuChoi }
    );
  },

  yeuCauBoSung: async (maHoSo: number, noiDungBoSung: string) => {
    return await axiosClient.put(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/yeu-cau-bo-sung/${maHoSo}`,
      { noiDungBoSung }
    );
  },

  /** URL ảnh CCCD private (chỉ admin + bearer token). */
  layAnhGiayToUrl: (maHoSo: number, mat: "truoc" | "sau" = "truoc") => {
    const base = import.meta.env.VITE_API_URL || "";
    return `${base}/api/QuanTriVien/quan-ly-ho-so-giang-vien/anh-giay-to/${maHoSo}?mat=${mat}`;
  }
};