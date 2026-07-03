export const DANH_HIEU_TIER: Record<string, number> = {
  tan_binh: 1,
  hoc_gia_tap_su: 2,
  chien_than: 3,
  bac_thuyet_trinh: 4,
  huyen_thoai: 5,
};

export const TIER_STYLE: Record<string, { accent: string; bg: string; icon: string; glow: string }> = {
  tan_binh: { accent: '#16a34a', bg: '#f0fdf4', icon: '#15803d', glow: '#4ade80' },
  hoc_gia_tap_su: { accent: '#2563eb', bg: '#eff6ff', icon: '#1d4ed8', glow: '#60a5fa' },
  chien_than: { accent: '#7c3aed', bg: '#f5f3ff', icon: '#6d28d9', glow: '#a78bfa' },
  bac_thuyet_trinh: { accent: '#D4A017', bg: '#FFFBF0', icon: '#9A7209', glow: '#F0C14B' },
  huyen_thoai: { accent: '#dc2626', bg: '#fef2f2', icon: '#b91c1c', glow: '#f87171' },
};

export function layTierTuMaCode(maCode: string): number {
  return DANH_HIEU_TIER[maCode] ?? 1;
}

export function layStyleDanhHieu(maCode: string) {
  return TIER_STYLE[maCode] ?? TIER_STYLE.tan_binh;
}
