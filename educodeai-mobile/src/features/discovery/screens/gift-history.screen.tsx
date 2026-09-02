import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, shadow, spacing } from '../../../shared/theme/tokens';
import { CommerceService, docLoiBackend } from '../services/commerce.service';
import type { GiftHistoryItemDTO } from '../types';
import { EmptyState, ErrorState, LoadingState } from '../components/state-views';
import { formatGiaKhoaHoc } from '../utils/format-gia';

/** Map trạng thái mã quà tặng → nhãn + màu (giống LichSuMaQuaTang web). */
const trangThaiHienThi = (trangThai: string): { label: string; color: string } => {
  const key = (trangThai || '').toUpperCase();
  if (key === 'PENDING_PAYMENT') return { label: 'Chờ thanh toán', color: colors.textMuted };
  if (key === 'ACTIVE') return { label: 'Đã kích hoạt', color: colors.success };
  if (key === 'REDEEMED') return { label: 'Đã được sử dụng', color: colors.info };
  if (key === 'EXPIRED') return { label: 'Hết hạn', color: colors.danger };
  return { label: trangThai, color: colors.text };
};

const fmtDate = (value?: string) => {
  if (!value) return '--';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleString('vi-VN');
};

const GiftItem = ({ item }: { item: GiftHistoryItemDTO }) => {
  const status = trangThaiHienThi(item.trangThai);

  const copyCode = async () => {
    await Clipboard.setStringAsync(item.code);
    Alert.alert('Đã copy', 'Mã quà tặng đã được copy.');
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.courseName} numberOfLines={2}>
          {item.tenKhoaHoc}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${status.color}18` }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <AnimatedPressable style={styles.codeRow} onPress={() => void copyCode()}>
        <Text style={styles.codeText} numberOfLines={1}>
          {item.code}
        </Text>
        <Ionicons name="copy-outline" size={16} color={colors.primary} />
      </AnimatedPressable>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {formatGiaKhoaHoc(item.soTien, item.donViTienTe)} · Đơn #{item.maDonHang}
        </Text>
        <Text style={styles.metaText}>{fmtDate(item.createdAt)}</Text>
      </View>

      {!!item.tenNguoiNhan && (
        <Text style={styles.receiverText}>
          Người nhận: {item.tenNguoiNhan}
          {item.redeemedAt ? ` · ${fmtDate(item.redeemedAt)}` : ''}
        </Text>
      )}
    </View>
  );
};

export default function GiftHistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<GiftHistoryItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const data = await CommerceService.layLichSuMaQuaTang();
      setItems(data ?? []);
    } catch (e) {
      setError(docLoiBackend(e, 'Không tải được lịch sử mã quà tặng.'));
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    })();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.topBarTitle}>Lịch sử mã quà tặng</Text>
      </View>

      {loading ? (
        <LoadingState message="Đang tải lịch sử..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void onRefresh()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.maQuaTang)}
          renderItem={({ item }) => <GiftItem item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="gift-outline"
              title="Chưa có mã quà tặng nào"
              message="Khi bạn mua khóa học làm quà tặng, mã sẽ hiển thị tại đây."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: fontSize.bodyLg,
    fontWeight: '700',
    color: colors.text,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  courseName: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  codeText: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metaText: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  receiverText: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
});
