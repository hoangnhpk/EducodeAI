import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../shared/theme/tokens';

export function BootstrapScreen({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (error) return;
    const timer = setTimeout(() => setTimedOut(true), 12_000);
    return () => clearTimeout(timer);
  }, [error]);
  const visibleError = error || (timedOut ? 'Ứng dụng không nhận được phản hồi khi kiểm tra phiên đăng nhập.' : null);
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Text accessibilityRole="header" style={styles.brand}>EDUCODE<Text style={styles.ai}>AI</Text></Text>
      {visibleError ? <>
        <Text style={styles.error}>{visibleError}</Text>
        <Pressable accessibilityRole="button" style={styles.button} onPress={() => { setTimedOut(false); onRetry?.(); }}>
          <Text style={styles.buttonText}>Thử lại</Text>
        </Pressable>
      </> : <>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>Đang kiểm tra phiên đăng nhập…</Text>
      </>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl, backgroundColor: colors.background, padding: spacing.xl },
  brand: { color: colors.text, fontSize: 26, fontWeight: '800' },
  ai: { color: colors.primary },
  message: { color: colors.muted, fontSize: 16 },
  error: { color: colors.text, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  button: { minHeight: 46, minWidth: 120, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.primary, paddingHorizontal: 20 },
  buttonText: { color: colors.surface, fontWeight: '700' },
});
