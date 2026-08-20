// ─── DESIGN SYSTEM CHUNG CHO MOBILE EDUCODEAI ────────────────────────────────
// Import file này vào mọi trang để đảm bảo đồng bộ màu sắc và style.

export const COLORS = {
  // Primary
  primary: '#fb873f',
  primaryGradient: ['#ff9955', '#fb873f'] as const,
  primaryLight: '#fff3ed',

  // Dark Theme (Phỏng vấn, trang nghiêm túc)
  dark: '#0f172a',
  darkLight: '#1e293b',
  darkBg: '#020617',
  darkBorder: '#334155',

  // Light Theme (Trang chủ, thử thách, lộ trình)
  bg: '#f8fafc',
  white: '#ffffff',
  lightGray: '#e2e8f0',
  lightBorder: '#e2e8f0',

  // Text
  text: '#1e293b',
  gray: '#64748b',
  grayLight: '#94a3b8',

  // Status
  success: '#10b981',
  successLight: '#dcfce7',
  danger: '#ef4444',
  gold: '#fbbf24',
  info: '#3b82f6',
};

export const SHADOWS = {
  small: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  glow: {
    shadowColor: '#fb873f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
};

export const RADIUS = {
  card: 24,
  button: 16,
  input: 20,
  modal: 32,
  pill: 50,
};

export const FONT = {
  title: { fontSize: 22, fontWeight: '900' as const, letterSpacing: -0.5 },
  heading: { fontSize: 18, fontWeight: '800' as const },
  body: { fontSize: 16, fontWeight: '600' as const },
  sub: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '700' as const },
};
