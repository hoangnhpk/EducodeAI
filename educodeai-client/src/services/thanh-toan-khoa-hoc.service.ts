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

export const ThanhToanKhoaHocService = {
  layThongTinMuaKhoaHoc: async (maKhoaHoc: number): Promise<ThongTinMuaKhoaHocDTO> => {
    return await axiosClient.get<ThongTinMuaKhoaHocDTO>(`/api/hocvien/thanh-toan-khoa-hoc/${maKhoaHoc}`);
  },

  muaNgay: async (maKhoaHoc: number): Promise<KetQuaMuaKhoaHocDTO> => {
    return await axiosClient.post<KetQuaMuaKhoaHocDTO>("/api/hocvien/thanh-toan-khoa-hoc/mua-ngay", {
      maKhoaHoc
    });
  },

  taoMaQrThanhToan: async (maKhoaHoc: number): Promise<ThongTinMaQRThanhToanDTO> => {
    return await axiosClient.post<ThongTinMaQRThanhToanDTO>("/api/hocvien/thanh-toan-khoa-hoc/tao-ma-qr", {
      maKhoaHoc
    });
  },

  kiemTraTrangThaiThanhToan: async (maDonHang: number): Promise<TrangThaiThanhToanDTO> => {
    return await axiosClient.get<TrangThaiThanhToanDTO>(`/api/hocvien/thanh-toan-khoa-hoc/kiem-tra-trang-thai/${maDonHang}`);
  }
};
