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
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, spacing } from '../../../shared/theme/tokens';

interface VoucherSheetProps {
  visible: boolean;
  initialCode?: string;
  onApply: (code: string) => void;
  onClose: () => void;
}

/** Bottom sheet nhập mã giảm giá — mỗi đơn chỉ dùng 1 mã (theo rule web). */
export const VoucherSheet: React.FC<VoucherSheetProps> = ({
  visible,
  initialCode = '',
  onApply,
  onClose,
}) => {
  const [code, setCode] = useState(initialCode);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <Text style={styles.title}>Mã giảm giá</Text>
            </View>
            <Text style={styles.hint}>
              Mỗi đơn chỉ dùng 1 mã, mã sẽ được đối soát khi thanh toán thành công.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã giảm giá"
              placeholderTextColor={colors.textMuted}
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={styles.btnRow}>
              <AnimatedPressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
                <Text style={styles.btnGhostText}>Đóng</Text>
              </AnimatedPressable>
              <AnimatedPressable
                style={[styles.btn, styles.btnPrimary]}
                onPress={() => {
                  onApply(code.trim());
                  onClose();
                }}
              >
                <Text style={styles.btnPrimaryText}>Áp dụng</Text>
              </AnimatedPressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.subtitle,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  input: {
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.bodyLg,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
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
    backgroundColor: colors.surface,
  },
  btnGhostText: {
    color: colors.text,
    fontWeight: '700',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
  },
});
