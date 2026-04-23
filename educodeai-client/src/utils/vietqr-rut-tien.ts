import type { YeuCauRutTienChiTietDTO } from "@/services/rut-tien-giang-vien.service";

/** Bỏ khoảng trắng trong STK trước khi đưa vào URL VietQR. */
export function chuanHoaStkChoVietQr(soTaiKhoan: string): string {
  return soTaiKhoan.replace(/\s+/g, "").trim();
}

/**
 * QR VietQR chỉ để giảng viên quét bằng app NH và đối chiếu STK / ngân hàng (số tiền = 0).
 * Cùng host `img.vietqr.io` với luồng rút tiền.
 */
export function buildVietQrKiemTraTaiKhoanUrl(
  maVietQr: string,
  soTaiKhoan: string,
  tenChuTaiKhoan: string
): string | null {
  const bank = maVietQr.trim();
  const stk = chuanHoaStkChoVietQr(soTaiKhoan);
  const ten = tenChuTaiKhoan.trim();
  if (!bank || !stk || !ten) {
    return null;
  }
  const addInfo = "KIEM TRA TK";
  return `https://img.vietqr.io/image/${bank}-${stk}-compact2.png?amount=0&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(ten)}`;
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
  return `https://img.vietqr.io/image/${maNganHangNhan}-${soTaiKhoanNhan}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(noiDungChuyenKhoan)}&accountName=${encodeURIComponent(tenTaiKhoanNhan)}`;
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
  const nd = item.noiDungChuyenKhoan?.trim();
  if (!nd) {
    return item;
  }
  const duongDanAnhQr = buildVietQrRutTienUrl(
    item.maNganHangNhan,
    item.soTaiKhoanNhan,
    item.tenTaiKhoanNhan,
    item.soTienYeuCau,
    nd
  );
  return {
    ...item,
    duongDanAnhQr
  };
}
