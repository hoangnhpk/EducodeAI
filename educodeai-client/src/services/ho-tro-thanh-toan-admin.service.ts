import axiosClient from "@/configs/axios";
import type { HoTroThanhToanChiTietDTO } from "@/services/thanh-toan-khoa-hoc.service";

export interface HoTroThanhToanDanhSachItemDTO {
  maGiaoDichHoTro: number;
  maDonHang: number;
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
  khoaHocDaiDien?: string;
  createdAt: string;
  xuLyLuc?: string;
}

export const HoTroThanhToanAdminService = {
  layDanhSach: async (trangThai?: string, tuKhoa?: string): Promise<HoTroThanhToanDanhSachItemDTO[]> => {
    const params = new URLSearchParams();
    if (trangThai) params.set("trangThai", trangThai);
    if (tuKhoa) params.set("tuKhoa", tuKhoa);
    const query = params.toString();
    return await axiosClient.get<HoTroThanhToanDanhSachItemDTO[]>(
      `/api/quan-tri-vien/ho-tro-thanh-toan/danh-sach${query ? `?${query}` : ""}`
    );
  },

  layChiTiet: async (maGiaoDichHoTro: number): Promise<HoTroThanhToanChiTietDTO> => {
    return await axiosClient.get<HoTroThanhToanChiTietDTO>(
      `/api/quan-tri-vien/ho-tro-thanh-toan/${maGiaoDichHoTro}/chi-tiet`
    );
  },

  chapThuan: async (maGiaoDichHoTro: number, ghiChuAdmin?: string): Promise<HoTroThanhToanChiTietDTO> => {
    return await axiosClient.post<HoTroThanhToanChiTietDTO>(
      `/api/quan-tri-vien/ho-tro-thanh-toan/${maGiaoDichHoTro}/chap-thuan`,
      { ghiChuAdmin }
    );
  },

  tuChoi: async (maGiaoDichHoTro: number, ghiChuAdmin?: string): Promise<HoTroThanhToanChiTietDTO> => {
    return await axiosClient.post<HoTroThanhToanChiTietDTO>(
      `/api/quan-tri-vien/ho-tro-thanh-toan/${maGiaoDichHoTro}/tu-choi`,
      { ghiChuAdmin }
    );
  }
};
