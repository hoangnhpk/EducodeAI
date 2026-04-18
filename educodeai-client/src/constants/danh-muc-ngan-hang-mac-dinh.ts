import type { NganHangItemDTO } from "@/services/rut-tien-giang-vien.service";

/** Trùng với server `DanhMucNganHangLienKet` — dùng khi API chưa gọi được (offline). */
export const DANH_MUC_NGAN_HANG_MAC_DINH: NganHangItemDTO[] = [
  { ma: "NAPAS", tenHienThi: "NAPAS", maVietQr: "NAPAS" },
  { ma: "STB", tenHienThi: "Sacombank", maVietQr: "STB" },
  { ma: "VPB", tenHienThi: "VPBank", maVietQr: "VPB" },
  { ma: "TPB", tenHienThi: "TPBank", maVietQr: "TPB" },
  { ma: "MB", tenHienThi: "MB", maVietQr: "MB" },
  { ma: "ICT", tenHienThi: "VietinBank", maVietQr: "ICT" },
  { ma: "BIDV", tenHienThi: "BIDV", maVietQr: "BIDV" },
  { ma: "ACB", tenHienThi: "ACB", maVietQr: "ACB" },
  { ma: "OCB", tenHienThi: "OCB", maVietQr: "OCB" },
  { ma: "KLB", tenHienThi: "KienlongBank", maVietQr: "KLB" },
  { ma: "MSB", tenHienThi: "MSB", maVietQr: "MSB" }
];
