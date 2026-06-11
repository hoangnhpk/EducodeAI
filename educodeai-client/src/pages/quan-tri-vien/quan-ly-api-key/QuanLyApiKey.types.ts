/* =============================================
   TYPE DEFINITIONS – Quản lý API Key
   ============================================= */

export type TrangThaiHeThong = "Ổn định" | "Cảnh báo" | "Sự cố" | "Đang tải..." | "Mất kết nối API";

export interface KeyApiSummary {
  id: number;
  tenKey: string;
  loaiKey: string;
  trangThai: boolean;
  thuTuUuTien: number;
  phanTramSuDung: number;
  hanMucRequest: number;
  daSuDungRequest: number;
  hanMucToken: number;
  daSuDungToken: number;
  maKeyMasked: string;
}

export interface ApiKeyRevealDto {
  id: number;
  maKeyFull: string;
  revealedAt: string;
}

export interface KeyApiManage {
  tenKey: string;
  maKeyRaw: string;
  loaiKey: string;
  thuTuUuTien: number;
  hanMucRequest: number;
  hanMucToken: number;
}

export interface ThongKeHeThong {
  tongRequestHomNay: number;
  tongTokenDaDung: number;
  trangThaiHeThong: TrangThaiHeThong | string;
  phanTramTang: number;
}
