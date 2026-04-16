import type { YeuCauRutTienChiTietDTO } from "@/services/rut-tien-giang-vien.service";

export function taoNoiDungRutTien(maYeuCauRutTien: number): string {
  return `RUT${maYeuCauRutTien}`;
}

/**
 * Cùng công thức URL với `RutTienGiangVienService.TaoDuongDanQrRutTien` (backend).
 */
export function buildVietQrRutTienUrl(
  maNganHangNhan: string,
  soTaiKhoanNhan: string,
  tenTaiKhoanNhan: string,
  soTienYeuCau: number,
  noiDungChuyenKhoan: string
): string {
  const amount = Math.floor(Number(soTienYeuCau));
  return `https://img.vietqr.io/image/${maNganHangNhan}-${soTaiKhoanNhan}-compact2.png?amount=${amount}&addInfo=${noiDungChuyenKhoan}&accountName=${encodeURIComponent(tenTaiKhoanNhan)}`;
}

/** Bổ sung QR xem trước khi DB chưa có `DuongDanAnhQr` (giống `BoSungQrXemTruocNeuCan` phía server). */
export function enrichYeuCauRutTienVoiQrPreview(item: YeuCauRutTienChiTietDTO): YeuCauRutTienChiTietDTO {
  if (item.duongDanAnhQr) {
    return item;
  }
  const tt = (item.trangThaiYeuCau || "").toUpperCase();
  if (tt !== "CHO_DUYET" && tt !== "CHO_CHUYEN_KHOAN") {
    return item;
  }
  const nd = item.noiDungChuyenKhoan?.trim() || taoNoiDungRutTien(item.maYeuCauRutTien);
  const duongDanAnhQr = buildVietQrRutTienUrl(
    item.maNganHangNhan,
    item.soTaiKhoanNhan,
    item.tenTaiKhoanNhan,
    item.soTienYeuCau,
    nd
  );
  return {
    ...item,
    noiDungChuyenKhoan: item.noiDungChuyenKhoan ?? nd,
    duongDanAnhQr
  };
}
