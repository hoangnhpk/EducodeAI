import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, shadow, spacing } from '../../../shared/theme/tokens';
import { CommerceService, docLoiBackend } from '../services/commerce.service';
import type { GiftQrDTO, PurchaseInfoDTO, QrPaymentDTO } from '../types';
import { ErrorState, LoadingState } from '../components/state-views';
import { FALLBACK_COURSE_IMAGE, resolveCourseImage } from '../services/media-url';
import { formatGiaKhoaHoc, laKhoaHocMienPhi } from '../utils/format-gia';
import { usePaymentPolling } from '../hooks/use-payment-polling';
import { VoucherSheet } from '../components/voucher-sheet';
import { PaymentSupportModal } from '../components/payment-support-modal';

/** Sau khi mở QR, chờ 20s mới cho bấm "Báo admin hỗ trợ" (giống web). */
const SUPPORT_UNLOCK_SECONDS = 20;

export default function CheckoutScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const maKhoaHoc = Number(courseId);

  const [info, setInfo] = useState<PurchaseInfoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [maVoucher, setMaVoucher] = useState('');
  const [showVoucherSheet, setShowVoucherSheet] = useState(false);

  const [buying, setBuying] = useState(false);
  const [creatingGift, setCreatingGift] = useState(false);
  const [qrData, setQrData] = useState<QrPaymentDTO | null>(null);
  const [giftData, setGiftData] = useState<GiftQrDTO | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftActivated, setGiftActivated] = useState(false);

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportCountdown, setSupportCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatedRef = useRef(false);

  const loadInfo = useCallback(async () => {
    if (!maKhoaHoc) return;
    setError(null);
    try {
      const data = await CommerceService.layThongTinMua(maKhoaHoc);
      setInfo(data);
    } catch (e) {
      setError(docLoiBackend(e, 'Không thể tải thông tin mua khóa học.'));
    }
  }, [maKhoaHoc]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadInfo();
      setLoading(false);
    })();
  }, [loadInfo]);

  // Đếm ngược mở nút hỗ trợ khi modal thanh toán mở.
  const paymentModalOpen = (showQrModal && !!qrData) || (showGiftModal && !!giftData);
  useEffect(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (!paymentModalOpen) {
      setSupportCountdown(0);
      return;
    }
    const unlockAt = Date.now() + SUPPORT_UNLOCK_SECONDS * 1000;
    const tick = () => {
      const remain = Math.max(0, Math.ceil((unlockAt - Date.now()) / 1000));
      setSupportCountdown(remain);
      if (remain <= 0 && countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [paymentModalOpen]);

  const goLearn = useCallback(() => {
    if (navigatedRef.current || !info) return;
    navigatedRef.current = true;
    router.replace(`/khoa-hoc/hoc/${info.maKhoaHoc}`);
  }, [info, router]);

  // C2: polling trạng thái thanh toán QR — dừng khi background/unmount, resume foreground.
  usePaymentPolling({
    enabled: showQrModal && !!qrData,
    check: async () => {
      if (!qrData) return true;
      const trangThai = await CommerceService.kiemTraTrangThaiThanhToan(qrData.maDonHang);
      if (trangThai.daMoKhoaHoc || trangThai.trangThaiDonHang === 'PAID') {
        setShowQrModal(false);
        Alert.alert('Thành công', 'Hệ thống đã nhận thanh toán, khóa học đã mở.', [
          { text: 'Vào học ngay', onPress: goLearn },
        ]);
        return true;
      }
      return false;
    },
  });

  // Polling trạng thái mã quà tặng cùng rule.
  usePaymentPolling({
    enabled: showGiftModal && !!giftData && !giftActivated,
    check: async () => {
      if (!giftData) return true;
      const trangThai = await CommerceService.kiemTraTrangThaiMaQuaTang(giftData.maDonHang);
      if (trangThai.sanSangSuDung) {
        setGiftActivated(true);
        Alert.alert(
          'Thành công',
          'Mã quà tặng đã được kích hoạt. Bạn có thể gửi code cho người nhận.'
        );
        return true;
      }
      return false;
    },
  });

  const xuLyMuaNgay = async () => {
    if (!info || buying) return;
    try {
      setBuying(true);
      navigatedRef.current = false;

      // Khóa miễn phí: đăng ký ngay, không cần QR.
      if (info.laMienPhi || laKhoaHocMienPhi(info.donViTienTe)) {
        const ketQua = await CommerceService.muaNgay(info.maKhoaHoc);
        if (ketQua.thanhCong || ketQua.daMua) {
          Alert.alert('Thành công', ketQua.thongBao || 'Đăng ký khóa học miễn phí thành công.', [
            { text: 'Vào học ngay', onPress: goLearn },
          ]);
        } else {
          Alert.alert('Thất bại', ketQua.thongBao);
        }
        return;
      }

      const duLieuQr = await CommerceService.taoMaQrThanhToan(info.maKhoaHoc, maVoucher);
      setQrData(duLieuQr);
      setShowQrModal(true);
    } catch (e) {
      Alert.alert('Thất bại', docLoiBackend(e, 'Mua khóa học thất bại.'));
    } finally {
      setBuying(false);
    }
  };

  const xuLyTaoMaQuaTang = async () => {
    if (!info || creatingGift) return;
    try {
      setCreatingGift(true);
      setGiftActivated(false);
      const gift = await CommerceService.taoMaQuaTang(info.maKhoaHoc, maVoucher);
      setGiftData(gift);
      setShowGiftModal(true);
    } catch (e) {
      Alert.alert('Lỗi', docLoiBackend(e, 'Không thể tạo mã quà tặng.'));
    } finally {
      setCreatingGift(false);
    }
  };

  const guiYeuCauHoTro = async (lienLac: string, noiDung?: string) => {
    const maDonHang = showQrModal ? qrData?.maDonHang : giftData?.maDonHang;
    if (!maDonHang) return;
    try {
      setSendingSupport(true);
      await CommerceService.taoYeuCauHoTro(maDonHang, lienLac, noiDung);
      setShowSupportModal(false);
      setShowQrModal(false);
      setShowGiftModal(false);
      Alert.alert(
        'Đã gửi',
        'Admin đã nhận yêu cầu hỗ trợ của bạn. Vui lòng giữ lại nội dung chuyển khoản để đối soát.'
      );
    } catch (e) {
      Alert.alert('Lỗi', docLoiBackend(e, 'Không gửi được yêu cầu hỗ trợ lúc này.'));
    } finally {
      setSendingSupport(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LoadingState message="Đang tải thông tin mua khóa học..." />
      </SafeAreaView>
    );
  }

  if (error || !info) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState message={error ?? 'Không tìm thấy khóa học.'} onRetry={() => void loadInfo()} />
      </SafeAreaView>
    );
  }

  const isFree = info.laMienPhi || laKhoaHocMienPhi(info.donViTienTe);

  const renderPaymentModal = (
    visible: boolean,
    onClose: () => void,
    data: { duongDanAnhQr: string; soTienCanThanhToan: number; donViTienTe: string; noiDungChuyenKhoan: string } | null,
    title: string,
    subtitle: string
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSub}>{subtitle}</Text>

          {!!data && (
            <>
              <Image
                source={{ uri: data.duongDanAnhQr }}
                style={styles.qrImage}
                contentFit="contain"
              />
              <View style={styles.payInfoBox}>
                <View style={styles.payInfoRow}>
                  <Text style={styles.payInfoLabel}>Số tiền</Text>
                  <Text style={styles.payInfoValue}>
                    {formatGiaKhoaHoc(data.soTienCanThanhToan, data.donViTienTe)}
                  </Text>
                </View>
                <View style={styles.payInfoRow}>
                  <Text style={styles.payInfoLabel}>Nội dung CK</Text>
                  <Text style={[styles.payInfoValue, { color: colors.primary }]} selectable>
                    {data.noiDungChuyenKhoan}
                  </Text>
                </View>
              </View>
            </>
          )}

          <Text style={styles.modalHint}>
            Sau 30 giây chuyển khoản thành công mà không thấy hệ thống cập nhật, hãy bấm nút báo
            admin hỗ trợ.
          </Text>

          <View style={styles.modalBtnRow}>
            <AnimatedPressable
              style={[
                styles.modalBtn,
                styles.supportBtn,
                (sendingSupport || supportCountdown > 0) && { opacity: 0.5 },
              ]}
              disabled={sendingSupport || supportCountdown > 0}
              onPress={() => setShowSupportModal(true)}
            >
              <Text style={styles.supportBtnText}>
                {supportCountdown > 0
                  ? `Báo admin hỗ trợ (${supportCountdown}s)`
                  : 'Báo admin hỗ trợ'}
              </Text>
            </AnimatedPressable>
            <AnimatedPressable style={[styles.modalBtn, styles.closeBtn]} onPress={onClose}>
              <Text style={styles.closeBtnText}>Đóng</Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <AnimatedPressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.topBarTitle}>Mua khóa học</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.courseCard}>
          {!!info.hinhAnh && (
            <Image
              source={{ uri: resolveCourseImage(info.hinhAnh) || FALLBACK_COURSE_IMAGE }}
              style={styles.courseThumb}
              contentFit="cover"
            />
          )}
          <Text style={styles.courseName}>{info.tenKhoaHoc}</Text>
          {!!info.moTa && (
            <Text style={styles.courseDesc} numberOfLines={3}>
              {info.moTa}
            </Text>
          )}
          <View style={styles.priceBox}>
            <View>
              <Text style={styles.priceLabel}>Giá khóa học</Text>
              <Text style={[styles.priceValue, isFree && { color: colors.success }]}>
                {formatGiaKhoaHoc(info.giaKhoaHoc, info.donViTienTe)}
              </Text>
            </View>
            <View style={styles.marketBadge}>
              <Text style={styles.marketBadgeText}>Marketplace</Text>
            </View>
          </View>
        </View>

        {!isFree && !info.daMua && (
          <AnimatedPressable style={styles.voucherRow} onPress={() => setShowVoucherSheet(true)}>
            <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
            <Text style={styles.voucherText}>
              {maVoucher ? `Mã giảm giá: ${maVoucher}` : 'Nhập mã giảm giá (nếu có)'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </AnimatedPressable>
        )}

        {info.daMua ? (
          <AnimatedPressable style={[styles.mainBtn, { backgroundColor: colors.success }]} onPress={goLearn}>
            <Ionicons name="play-circle" size={20} color="#fff" />
            <Text style={styles.mainBtnText}>Bạn đã mua khóa học — Vào học ngay</Text>
          </AnimatedPressable>
        ) : isFree ? (
          <AnimatedPressable
            style={[
              styles.mainBtn,
              { backgroundColor: colors.success },
              (buying || !info.choPhepMua) && styles.btnDisabled,
            ]}
            disabled={buying || !info.choPhepMua}
            onPress={() => void xuLyMuaNgay()}
          >
            <Text style={styles.mainBtnText}>
              {buying ? 'Đang đăng ký...' : 'Học miễn phí ngay'}
            </Text>
          </AnimatedPressable>
        ) : (
          <View style={styles.btnGroup}>
            <AnimatedPressable
              style={[styles.mainBtn, (buying || !info.choPhepMua) && styles.btnDisabled]}
              disabled={buying || !info.choPhepMua}
              onPress={() => void xuLyMuaNgay()}
            >
              <Ionicons name="qr-code-outline" size={20} color="#fff" />
              <Text style={styles.mainBtnText}>
                {buying ? 'Đang tạo mã QR...' : 'Thanh toán khóa học'}
              </Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[styles.giftBtn, (creatingGift || !info.choPhepMua) && styles.btnDisabled]}
              disabled={creatingGift || !info.choPhepMua}
              onPress={() => void xuLyTaoMaQuaTang()}
            >
              <Ionicons name="gift-outline" size={20} color={colors.success} />
              <Text style={styles.giftBtnText}>
                {creatingGift ? 'Đang tạo mã quà...' : 'Tặng khóa học bằng mã code'}
              </Text>
            </AnimatedPressable>
          </View>
        )}

        {!info.choPhepMua && !info.daMua && (
          <Text style={styles.unavailableText}>Khóa học hiện chưa mở bán.</Text>
        )}
      </ScrollView>

      {renderPaymentModal(
        showQrModal,
        () => setShowQrModal(false),
        qrData,
        'Quét mã để thanh toán',
        'Hệ thống tự kiểm tra trạng thái mỗi 3 giây sau khi tiền về.'
      )}

      {renderPaymentModal(
        showGiftModal,
        () => setShowGiftModal(false),
        giftData,
        giftData ? `Mã quà tặng: ${giftData.code}` : 'Mã quà tặng',
        giftActivated
          ? 'Mã đã kích hoạt — gửi code cho người nhận để họ nhập tại mục Quà tặng.'
          : 'Thanh toán xong, mã sẽ tự kích hoạt để người nhận nhập.'
      )}

      <VoucherSheet
        visible={showVoucherSheet}
        initialCode={maVoucher}
        onApply={setMaVoucher}
        onClose={() => setShowVoucherSheet(false)}
      />

      <PaymentSupportModal
        visible={showSupportModal}
        sending={sendingSupport}
        onSubmit={(lienLac, noiDung) => void guiYeuCauHoTro(lienLac, noiDung)}
        onClose={() => setShowSupportModal(false)}
      />
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
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  courseThumb: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  courseName: {
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  courseDesc: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  priceLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  priceValue: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.primary,
  },
  marketBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.warning,
  },
  marketBadgeText: {
    fontSize: fontSize.caption,
    fontWeight: '800',
    color: colors.text,
  },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  voucherText: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
  btnGroup: {
    gap: spacing.md,
  },
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH_TARGET + 6,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  mainBtnText: {
    color: '#fff',
    fontSize: fontSize.bodyLg,
    fontWeight: '800',
  },
  giftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH_TARGET + 6,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.success,
    backgroundColor: colors.surface,
  },
  giftBtnText: {
    color: colors.success,
    fontSize: fontSize.bodyLg,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  unavailableText: {
    color: colors.danger,
    fontSize: fontSize.caption,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  modalSub: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  qrImage: {
    alignSelf: 'center',
    width: 240,
    height: 240,
    backgroundColor: colors.background,
  },
  payInfoBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  payInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  payInfoLabel: {
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  payInfoValue: {
    fontSize: fontSize.body,
    fontWeight: '800',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  modalHint: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalBtn: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  supportBtn: {
    flex: 1,
    backgroundColor: colors.warning,
  },
  supportBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: fontSize.body,
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeBtnText: {
    color: colors.text,
    fontWeight: '700',
  },
});
