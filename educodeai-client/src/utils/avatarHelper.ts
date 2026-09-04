const AVATAR_PALETTE = [
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#d1fae5', color: '#047857' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#ffedd5', color: '#c2410c' },
  { bg: '#e0e7ff', color: '#4338ca' },
  { bg: '#f1f5f9', color: '#475569' },
  { bg: '#cffafe', color: '#0e7490' },
] as const;

function hashTen(ten: string): number {
  let hash = 0;
  for (let i = 0; i < ten.length; i += 1) {
    hash = ten.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/** Lấy 1–2 chữ cái đầu từ họ tên (vd: "Hoàng Nguyen" → "HN") */
export function layChuCaiAvatar(hoTen: string): string {
  const parts = hoTen.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Màu nền/chữ pastel cố định theo tên */
export function layMauAvatar(hoTen: string): { bg: string; color: string } {
  const key = hoTen.trim().toLowerCase() || '?';
  const idx = hashTen(key) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** Ghép base API với đường dẫn avatar tương đối từ DB */
export function getAnhDaiDienUrl(path?: string | null): string {
  const trimmedPath = path?.trim();
  if (!trimmedPath) return '';
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) return trimmedPath;
  const normalized = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
  return `${API_BASE}${normalized}`;
}
