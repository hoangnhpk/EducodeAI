import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../../shared/theme/tokens';

export function AuthShell({ title, description, children, footer }: React.PropsWithChildren<{ title: string; description: string; footer?: React.ReactNode }>) {
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.brand}>EDUCODE<Text style={styles.ai}>AI</Text></Text>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.content}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  brand: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.xl }, ai: { color: colors.primary },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' }, description: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: spacing.sm },
  content: { gap: spacing.lg, marginTop: spacing.xl }, footer: { marginTop: spacing.xl, alignItems: 'center' },
});
