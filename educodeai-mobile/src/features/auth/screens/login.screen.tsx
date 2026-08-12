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
import { SecondaryButton } from '../components/secondary-button';
import { normalizeApiError } from '../../../shared/types/api-error';
import { useAuth } from '../hooks/use-auth';
import { authService } from '../services/auth.service';
import type { AuthFlowState, LoginClassification } from '../types/auth.types';
import { required } from '../utils/auth-validation';

type FieldErrors = { identifier?: string; password?: string; otp?: string; captcha?: string };

export function LoginScreen() {
  const router = useRouter();
  const { completeLogin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [flow, setFlow] = useState<AuthFlowState>({ step: 'credentials' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleOutcome = async (outcome: LoginClassification) => {
    if (outcome.kind === 'authenticated') {
      if (await completeLogin(outcome.session)) router.replace('/tai-khoan');
      return;
    }
    if (outcome.kind === 'rejected-role') return;
    if (outcome.kind === 'otp-required') setFlow({ step: 'otp', email: outcome.email, message: outcome.message });
    else if (outcome.kind === 'device-replacement-required') setFlow({ step: 'replacementConfirm', email: outcome.email, oldestDeviceName: outcome.oldestDeviceName, message: outcome.message });
    else if (outcome.kind === 'captcha-required') setFlow({ step: 'captcha', message: outcome.message });
    else setError('Phản hồi xác thực không hợp lệ. Vui lòng thử lại.');
  };

  const submit = async () => {
    const nextErrors = {
      identifier: required(identifier, 'Tài khoản hoặc email'),
      password: required(password, 'Mật khẩu'),
      captcha: flow.step === 'captcha' ? required(captchaToken, 'CAPTCHA') : undefined,
    };
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setLoading(true);
    setError(undefined);
    try {
      await handleOutcome(await authService.login(identifier.trim(), password, captchaToken || undefined));
    } catch (caught) {
      setError(normalizeApiError(caught).message);
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setFieldErrors({ otp: 'Mã OTP phải gồm 6 chữ số.' });
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const outcome = flow.step === 'replacementOtp'
        ? await authService.confirmReplaceDevice(flow.email, otp)
        : await authService.confirmLogin(flow.step === 'otp' ? flow.email : identifier, otp);
      await handleOutcome(outcome);
    } catch (caught) {
      setError(normalizeApiError(caught).message);
    } finally {
      setLoading(false);
    }
  };

  const cancelFlow = () => {
    setFlow({ step: 'credentials' });
    setOtp('');
    setError(undefined);
    setFieldErrors({});
  };

  if (flow.step === 'replacementConfirm') {
    return (
      <AuthShell title="Thay thế thiết bị?" description={`Tài khoản đã đạt giới hạn thiết bị. Thiết bị cũ nhất: ${flow.oldestDeviceName}.`}>
        <AuthBanner tone="warning" message={flow.message ?? 'Tiếp tục để nhập OTP và xác nhận thay thế thiết bị cũ.'} />
        <PrimaryButton label="Tiếp tục xác minh" onPress={() => setFlow({ ...flow, step: 'replacementOtp' })} />
        <SecondaryButton label="Hủy" onPress={cancelFlow} />
      </AuthShell>
    );
  }

  if (flow.step === 'otp' || flow.step === 'replacementOtp') {
    return (
      <AuthShell title="Xác minh thiết bị" description={`Mã xác minh đã được gửi tới ${flow.email}.`}>
        <AuthBanner message={error ?? flow.message} tone={error ? 'error' : 'warning'} />
        <OtpField value={otp} onChangeText={setOtp} error={fieldErrors.otp} />
        <PrimaryButton label={flow.step === 'replacementOtp' ? 'Xác nhận thay thế' : 'Xác nhận OTP'} loading={loading} disabled={otp.length !== 6} onPress={confirmOtp} />
        <SecondaryButton label="Quay lại đăng nhập" onPress={cancelFlow} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Đăng nhập" description="Truy cập vào hệ thống EduCodeAI" footer={<Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/register')}><Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text></Pressable>}>
      <AuthBanner message={flow.step === 'captcha' ? flow.message ?? 'Máy chủ yêu cầu xác minh CAPTCHA.' : error} tone={flow.step === 'captcha' ? 'warning' : 'error'} />
      <AuthField label="Tài khoản hoặc email" value={identifier} autoCapitalize="none" autoComplete="username" error={fieldErrors.identifier} onChangeText={setIdentifier} />
      <PasswordField value={password} autoComplete="current-password" error={fieldErrors.password} onChangeText={setPassword} />
      {flow.step === 'captcha' ? <CaptchaInput token={captchaToken} onTokenChange={setCaptchaToken} error={fieldErrors.captcha} /> : null}
      <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/forgot-password')}><Text style={styles.forgot}>Quên mật khẩu?</Text></Pressable>
      <PrimaryButton label="Tiếp theo" loading={loading} onPress={submit} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primaryPressed, fontWeight: '700', textAlign: 'center', minHeight: 44, paddingVertical: spacing.md },
  forgot: { color: colors.primaryPressed, fontWeight: '600', alignSelf: 'flex-end' },
});
