import type { NganHangItemDTO } from "@/services/rut-tien-giang-vien.service";

/** Trùng với server `DanhMucNganHangLienKet` — dùng khi API chưa gọi được (offline). */
export const DANH_MUC_NGAN_HANG_MAC_DINH: NganHangItemDTO[] = [
  { ma: "NAPAS", tenHienThi: "NAPAS", maVietQr: "NAPAS", maBin: null },
  { ma: "STB", tenHienThi: "Sacombank", maVietQr: "STB", maBin: "970403" },
  { ma: "VPB", tenHienThi: "VPBank", maVietQr: "VPB", maBin: "970432" },
  { ma: "TPB", tenHienThi: "TPBank", maVietQr: "TPB", maBin: "970423" },
  { ma: "MB", tenHienThi: "MB", maVietQr: "MB", maBin: "970422" },
  { ma: "ICT", tenHienThi: "VietinBank", maVietQr: "ICT", maBin: "970415" },
  { ma: "BIDV", tenHienThi: "BIDV", maVietQr: "BIDV", maBin: "970418" },
  { ma: "ACB", tenHienThi: "ACB", maVietQr: "ACB", maBin: "970416" },
  { ma: "OCB", tenHienThi: "OCB", maVietQr: "OCB", maBin: "970448" },
  { ma: "KLB", tenHienThi: "KienlongBank", maVietQr: "KLB", maBin: "970452" },
  { ma: "MSB", tenHienThi: "MSB", maVietQr: "MSB", maBin: "970426" }
];
