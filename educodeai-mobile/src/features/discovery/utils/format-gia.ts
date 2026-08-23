/**
 * Port từ educodeai-client/src/utils/format-gia-khoa-hoc.ts.
 * Không dùng Intl để tránh khác biệt Hermes giữa các thiết bị.
 */

export function laKhoaHocMienPhi(donViTienTe?: string): boolean {
  return donViTienTe?.toUpperCase() === 'FREE';
}

export function formatGiaKhoaHoc(gia: number, donViTienTe = 'VND'): string {
  if (laKhoaHocMienPhi(donViTienTe)) {
    return 'Miễn phí';
  }
  const rounded = Math.round(gia);
  const formatted = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} ₫`;
}
