import axiosClient from "@/configs/axios";

export interface ThongTinMuaKhoaHocDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  moTa?: string;
  hinhAnh?: string;
  giaKhoaHoc: number;
  donViTienTe: string;
  daMua: boolean;
  choPhepMua: boolean;
}

export interface KetQuaMuaKhoaHocDTO {
  thanhCong: boolean;
  thongBao: string;
  maDonHang?: number;
  maKhoaHoc: number;
  daMua: boolean;
}

export interface ThongTinMaQRThanhToanDTO {
  maDonHang: number;
  maKhoaHoc: number;
  soTienCanThanhToan: number;
  donViTienTe: string;
  noiDungChuyenKhoan: string;
  duongDanAnhQr: string;
  hetHanLuc?: string;
}

export interface TrangThaiThanhToanDTO {
  maDonHang: number;
  trangThaiDonHang: string;
  daMoKhoaHoc: boolean;
  thongBao: string;
}

export interface ThongTinMaQuaTangDTO {
  maQuaTang: number;
  code: string;
  maDonHang: number;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  soTienCanThanhToan: number;
  donViTienTe: string;
  noiDungChuyenKhoan: string;
  duongDanAnhQr: string;
  hetHanThanhToan?: string;
  trangThaiMaQuaTang: string;
}

export interface TrangThaiMaQuaTangDTO {
  maDonHang: number;
  trangThaiDonHang: string;
  trangThaiMaQuaTang: string;
  sanSangSuDung: boolean;
  thongBao: string;
}

export interface KetQuaNhapMaQuaTangDTO {
  thanhCong: boolean;
  thongBao: string;
  code: string;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  maNguoiNhan: number;
}

export interface LichSuMaQuaTangDTO {
  maQuaTang: number;
  code: string;
  maDonHang: number;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  soTien: number;
  donViTienTe: string;
  noiDungChuyenKhoan: string;
  maNguoiTang: number;
  tenNguoiTang?: string;
  emailNguoiTang?: string;
  trangThai: string;
  createdAt: string;
  activatedAt?: string;
  redeemedAt?: string;
  maNguoiNhan?: number;
  tenNguoiNhan?: string;
  emailNguoiNhan?: string;
}

export interface HoTroThanhToanKhoaHocItemDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
}

export interface HoTroThanhToanChiTietDTO {
  maGiaoDichHoTro: number;
  loaiHoTro: "COURSE_PURCHASE" | "WITHDRAW_REQUEST";
  maDonHang: number;
  maYeuCauRutTien?: number;
  noiDungChuyenKhoan: string;
  maNguoiDung: number;
  tenHocVien: string;
  emailHocVien?: string;
  soTienDonHang: number;
  loaiTien: string;
  trangThaiHoTro: string;
  trangThaiDonHang: string;
  thongTinLienLac: string;
  noiDungHocVien?: string;
  ghiChuAdmin?: string;
  maQuanTriVienXuLy?: number;
  createdAt: string;
  xuLyLuc?: string;
  danhSachKhoaHoc: HoTroThanhToanKhoaHocItemDTO[];
}

export const ThanhToanKhoaHocService = {
  layThongTinMuaKhoaHoc: async (maKhoaHoc: number): Promise<ThongTinMuaKhoaHocDTO> => {
    return await axiosClient.get<ThongTinMuaKhoaHocDTO>(`/api/hocvien/thanh-toan-khoa-hoc/${maKhoaHoc}`);
  },

  muaNgay: async (maKhoaHoc: number): Promise<KetQuaMuaKhoaHocDTO> => {
    return await axiosClient.post<KetQuaMuaKhoaHocDTO>("/api/hocvien/thanh-toan-khoa-hoc/mua-ngay", {
      maKhoaHoc
    });
  },

  taoMaQrThanhToan: async (maKhoaHoc: number, maVoucher?: string): Promise<ThongTinMaQRThanhToanDTO> => {
    return await axiosClient.post<ThongTinMaQRThanhToanDTO>("/api/hocvien/thanh-toan-khoa-hoc/tao-ma-qr", {
      maKhoaHoc,
      maVoucher: maVoucher?.trim() || undefined
    });
  },

  taoMaQuaTang: async (maKhoaHoc: number, maVoucher?: string): Promise<ThongTinMaQuaTangDTO> => {
    return await axiosClient.post<ThongTinMaQuaTangDTO>("/api/hocvien/thanh-toan-khoa-hoc/tao-ma-qua-tang", {
      maKhoaHoc,
      maVoucher: maVoucher?.trim() || undefined
    });
  },

  kiemTraTrangThaiMaQuaTang: async (maDonHang: number): Promise<TrangThaiMaQuaTangDTO> => {
    return await axiosClient.get<TrangThaiMaQuaTangDTO>(
      `/api/hocvien/thanh-toan-khoa-hoc/kiem-tra-trang-thai-ma-qua-tang/${maDonHang}`
    );
  },

  nhapMaQuaTang: async (code: string): Promise<KetQuaNhapMaQuaTangDTO> => {
    return await axiosClient.post<KetQuaNhapMaQuaTangDTO>("/api/hocvien/thanh-toan-khoa-hoc/nhap-ma-qua-tang", { code });
  },

  layLichSuMaQuaTang: async (): Promise<LichSuMaQuaTangDTO[]> => {
    return await axiosClient.get<LichSuMaQuaTangDTO[]>("/api/hocvien/thanh-toan-khoa-hoc/lich-su-ma-qua-tang");
  },

  kiemTraTrangThaiThanhToan: async (maDonHang: number): Promise<TrangThaiThanhToanDTO> => {
    return await axiosClient.get<TrangThaiThanhToanDTO>(`/api/hocvien/thanh-toan-khoa-hoc/kiem-tra-trang-thai/${maDonHang}`);
  },

  taoYeuCauHoTroThanhToan: async (
    maDonHang: number,
    thongTinLienLac: string,
    noiDungHocVien?: string
  ): Promise<HoTroThanhToanChiTietDTO> => {
    return await axiosClient.post<HoTroThanhToanChiTietDTO>(
      `/api/hocvien/thanh-toan-khoa-hoc/${maDonHang}/yeu-cau-ho-tro`,
      { thongTinLienLac, noiDungHocVien }
    );
  }
};
