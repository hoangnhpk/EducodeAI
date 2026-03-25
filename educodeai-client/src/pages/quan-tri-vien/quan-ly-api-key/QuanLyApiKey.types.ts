/* =============================================
   TYPE DEFINITIONS – Quản lý API Key
   ============================================= */

export type LoaiKey = "Chính" | "Phụ";
export type TrangThaiKey = "Hoạt động" | "Đã khóa";
export type TrangThaiHeThong = "Ổn định" | "Cảnh báo" | "Sự cố";

export interface ApiKey {
  id: string;
  tenKey: string;
  maKeyFull: string;
  loai: LoaiKey;
  trangThai: TrangThaiKey;
  hanMucRequest: number;
  daSuDungRequest: number;
  hanMucToken: number;
  daSuDungToken: number;
  ngayTao: string;
  moTa?: string;
}

export interface ThongKeHeThong {
  tongRequestHomNay: number;
  tongTokenDaDung: number;
  trangThaiHeThong: TrangThaiHeThong;
  phanTramTang: number;
}
