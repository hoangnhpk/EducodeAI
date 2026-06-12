import axiosClient from "@/configs/axios";

export interface TaoMaGiamGiaPayload {
  code: string;
  tenChuongTrinh: string;
  loaiGiamGia: "PERCENT" | "FIXED";
  giaTriGiam: number;
  giamToiDa?: number;
  soLuongToiDa: number;
  batDauAt: string;
  ketThucAt: string;
  apDungTatCaKhoaHocCuaGiangVien: boolean;
  danhSachMaKhoaHoc: number[];
}

export interface MaGiamGiaItemDTO {
  maVoucher: number;
  code: string;
  tenChuongTrinh: string;
  loaiGiamGia: string;
  giaTriGiam: number;
  giamToiDa?: number;
  soLuongToiDa: number;
  soLuongDaDung: number;
  kichHoat: boolean;
  batDauAt: string;
  ketThucAt: string;
  phamViApDung: string;
  danhSachMaKhoaHoc: number[];
}

export interface KhoaHocApDungOptionDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  maGiangVien: number;
}

export const MaGiamGiaService = {
  taoChoAdmin: async (payload: TaoMaGiamGiaPayload): Promise<MaGiamGiaItemDTO> =>
    axiosClient.post("/api/quan-tri-vien/ma-giam-gia/tao", payload),
  layDanhSachAdmin: async (): Promise<MaGiamGiaItemDTO[]> =>
    axiosClient.get("/api/quan-tri-vien/ma-giam-gia/danh-sach"),
  layKhoaHocAdmin: async (): Promise<KhoaHocApDungOptionDTO[]> =>
    axiosClient.get("/api/quan-tri-vien/ma-giam-gia/khoa-hoc"),

  taoChoGiangVien: async (payload: TaoMaGiamGiaPayload): Promise<MaGiamGiaItemDTO> =>
    axiosClient.post("/api/giang-vien/ma-giam-gia/tao", payload),
  layDanhSachGiangVien: async (): Promise<MaGiamGiaItemDTO[]> =>
    axiosClient.get("/api/giang-vien/ma-giam-gia/danh-sach"),
  layKhoaHocGiangVien: async (): Promise<KhoaHocApDungOptionDTO[]> =>
    axiosClient.get("/api/giang-vien/ma-giam-gia/khoa-hoc-cua-toi")
};
