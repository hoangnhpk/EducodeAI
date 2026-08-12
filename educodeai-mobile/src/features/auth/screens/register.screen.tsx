import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '../../../shared/theme/tokens';
import { AuthBanner } from '../components/auth-banner';
import { AuthField } from '../components/auth-field';
import { AuthShell } from '../components/auth-shell';
import { CaptchaInput } from '../components/captcha-input';
import { OtpField } from '../components/otp-field';
import { PasswordField } from '../components/password-field';
import { PrimaryButton } from '../components/primary-button';
import { authErrorMessage, authUiAdapter } from '../services/auth-ui.adapter';
import { emailError, matchingPasswordError, passwordError, required } from '../utils/auth-validation';

type Form = { fullName: string; email: string; password: string; confirm: string; captchaToken: string };
type FormErrors = Partial<Record<keyof Form | 'otp', string>>;

export function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState<Form>({ fullName: '', email: '', password: '', confirm: '', captchaToken: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const update = (key: keyof Form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    const nextErrors: FormErrors = {
      fullName: required(form.fullName, 'Họ tên'),
      email: emailError(form.email),
      password: passwordError(form.password),
      confirm: matchingPasswordError(form.password, form.confirm),
      captchaToken: required(form.captchaToken, 'CAPTCHA'),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setLoading(true);
    setApiError(undefined);
    try {
      await authUiAdapter.requestRegistration({ fullName: form.fullName.trim(), email: form.email.trim(), password: form.password, captchaToken: form.captchaToken });
      setStep('otp');
    } catch (caught) {
      setApiError(authErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: 'Mã OTP phải gồm 6 chữ số.' });
      return;
    }
    setLoading(true);
    setApiError(undefined);
    try {
      await authUiAdapter.confirmRegistration(form.email, otp);
      router.replace('/(auth)/login');
    } catch (caught) {
      setApiError(authErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <AuthShell title="Xác minh đăng ký" description={`Nhập mã OTP đã gửi tới ${form.email}.`}>
        <AuthBanner message={apiError} />
        <OtpField value={otp} onChangeText={setOtp} error={errors.otp} />
        <PrimaryButton label="Hoàn tất đăng ký" loading={loading} disabled={otp.length !== 6} onPress={confirm} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Đăng ký học viên" description="Tạo tài khoản để bắt đầu hành trình học tập." footer={<Pressable accessibilityRole="link" onPress={() => router.back()}><Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text></Pressable>}>
      <AuthBanner message={apiError} />
      <AuthField label="Họ và tên" value={form.fullName} autoComplete="name" error={errors.fullName} onChangeText={update('fullName')} />
      <AuthField label="Email" value={form.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email} onChangeText={update('email')} />
      <PasswordField value={form.password} autoComplete="new-password" error={errors.password} onChangeText={update('password')} />
      <PasswordField label="Xác nhận mật khẩu" value={form.confirm} error={errors.confirm} onChangeText={update('confirm')} />
      <CaptchaInput token={form.captchaToken} onTokenChange={update('captchaToken')} error={errors.captchaToken} />
      <PrimaryButton label="Đăng ký" loading={loading} onPress={submit} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primaryPressed, fontWeight: '700', minHeight: 44, paddingVertical: spacing.md },
});
