import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, radius, spacing } from '../../../shared/theme/tokens';

export function PrimaryButton({ label, loading, disabled, onPress }: { label: string; loading?: boolean; disabled?: boolean; onPress(): void }) {
  const [pressed, setPressed] = useState(false);
  const blocked = Boolean(loading || disabled);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.button, pressed && !blocked && styles.pressed, blocked && styles.disabled]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.text}>{label}</Text>}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  pressed: { backgroundColor: colors.primaryPressed },
  disabled: { opacity: 0.6 },
  text: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
