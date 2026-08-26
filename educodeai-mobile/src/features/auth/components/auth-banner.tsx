import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../../../shared/theme/tokens';
export function AuthBanner({ message, tone = 'error' }: { message?: string; tone?: 'error' | 'warning' | 'success' }) {
  if (!message) return null;
  return <Text accessibilityRole="alert" style={[styles.base, styles[tone]]}>{message}</Text>;
}
const styles = StyleSheet.create({ base: { borderRadius: radius.md, padding: spacing.md, lineHeight: 20 }, error: { color: colors.danger, backgroundColor: colors.dangerSoft }, warning: { color: colors.warning, backgroundColor: colors.warningSoft }, success: { color: colors.success, backgroundColor: colors.successSoft } });
