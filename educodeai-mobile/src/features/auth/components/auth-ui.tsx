import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSizes, radii, spacing, touchTarget } from '../../../shared/theme/tokens';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.shell} keyboardShouldPersistTaps="handled">
      <View style={styles.brand}><View style={styles.logo}><Ionicons name="code-slash" size={26} color={colors.surface} /></View><Text style={styles.brandText}>EduCodeAI</Text></View>
      <View style={styles.card}><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}<View style={styles.form}>{children}</View></View>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} placeholderTextColor={colors.textMuted} style={[styles.input, error ? styles.inputError : null, props.style]} />{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
}

export function PasswordField(props: Omit<ComponentProps<typeof Field>, 'secureTextEntry'>) {
  return <Field {...props} secureTextEntry autoCapitalize="none" autoCorrect={false} />;
}

export function PrimaryButton({ label, loading, disabled, onPress, danger = false }: { label: string; loading?: boolean; disabled?: boolean; onPress: () => void; danger?: boolean }) {
  const blocked = disabled || loading;
  return <Pressable accessibilityRole="button" disabled={blocked} onPress={onPress} style={({ pressed }) => [styles.button, danger && styles.dangerButton, blocked && styles.disabled, pressed && !blocked && styles.pressed]}>
    {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>{label}</Text>}
  </Pressable>;
}

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="link" onPress={onPress} hitSlop={8}><Text style={styles.link}>{label}</Text></Pressable>;
}

export function Feedback({ message, kind = 'error' }: { message?: string | null; kind?: 'error' | 'success' | 'info' }) {
  if (!message) return null;
  return <View style={[styles.feedback, kind === 'success' && styles.feedbackSuccess, kind === 'info' && styles.feedbackInfo]}><Text style={[styles.feedbackText, kind === 'success' && styles.successText, kind === 'info' && styles.infoText]}>{message}</Text></View>;
}

export function LoadingScreen({ label = 'Đang tải...' }: { label?: string }) {
  return <SafeAreaView style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.subtitle}>{label}</Text></SafeAreaView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: colors.background }, shell: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xxl }, brand: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm }, logo: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }, brandText: { color: colors.text, fontSize: fontSizes.title, fontWeight: '700' },
  card: { backgroundColor: colors.surface, borderRadius: radii.large, padding: spacing.xl, borderWidth: 1, borderColor: colors.border }, title: { color: colors.text, fontSize: fontSizes.display, fontWeight: '700', textAlign: 'center' }, subtitle: { color: colors.textMuted, fontSize: fontSizes.body, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 }, form: { gap: spacing.lg, marginTop: spacing.xl }, field: { gap: spacing.sm }, label: { color: colors.text, fontSize: fontSizes.body, fontWeight: '600' }, input: { minHeight: touchTarget + 8, borderWidth: 1, borderColor: colors.border, borderRadius: radii.medium, paddingHorizontal: spacing.md, color: colors.text, backgroundColor: colors.surface, fontSize: fontSizes.bodyLarge }, inputError: { borderColor: colors.danger }, error: { color: colors.danger, fontSize: fontSizes.caption }, button: { minHeight: touchTarget + 8, borderRadius: radii.medium, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg }, dangerButton: { backgroundColor: colors.danger }, disabled: { opacity: 0.55 }, pressed: { backgroundColor: colors.primaryPressed }, buttonText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.bodyLarge }, link: { color: colors.primaryDark, textAlign: 'center', fontWeight: '600', minHeight: touchTarget, textAlignVertical: 'center' }, feedback: { borderRadius: radii.medium, padding: spacing.md, backgroundColor: '#FEF2F2' }, feedbackSuccess: { backgroundColor: '#ECFDF5' }, feedbackInfo: { backgroundColor: '#F0F9FF' }, feedbackText: { color: colors.danger, lineHeight: 20 }, successText: { color: '#047857' }, infoText: { color: '#0369A1' }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: colors.background },
});
