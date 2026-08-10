/** Định dạng tổng thời gian học từ số giây → "X giờ Y phút Z giây" (bỏ phần = 0). */
export function formatThoiGianTuGiay(totalSeconds: number | null | undefined): string {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  if (seconds === 0) return "0 giây";

  const gio = Math.floor(seconds / 3600);
  const phut = Math.floor((seconds % 3600) / 60);
  const giay = seconds % 60;

  const parts: string[] = [];
  if (gio > 0) parts.push(`${gio} giờ`);
  if (phut > 0) parts.push(`${phut} phút`);
  if (giay > 0 || parts.length === 0) parts.push(`${giay} giây`);
  return parts.join(" ");
}
