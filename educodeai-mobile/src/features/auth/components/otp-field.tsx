import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../../../shared/theme/tokens';

export function OtpField({ value, onChangeText, error }: { value: string; onChangeText(value: string): void; error?: string }) {
  return (
    <View style={styles.group}>
      <TextInput
        accessibilityLabel="Mã OTP gồm 6 chữ số"
        accessibilityHint={error}
        value={value}
        onChangeText={(next) => onChangeText(next.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={6}
        placeholder="000000"
        placeholderTextColor={colors.muted}
        style={[styles.input, error && styles.invalid]}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  input: { minHeight: 56, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center', letterSpacing: spacing.md },
  invalid: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13 },
});
