/** Map mã trạng thái DB → nhãn hiển thị tiếng Việt (yêu cầu rút tiền giảng viên). */
export function hienThiTrangThaiYeuCauRutTien(code: string | undefined | null): string {
  const c = (code ?? "").trim().toUpperCase();
  switch (c) {
    case "CHO_DUYET":
      return "Chờ xử lý";
    case "CHO_CHUYEN_KHOAN":
      return "Đang chuyển khoản";
    case "DA_CHUYEN_KHOAN":
      return "Thành công";
    case "TU_CHOI":
      return "Bị từ chối";
    default:
      return code?.trim() || "—";
  }
}
