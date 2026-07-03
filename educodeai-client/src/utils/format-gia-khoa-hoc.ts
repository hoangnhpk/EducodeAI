export function laKhoaHocMienPhi(donViTienTe?: string): boolean {
  return donViTienTe?.toUpperCase() === "FREE";
}

export function formatGiaKhoaHoc(gia: number, donViTienTe = "VND"): string {
  if (laKhoaHocMienPhi(donViTienTe)) {
    return "Miễn phí";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(gia);
}
