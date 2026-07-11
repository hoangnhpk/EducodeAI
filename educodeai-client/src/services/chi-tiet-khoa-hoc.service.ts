import axiosClient from '@/configs/axios';

export interface BaiHocDTO {
  maBaiHoc: number;
  tenBaiHoc: string;
  videoUrl: string;
  thoiLuong: number;
}

export interface ChuongHocDTO {
  maChuong: number;
  tenChuong: string;
  baiHocs: BaiHocDTO[];
}

export interface GiangVienDTO {
  maGiangVien: number;
  hoTen: string;
  anhDaiDien: string;
}

export interface ChiTietKhoaHocDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  moTa: string;
  videoGioiThieu: string | null;
  banSeHocDuocGi: string[];
  tongSoHocVien: number;
  giaKhoaHoc: number;
  donViTienTe: string;
  khoaHocDaDangKy: boolean;
  hinhAnh: string;
  linhVuc: string;
  trinhDo: string;
  thoiLuongGio: number;
  diemDanhGiaTB: number;
  tongDanhGia: number;
  coChungChi: boolean;
  tenChungChi: string;
  slug: string;
  giangVien: GiangVienDTO | null;
  chuongs: ChuongHocDTO[];
}

export interface NguoiDungDanhGiaDTO {
  hoTen: string;
  anhDaiDien: string;
}

export interface DanhGiaDTO {
  maDanhGia: number;
  soSao: number;
  nhanXet: string;
  ngayDanhGia: string;
  nguoiDung: NguoiDungDanhGiaDTO;
}

export interface DanhGiaResponseDTO {
  items: DanhGiaDTO[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const ChiTietKhoaHocService = {
  getChiTietKhoaHoc: async (id: number): Promise<ChiTietKhoaHocDTO> => {
    const res = await axiosClient.get<ChiTietKhoaHocDTO>(`/api/hocvien/chitietkhoahoc/${id}`);
    return res as unknown as ChiTietKhoaHocDTO; // axiosClient config might already unwrap data
  },

  getDanhGiaKhoaHoc: async (id: number, page: number = 1, pageSize: number = 5, filter: string = 'all'): Promise<DanhGiaResponseDTO> => {
    const res = await axiosClient.get<DanhGiaResponseDTO>(`/api/hocvien/chitietkhoahoc/${id}/danh-gia`, {
      params: { page, pageSize, filter }
    });
    return res as unknown as DanhGiaResponseDTO;
  },

  dangKyKhoaHoc: async (maKhoaHoc: number): Promise<{ message: string; maKhoaHoc: number }> => {
    const res = await axiosClient.post<{ message: string; maKhoaHoc: number }>('/api/hocvien/chitietkhoahoc/dang-ky', { maKhoaHoc });
    return res as unknown as { message: string; maKhoaHoc: number };
  }
};
