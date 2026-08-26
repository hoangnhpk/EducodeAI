import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, spacing } from '../../../shared/theme/tokens';

interface PaymentSupportModalProps {
  visible: boolean;
  sending: boolean;
  onSubmit: (lienLac: string, noiDung?: string) => void;
  onClose: () => void;
}

/** Form gửi yêu cầu admin hỗ trợ thanh toán (C5) — tương đương Swal form trên web. */
export const PaymentSupportModal: React.FC<PaymentSupportModalProps> = ({
  visible,
  sending,
  onSubmit,
  onClose,
}) => {
  const [lienLac, setLienLac] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [thieuLienLac, setThieuLienLac] = useState(false);

  useEffect(() => {
    if (!visible) {
      setLienLac('');
      setNoiDung('');
      setThieuLienLac(false);
    }
  }, [visible]);

  const handleSubmit = () => {
    const value = lienLac.trim();
    if (!value) {
      setThieuLienLac(true);
      return;
    }
    setThieuLienLac(false);
    onSubmit(value, noiDung.trim() || undefined);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Gửi yêu cầu admin hỗ trợ</Text>
          <Text style={styles.subtitle}>
            Nhập thông tin liên hệ để admin đối soát chuyển khoản giúp bạn.
          </Text>

          <Text style={styles.label}>SĐT / Zalo / Email *</Text>
          <TextInput
            style={[styles.input, thieuLienLac && styles.inputError]}
            placeholder="VD: 09xx... hoặc email"
            placeholderTextColor={colors.textMuted}
            value={lienLac}
            onChangeText={(text) => {
              setLienLac(text);
              if (thieuLienLac && text.trim()) setThieuLienLac(false);
            }}
            autoCorrect={false}
            autoCapitalize="none"
            editable={!sending}
          />
          {thieuLienLac && (
            <Text style={styles.errorText}>Vui lòng nhập thông tin liên lạc nhanh.</Text>
          )}

          <Text style={styles.label}>Mô tả ngắn (tùy chọn)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="VD: đã chuyển khoản lúc 20:30, nội dung CK..."
            placeholderTextColor={colors.textMuted}
            value={noiDung}
            onChangeText={setNoiDung}
            multiline
            numberOfLines={3}
            editable={!sending}
          />

          <View style={styles.btnRow}>
            <Pressable
              style={[styles.btn, styles.btnGhost, sending && styles.btnDisabled]}
              onPress={onClose}
              disabled={sending}
              accessibilityRole="button"
              accessibilityLabel="Hủy"
            >
              <Text style={styles.btnGhostText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary, sending && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={sending}
              accessibilityRole="button"
              accessibilityLabel="Gửi yêu cầu"
            >
              <Text style={styles.btnPrimaryText}>{sending ? 'Đang gửi...' : 'Gửi yêu cầu'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    zIndex: 1,
    elevation: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  title: {
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  input: {
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.caption,
    fontWeight: '600',
  },
  textarea: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  btn: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  btnGhost: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  btnGhostText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.body,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: fontSize.body,
  },
  btnDisabled: {
    opacity: 0.55,
  },
});
