import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
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
        <View style={styles.card}>
          <Text style={styles.title}>Gửi yêu cầu admin hỗ trợ?</Text>
          <TextInput
            style={[styles.input, thieuLienLac && styles.inputError]}
            placeholder="SĐT/Zalo/Email liên hệ nhanh"
            placeholderTextColor={colors.textMuted}
            value={lienLac}
            onChangeText={setLienLac}
            autoCorrect={false}
          />
          {thieuLienLac && (
            <Text style={styles.errorText}>Vui lòng nhập thông tin liên lạc nhanh.</Text>
          )}
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Mô tả ngắn (tùy chọn)"
            placeholderTextColor={colors.textMuted}
            value={noiDung}
            onChangeText={setNoiDung}
            multiline
            numberOfLines={3}
          />
          <View style={styles.btnRow}>
            <AnimatedPressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={styles.btnGhostText}>Hủy</Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[styles.btn, styles.btnPrimary, sending && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={sending}
            >
              <Text style={styles.btnPrimaryText}>
                {sending ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Text>
            </AnimatedPressable>
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
    padding: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
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
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.caption,
    marginTop: -spacing.sm,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btn: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnGhostText: {
    color: colors.text,
    fontWeight: '700',
  },
  btnPrimary: {
    backgroundColor: colors.warning,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
  },
});
