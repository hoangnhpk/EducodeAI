import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../shared/theme/tokens';

export function BootstrapScreen() {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Text accessibilityRole="header" style={styles.brand}>EDUCODE<Text style={styles.ai}>AI</Text></Text>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>Đang kiểm tra phiên đăng nhập…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl, backgroundColor: colors.background, padding: spacing.xl },
  brand: { color: colors.text, fontSize: 26, fontWeight: '800' },
  ai: { color: colors.primary },
  message: { color: colors.muted, fontSize: 16 },
});
