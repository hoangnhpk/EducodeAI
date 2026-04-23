import axiosClient from "@/configs/axios";

export interface KhoaHocDaMuaHocVienDTO {
  maDangKy: number;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  hinhAnh?: string | null;
  linhVuc: string;
  thoiLuongGio: number;
  /** 0–100 */
  tienDo: number;
  trangThai?: string | null;
  ngayDangKy: string;
  slug: string;
}

export const KhoaHocDaMuaHocVienService = {
  layDanhSach: async (): Promise<KhoaHocDaMuaHocVienDTO[]> => {
    return await axiosClient.get<KhoaHocDaMuaHocVienDTO[]>(
      "/api/hocvien/khoa-hoc-da-mua"
    );
  }
};
