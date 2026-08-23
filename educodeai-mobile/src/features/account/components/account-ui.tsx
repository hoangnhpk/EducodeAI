import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const accountColors = {
  primary: '#F69050',
  primaryLight: '#FEF3EC',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#10B981',
};

export function AccountScreen({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" hitSlop={10} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={accountColors.text} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function StateMessage({ loading, message, onRetry }: { loading?: boolean; message: string; onRetry?: () => void }) {
  return (
    <View style={styles.state} accessibilityLiveRegion="polite">
      {loading ? <ActivityIndicator size="large" color={accountColors.primary} /> : <Ionicons name="alert-circle-outline" size={44} color={accountColors.muted} />}
      <Text style={styles.stateText}>{message}</Text>
      {!loading && onRetry ? <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Thử lại</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: accountColors.background },
  header: { height: 68, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: accountColors.card, borderBottomWidth: 1, borderBottomColor: accountColors.border },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 44 },
  title: { color: accountColors.text, fontSize: 20, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 48, flexGrow: 1 },
  state: { flex: 1, minHeight: 320, justifyContent: 'center', alignItems: 'center', padding: 24 },
  stateText: { color: accountColors.muted, textAlign: 'center', marginTop: 12, lineHeight: 21 },
  retry: { backgroundColor: accountColors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 18 },
  retryText: { color: '#fff', fontWeight: '800' },
});
