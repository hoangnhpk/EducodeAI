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

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radii = { small: 6, medium: 10, large: 16 } as const;
export const fontSizes = { caption: 12, body: 14, bodyLarge: 16, subtitle: 18, title: 22, display: 28 } as const;
export const fontWeights = { regular: '400', medium: '500', semibold: '600', bold: '700' } as const;
export const motion = { fast: 150, normal: 200, slow: 300 } as const;
export const touchTarget = 44;

export const theme = { colors, spacing, radii, fontSizes, fontWeights, motion, touchTarget } as const;
