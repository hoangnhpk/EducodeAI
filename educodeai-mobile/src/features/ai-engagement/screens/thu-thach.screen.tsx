import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import {
  BangXepHangItem,
  BangXepHangResponse,
  DanhHieu,
  LoaiBangXepHang,
  NhiemVuThuThach,
  ThuThachService,
  ThuThachTuanResponse,
} from '../services/thu-thach.service';
import { DanhHieuBadge } from '../components/danh-hieu-badge';
import { layStyleDanhHieu } from '../components/danh-hieu-theme';

const COLORS = {
  primary: '#fb873f',
  primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  success: '#10b981',
  gold: '#fbbf24',
  lightGray: '#e2e8f0',
  primaryLight: '#fff3ed',
};

const SHADOWS = {
  small: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  glow: {
    shadowColor: '#fb873f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
};

function formatExp(n: number) {
  return n.toLocaleString('vi-VN');
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? 'H';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase();
}

function medalColor(hang: number) {
  if (hang === 1) return '#f59e0b';
  if (hang === 2) return '#94a3b8';
  if (hang === 3) return '#b45309';
  return COLORS.gray;
}

export default function ThuThachScreen() {
  const router = useRouter();
  const segments = useSegments() as string[];
  const inTabs = segments.includes('(tabs)');

  const [activeTab, setActiveTab] = useState<'nhiem-vu' | 'bxh'>('nhiem-vu');
  const [data, setData] = useState<ThuThachTuanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);

  const [bxhLoai, setBxhLoai] = useState<LoaiBangXepHang>('tuan');
  const [bxh, setBxh] = useState<BangXepHangResponse | null>(null);
  const [bxhLoading, setBxhLoading] = useState(false);

  const fetchNhiemVu = useCallback(async () => {
    setLoading(true);
    try {
      const next = await ThuThachService.getThuThachTuan();
      setData(next);
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number; data?: { message?: string } } })?.response
        ?.status;
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 401) {
        Alert.alert('Lỗi', 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        Alert.alert('Lỗi', msg || 'Không thể lấy danh sách nhiệm vụ');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBxh = useCallback(async (loai: LoaiBangXepHang) => {
    setBxhLoading(true);
    try {
      const next =
        loai === 'toan_web'
          ? await ThuThachService.getBangXepHangToanWeb()
          : await ThuThachService.getBangXepHang();
      setBxh(next);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      Alert.alert('Lỗi', msg || 'Không tải được bảng xếp hạng');
      setBxh(null);
    } finally {
      setBxhLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'nhiem-vu') void fetchNhiemVu();
    else void fetchBxh(bxhLoai);
  }, [activeTab, bxhLoai, fetchNhiemVu, fetchBxh]);

  const handleNhanThuong = async (id: number) => {
    try {
      setClaiming(id);
      const res = await ThuThachService.nhanThuong(id);
      if (res.bangNhiemVu) setData(res.bangNhiemVu);
      else await fetchNhiemVu();
      if (res.danhHieuMoiMoKhoa) {
        Alert.alert('Mở khóa danh hiệu!', res.danhHieuMoiMoKhoa);
      } else {
        Alert.alert('Thành công', res.message || `Đã nhận +${res.expNhanDuoc} EXP!`);
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      Alert.alert('Lỗi', msg || 'Không thể nhận thưởng');
    } finally {
      setClaiming(null);
    }
  };

  const handleDeoDanhHieu = (dh: DanhHieu) => {
    if (!dh.daMoKhoa || dh.dangDeo || !data) return;
    Alert.alert('Đeo danh hiệu', `Đeo "${dh.tenDanhHieu}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đeo',
        onPress: () => {
          void (async () => {
            const prev = data;
            setData({
              ...data,
              huyHieuHienTai: dh.tenDanhHieu,
              maDanhHieuDangDeo: dh.maDanhHieu,
              danhSachDanhHieu: data.danhSachDanhHieu.map((x) => ({
                ...x,
                dangDeo: x.maDanhHieu === dh.maDanhHieu,
              })),
            });
            try {
              const next = await ThuThachService.doiDanhHieu(dh.maDanhHieu);
              setData(next);
            } catch {
              setData(prev);
              Alert.alert('Lỗi', 'Không thể đổi danh hiệu.');
            }
          })();
        },
      },
    ]);
  };

  const maCodeHienTai =
    data?.danhSachDanhHieu.find((d) => d.dangDeo)?.maCode ??
    data?.danhSachDanhHieu.find((d) => d.maDanhHieu === data.maDanhHieuDangDeo)?.maCode ??
    'tan_binh';

  const renderHero = () => (
    <View style={[styles.statsBar, SHADOWS.medium]}>
      <View style={styles.statItem}>
        <View style={styles.statBadgeWrap}>
          <DanhHieuBadge maCode={maCodeHienTai} size={40} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.statLabel}>Huy hiệu hiện tại</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            {data?.huyHieuHienTai || 'Tân binh học tập'}
          </Text>
        </View>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <View style={[styles.statIconWrap, { backgroundColor: '#fef3c7' }]}>
          <Ionicons name="star" size={18} color="#d97706" />
        </View>
        <View>
          <Text style={styles.statLabel}>Tổng điểm EXP</Text>
          <Text style={styles.statValue}>{formatExp(data?.tongExp ?? 0)}</Text>
        </View>
      </View>
    </View>
  );

  const renderDanhHieu = () => {
    const list = data?.danhSachDanhHieu ?? [];
    if (list.length === 0) return null;
    const unlocked = list.filter((d) => d.daMoKhoa).length;
    const nextLocked = list.find((d) => !d.daMoKhoa);
    const tongExp = data?.tongExp ?? 0;
    const expTruoc = [...list].reverse().find((d) => d.expYeuCau <= tongExp)?.expYeuCau ?? 0;
    const expKe = nextLocked?.expYeuCau ?? expTruoc;
    const phanTramKe = nextLocked
      ? Math.min(100, Math.round(((tongExp - expTruoc) / Math.max(expKe - expTruoc, 1)) * 100))
      : 100;

    return (
      <View style={styles.titlesSection}>
        <Text style={styles.sectionTitle}>Kho danh hiệu</Text>
        <Text style={styles.sectionSub}>
          Đã mở khóa <Text style={styles.sectionSubStrong}>{unlocked}/{list.length}</Text> — chọn danh
          hiệu để đeo hiển thị
        </Text>

        {nextLocked && (
          <View style={styles.nextTrackWrap}>
            <Text style={styles.nextTrackLabel}>
              ★ Còn {formatExp(Math.max(0, nextLocked.expYeuCau - tongExp))} EXP tới «
              {nextLocked.tenDanhHieu}»
            </Text>
            <View style={styles.nextTrack}>
              <View style={[styles.nextTrackFill, { width: `${phanTramKe}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.titleGrid}>
          {list.map((dh) => {
            const palette = layStyleDanhHieu(dh.maCode);
            const locked = !dh.daMoKhoa;
            const equipped = dh.dangDeo;
            return (
              <AnimatedPressable
                key={dh.maDanhHieu}
                containerStyle={styles.titleCardContainer}
                style={[
                  styles.titleCard,
                  { backgroundColor: palette.bg },
                  equipped && {
                    borderColor: palette.accent,
                    borderWidth: 2,
                    shadowColor: palette.accent,
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 3,
                  },
                  locked && styles.titleCardLocked,
                ]}
                onPress={() => handleDeoDanhHieu(dh)}
                disabled={locked || equipped}
              >
                {equipped && (
                  <View style={[styles.titleChip, { backgroundColor: palette.accent }]}>
                    <Text style={styles.titleChipText}>Đang đeo</Text>
                  </View>
                )}
                {!locked && !equipped && (
                  <View style={[styles.titleChip, { backgroundColor: palette.glow }]}>
                    <Text style={[styles.titleChipText, { color: palette.icon }]}>Chọn đeo</Text>
                  </View>
                )}

                <View style={styles.titleMedal}>
                  <DanhHieuBadge maCode={dh.maCode} size={52} locked={locked} />
                  {locked && (
                    <View style={styles.titleLock}>
                      <Ionicons name="lock-closed" size={16} color="#475569" />
                    </View>
                  )}
                </View>

                <Text style={[styles.titleName, { color: locked ? COLORS.gray : '#1e3a5f' }]}>
                  {dh.tenDanhHieu}
                </Text>
                <Text style={[styles.titleExp, { color: palette.accent }]}>
                  {formatExp(dh.expYeuCau)} EXP
                </Text>
                {!!dh.moTa && (
                  <Text style={styles.titleDesc} numberOfLines={2}>
                    {dh.moTa}
                  </Text>
                )}
              </AnimatedPressable>
            );
          })}
        </View>
      </View>
    );
  };

  const renderNhiemVuList = (nhiemVus: NhiemVuThuThach[]) => (
    <View>
      <Text style={styles.sectionTitle}>Nhiệm vụ tuần này</Text>
      {nhiemVus.length === 0 ? (
        <Text style={styles.emptyText}>Tuần này chưa có nhiệm vụ.</Text>
      ) : (
        nhiemVus.map((nv) => {
          const isDone = nv.trangThai !== 'in_progress';
          const busy = claiming === nv.maMau;
          return (
            <View key={nv.maMau} style={[styles.nvCard, SHADOWS.small]}>
              <View style={styles.nvHeader}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: isDone ? '#dcfce7' : COLORS.primaryLight },
                  ]}
                >
                  <Ionicons
                    name={isDone ? 'checkmark' : 'star'}
                    size={20}
                    color={isDone ? COLORS.success : COLORS.primary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.nvTitle}>{nv.tieuDe}</Text>
                  <Text style={styles.nvDesc}>
                    Tiến độ: {nv.giaTriHienTai} / {nv.chiTieu}
                  </Text>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Text style={styles.tagXP}>+{nv.expThuong} EXP</Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min((nv.giaTriHienTai / Math.max(nv.chiTieu, 1)) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
              {!isDone ? (
                <View style={styles.btnDone}>
                  <Text style={styles.btnDoneText}>Đang làm</Text>
                </View>
              ) : nv.trangThai === 'completed' ? (
                <AnimatedPressable
                  style={styles.btnActionWrapper}
                  onPress={() => void handleNhanThuong(nv.maMau)}
                  disabled={busy}
                >
                  <LinearGradient colors={['#10b981', '#059669']} style={styles.btnAction}>
                    <Text style={styles.btnActionText}>{busy ? 'Đang nhận...' : 'Nhận thưởng'}</Text>
                  </LinearGradient>
                </AnimatedPressable>
              ) : (
                <View style={styles.btnDone}>
                  <Text style={styles.btnDoneText}>Đã nhận</Text>
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );

  const renderNhiemVu = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
    }
    return (
      <View>
        {renderHero()}
        {renderNhiemVuList(data?.danhSachNhiemVu ?? [])}
        {renderDanhHieu()}
      </View>
    );
  };

  const renderBxhRow = (item: BangXepHangItem) => {
    const maCode = item.maCodeDanhHieu || 'tan_binh';
    const palette = layStyleDanhHieu(maCode);
    const hasBadge = Boolean(item.maCodeDanhHieu);

    return (
      <View
        key={`${item.maNguoiDung}-${item.hang}`}
        style={[styles.lbRow, SHADOWS.small, item.laToi && styles.lbRowMe]}
      >
        <View style={styles.lbRankSlot}>
          {hasBadge ? (
            <DanhHieuBadge maCode={maCode} size={28} />
          ) : (
            <Text style={[styles.lbRank, { color: medalColor(item.hang) }]}>#{item.hang}</Text>
          )}
        </View>
        <View style={styles.lbAvatar}>
          <Text style={styles.lbAvatarText}>{initials(item.hoTen)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.lbName} numberOfLines={1}>
            {item.hoTen}
            {item.laToi ? ' (Bạn)' : ''}
          </Text>
          <Text
            style={[styles.lbTitle, hasBadge && { color: palette.accent, fontWeight: '700' }]}
            numberOfLines={1}
          >
            {item.tenDanhHieu || 'Chưa có danh hiệu'}
          </Text>
        </View>
        <View style={styles.lbSide}>
          {hasBadge && <Text style={styles.lbHangHint}>#{item.hang}</Text>}
          <Text style={styles.lbExp}>{formatExp(item.exp)} EXP</Text>
        </View>
      </View>
    );
  };

  const renderBxh = () => {
    if (bxhLoading) {
      return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
    }

    return (
      <View>
        <View style={styles.bxhToggle}>
          <AnimatedPressable
            containerStyle={styles.bxhToggleBtnContainer}
            style={[styles.bxhToggleBtn, bxhLoai === 'tuan' && styles.bxhToggleActive]}
            onPress={() => setBxhLoai('tuan')}
          >
            <Text style={[styles.bxhToggleText, bxhLoai === 'tuan' && styles.bxhToggleTextActive]}>
              Tuần này
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            containerStyle={styles.bxhToggleBtnContainer}
            style={[styles.bxhToggleBtn, bxhLoai === 'toan_web' && styles.bxhToggleActive]}
            onPress={() => setBxhLoai('toan_web')}
          >
            <Text
              style={[styles.bxhToggleText, bxhLoai === 'toan_web' && styles.bxhToggleTextActive]}
            >
              Toàn hệ thống
            </Text>
          </AnimatedPressable>
        </View>

        <View style={[styles.myRankCard, SHADOWS.medium]}>
          <Ionicons name="trophy" size={28} color={COLORS.gold} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.myRankLabel}>Hạng của bạn</Text>
            <Text style={styles.myRankValue}>
              {bxh?.hangCuaToi != null ? `#${bxh.hangCuaToi}` : 'Chưa xếp hạng'}
              {' · '}
              {formatExp(bxh?.expCuaToi ?? 0)} EXP
            </Text>
          </View>
        </View>

        {(bxh?.danhSach ?? []).length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="trophy-outline" size={56} color={COLORS.gold} />
            <Text style={styles.emptyText}>Chưa có dữ liệu bảng xếp hạng.</Text>
          </View>
        ) : (
          (bxh?.danhSach ?? []).map(renderBxhRow)
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        {inTabs ? (
          <View style={{ width: 44 }} />
        ) : (
          <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
          </AnimatedPressable>
        )}
        <Text style={styles.headerTitle}>Thử Thách & Danh Hiệu</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabContainer}>
        <AnimatedPressable
          containerStyle={styles.tabBtnContainer}
          style={[styles.tabBtn, activeTab === 'nhiem-vu' && styles.tabBtnActive]}
          onPress={() => setActiveTab('nhiem-vu')}
        >
          <Text style={[styles.tabText, activeTab === 'nhiem-vu' && styles.tabTextActive]}>
            Nhiệm Vụ
          </Text>
        </AnimatedPressable>
        <AnimatedPressable
          containerStyle={styles.tabBtnContainer}
          style={[styles.tabBtn, activeTab === 'bxh' && styles.tabBtnActive]}
          onPress={() => setActiveTab('bxh')}
        >
          <Text style={[styles.tabText, activeTab === 'bxh' && styles.tabTextActive]}>
            Bảng Xếp Hạng
          </Text>
        </AnimatedPressable>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'nhiem-vu' ? renderNhiemVu() : renderBxh()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    ...SHADOWS.small,
    zIndex: 10,
  },
  tabBtnContainer: { flex: 1 },
  tabBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '700', color: COLORS.gray, textAlign: 'center' },
  tabTextActive: { color: COLORS.primary, fontWeight: '900' },
  contentContainer: { flex: 1, padding: 20 },
  statsBar: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
    gap: 14,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statBadgeWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: { height: 1, backgroundColor: COLORS.lightGray },
  statLabel: { fontSize: 12, fontWeight: '600', color: COLORS.gray, marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '900', color: COLORS.dark },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e3a5f',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  sectionSub: { fontSize: 13, color: COLORS.gray, marginBottom: 12, lineHeight: 18 },
  sectionSubStrong: { color: COLORS.dark, fontWeight: '800' },
  emptyText: { color: COLORS.gray, marginTop: 12, textAlign: 'center' },
  titlesSection: {
    marginTop: 8,
    marginBottom: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  nextTrackWrap: { marginBottom: 14 },
  nextTrackLabel: { fontSize: 12, fontWeight: '700', color: '#ea580c', marginBottom: 8 },
  nextTrack: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 99,
    overflow: 'hidden',
  },
  nextTrackFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#ea580c',
  },
  nvCard: { backgroundColor: COLORS.white, padding: 20, borderRadius: 24, marginBottom: 15 },
  nvHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nvTitle: { fontSize: 17, fontWeight: '800', color: COLORS.dark },
  nvDesc: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
  tagXP: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginVertical: 15,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: COLORS.success },
  btnActionWrapper: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.glow },
  btnAction: { height: 48, justifyContent: 'center', alignItems: 'center' },
  btnActionText: { color: COLORS.white, fontWeight: '900', fontSize: 15 },
  btnDone: {
    height: 48,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDoneText: { color: COLORS.gray, fontWeight: '800', fontSize: 15 },
  titleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  titleCardContainer: {
    width: '48.5%',
  },
  titleCard: {
    borderRadius: 14,
    paddingTop: 28,
    paddingBottom: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 168,
  },
  titleCardLocked: { opacity: 0.92 },
  titleChip: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  titleChipText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  titleMedal: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  titleLock: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  titleName: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  titleExp: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
  titleDesc: { fontSize: 11, color: COLORS.gray, textAlign: 'center', lineHeight: 15 },
  bxhToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  bxhToggleBtnContainer: { flex: 1 },
  bxhToggleBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bxhToggleActive: { backgroundColor: COLORS.primaryLight },
  bxhToggleText: { fontSize: 13, fontWeight: '700', color: COLORS.gray, textAlign: 'center' },
  bxhToggleTextActive: { color: COLORS.primary, fontWeight: '900' },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  myRankLabel: { fontSize: 12, color: COLORS.gray, fontWeight: '700' },
  myRankValue: { fontSize: 16, fontWeight: '900', color: COLORS.dark, marginTop: 2 },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  lbRowMe: { borderWidth: 1.5, borderColor: COLORS.primary },
  lbRankSlot: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbRank: { fontWeight: '900', fontSize: 14 },
  lbAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lbAvatarText: { fontWeight: '900', color: COLORS.primary, fontSize: 13 },
  lbName: { fontSize: 14, fontWeight: '800', color: COLORS.dark },
  lbTitle: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  lbSide: { alignItems: 'flex-end', gap: 2 },
  lbHangHint: { fontSize: 11, fontWeight: '700', color: COLORS.gray },
  lbExp: { fontSize: 12, fontWeight: '800', color: '#d97706' },
});
