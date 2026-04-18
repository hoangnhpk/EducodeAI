import axiosClient from "@/configs/axios";

export interface NganHangItemDTO {
  ma: string;
  tenHienThi: string;
  maVietQr: string;
}

export interface ThongTinViGiangVienDTO {
  tongDoanhThuDaGhiNhan: number;
  tongDangChoXuLyRut: number;
  tongDaChuyenKhoan: number;
  soDuKhaDung: number;
  /** Mã VietQR đang lưu */
  maNganHangNhanTien?: string;
  /** Mã chọn dropdown (ví dụ STB) */
  maNganHangChon?: string;
  soTaiKhoanNhanTien?: string;
  tenTaiKhoanNhanTien?: string;
}

export interface YeuCauRutTienChiTietDTO {
  maYeuCauRutTien: number;
  maGiangVien: number;
  tenGiangVien: string;
  emailGiangVien?: string;
  soTienYeuCau: number;
  trangThaiYeuCau: string;
  loaiTien: string;
  maNganHangNhan: string;
  soTaiKhoanNhan: string;
  tenTaiKhoanNhan: string;
  noiDungChuyenKhoan?: string;
  duongDanAnhQr?: string;
  soTienDaChuyen?: number;
  maGiaoDichSePay?: number;
  ghiChuAdmin?: string;
  createdAt: string;
  duyetLuc?: string;
  chuyenKhoanThanhCongLuc?: string;
}

export const RutTienGiangVienService = {
  layDanhMucNganHang: async (): Promise<NganHangItemDTO[]> => {
    return await axiosClient.get<NganHangItemDTO[]>("/api/giang-vien/rut-tien/danh-muc-ngan-hang");
  },

  layThongTinVi: async (): Promise<ThongTinViGiangVienDTO> => {
    return await axiosClient.get<ThongTinViGiangVienDTO>("/api/giang-vien/rut-tien/vi");
  },

  themTaiKhoanNhanTien: async (duLieu: {
    maNganHangNhanTien: string;
    soTaiKhoanNhanTien: string;
    tenTaiKhoanNhanTien: string;
  }): Promise<ThongTinViGiangVienDTO> => {
    return await axiosClient.post<ThongTinViGiangVienDTO>("/api/giang-vien/rut-tien/tai-khoan-nhan-tien", duLieu);
  },

  xoaTaiKhoanNhanTien: async (): Promise<ThongTinViGiangVienDTO> => {
    return await axiosClient.delete<ThongTinViGiangVienDTO>("/api/giang-vien/rut-tien/tai-khoan-nhan-tien");
  },

  taoYeuCauRutTien: async (soTienYeuCau: number): Promise<YeuCauRutTienChiTietDTO> => {
    return await axiosClient.post<YeuCauRutTienChiTietDTO>("/api/giang-vien/rut-tien/yeu-cau", { soTienYeuCau });
  },

  layLichSuRutTien: async (): Promise<YeuCauRutTienChiTietDTO[]> => {
    return await axiosClient.get<YeuCauRutTienChiTietDTO[]>("/api/giang-vien/rut-tien/lich-su");
  },

  layDanhSachAdmin: async (trangThai?: string): Promise<YeuCauRutTienChiTietDTO[]> => {
    const query = trangThai ? `?trangThai=${encodeURIComponent(trangThai)}` : "";
    return await axiosClient.get<YeuCauRutTienChiTietDTO[]>(`/api/quan-tri-vien/rut-tien-giang-vien/danh-sach${query}`);
  },

  duyetYeuCau: async (maYeuCauRutTien: number, ghiChuAdmin?: string): Promise<YeuCauRutTienChiTietDTO> => {
    return await axiosClient.post<YeuCauRutTienChiTietDTO>(`/api/quan-tri-vien/rut-tien-giang-vien/${maYeuCauRutTien}/duyet`, {
      ghiChuAdmin
    });
  },

  tuChoiYeuCau: async (maYeuCauRutTien: number, lyDoTuChoi: string): Promise<YeuCauRutTienChiTietDTO> => {
    return await axiosClient.post<YeuCauRutTienChiTietDTO>(`/api/quan-tri-vien/rut-tien-giang-vien/${maYeuCauRutTien}/tu-choi`, {
      lyDoTuChoi
    });
  },

  /** Dùng pattern `chi-tiet/{id}` (tránh một số bản build cũ không khớp route `id/chi-tiet`). */
  layChiTietAdmin: async (maYeuCauRutTien: number): Promise<YeuCauRutTienChiTietDTO> => {
    return await axiosClient.get<YeuCauRutTienChiTietDTO>(
      `/api/quan-tri-vien/rut-tien-giang-vien/chi-tiet/${maYeuCauRutTien}`
    );
  },

  xacNhanDaChuyenKhoan: async (maYeuCauRutTien: number): Promise<YeuCauRutTienChiTietDTO> => {
    return await axiosClient.post<YeuCauRutTienChiTietDTO>(
      `/api/quan-tri-vien/rut-tien-giang-vien/${maYeuCauRutTien}/xac-nhan-da-chuyen-khoan`,
      {}
    );
  }
};
