import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing } from '../../../shared/theme/tokens';

export function AuthField({ label, error, secure, ...props }: TextInputProps & { label: string; error?: string; secure?: boolean }) {
  const [visible, setVisible] = useState(false);
  const errorId = `${label.replace(/\s/g, '-')}-error`;
  return <View style={styles.group}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrap, error && styles.inputError]}>
      <TextInput {...props} style={styles.input} placeholderTextColor={colors.muted} secureTextEntry={secure && !visible} accessibilityLabel={label} accessibilityHint={error} />
      {secure ? <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} hitSlop={8} onPress={() => setVisible(x => !x)} style={styles.eye}>
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.muted} />
      </Pressable> : null}
    </View>
    {error ? <Text nativeID={errorId} accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({ group: { gap: spacing.sm }, label: { color: colors.text, fontWeight: '600' }, inputWrap: { minHeight: 48, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface }, inputError: { borderColor: colors.danger }, input: { flex: 1, minHeight: 48, color: colors.text, fontSize: 16, paddingHorizontal: spacing.md }, eye: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, error: { color: colors.danger, fontSize: 13 } });
