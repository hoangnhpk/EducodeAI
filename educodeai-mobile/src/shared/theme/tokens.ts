/**
 * Design tokens canonical theo docs/mobile-hoc-vien/08-design-system-va-ui-sync.md.
 * Nguồn web: educodeai-client/src/assets/styles/variables.css.
 * Không module nào được tự đổi giá trị; thay đổi phải được cả nhóm thống nhất.
 */

export const colors = {
  primary: '#F69050',
  primaryPressed: '#E67E22',
  primaryDark: '#D97706',
  primarySoft: '#FEF3EC',
  aiAccent: '#8B5CF6',
  aiAccentPressed: '#7C3AED',
  aiAccentSoft: '#F3EFFE',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#0EA5E9',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
} as const;

export const fontSize = {
  caption: 12,
  body: 14,
  bodyLg: 16,
  subtitle: 18,
  title: 22,
  titleLg: 24,
  display: 28,
} as const;

/** Touch target tối thiểu theo design system. */
export const MIN_TOUCH_TARGET = 44;

export const shadow = {
  card: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
