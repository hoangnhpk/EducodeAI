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
  maKeyMasked: string;
  modelSuDung: string;

  // === Phase 7A: Rate Limit ===
  rpmLimit: number;
  tpmLimit: number;
  rpdLimit: number;

  // Usage hôm nay (theo ngày UTC)
  daSuDungRequestHomNay: number;
  daSuDungTokenHomNay: number;
  phanTramRPD: number;

  // Trạng thái cooldown (Phase 7B)
  dangBiCooldown: boolean;
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
  modelSuDung: string;

  // === Phase 7A: Rate Limit mới ===
  rpmLimit: number;
  tpmLimit: number;
  rpdLimit: number;
}

// Trả về từ endpoint fetch-models (Backend Proxy Google API)
export interface GeminiModel {
  name: string;        // VD: "models/gemini-2.5-pro"
  displayName: string; // VD: "Gemini 2.5 Pro"
}

export interface ThongKeHeThong {
  tongRequestHomNay: number;
  tongTokenDaDung: number;
  trangThaiHeThong: TrangThaiHeThong | string;
  phanTramTang: number;
}
