import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, radius, spacing } from '../../../shared/theme/tokens';

export function SecondaryButton({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress(): void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.button, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.text}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg },
  pressed: { backgroundColor: colors.background },
  disabled: { opacity: 0.6 },
  text: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
