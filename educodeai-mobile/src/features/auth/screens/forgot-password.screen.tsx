import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { AuthBanner } from '../components/auth-banner';
import { AuthField } from '../components/auth-field';
import { AuthShell } from '../components/auth-shell';
import { CaptchaInput } from '../components/captcha-input';
import { OtpField } from '../components/otp-field';
import { PasswordField } from '../components/password-field';
import { PrimaryButton } from '../components/primary-button';
import { normalizeApiError } from '../../../shared/types/api-error';
import { authService } from '../services/auth.service';
import { emailError, matchingPasswordError, passwordError, required } from '../utils/auth-validation';

type Errors = { email?: string; captcha?: string; otp?: string; password?: string; confirm?: string };

export function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setApiError(undefined);
    try { await action(); } catch (caught) { setApiError(normalizeApiError(caught).message); } finally { setLoading(false); }
  };
  const changeStep = (next: typeof step) => { setErrors({}); setApiError(undefined); setStep(next); };

  if (step === 'success') {
    return <AuthShell title="Đặt lại mật khẩu thành công" description="Bạn có thể đăng nhập bằng mật khẩu mới."><AuthBanner tone="success" message="Mật khẩu của bạn đã được cập nhật." /><PrimaryButton label="Về trang đăng nhập" onPress={() => router.replace('/(auth)/login')} /></AuthShell>;
  }
  if (step === 'otp') {
    return <AuthShell title="Xác minh OTP" description={`Nhập mã được gửi tới ${email}.`}><AuthBanner message={apiError} /><OtpField value={otp} onChangeText={(value) => { setOtp(value); setErrors((current) => ({ ...current, otp: undefined })); }} error={errors.otp} /><PrimaryButton label="Xác minh" loading={loading} disabled={otp.length !== 6} onPress={() => {
      if (!/^\d{6}$/.test(otp)) return setErrors({ otp: 'Mã OTP phải gồm 6 chữ số.' });
      run(async () => { setToken(await authService.verifyForgotPassword(email, otp)); changeStep('reset'); });
    }} /></AuthShell>;
  }
  if (step === 'reset') {
    return <AuthShell title="Đặt lại mật khẩu" description="Chọn mật khẩu mới an toàn cho tài khoản."><AuthBanner message={apiError} /><PasswordField label="Mật khẩu mới" value={password} autoComplete="new-password" error={errors.password} onChangeText={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined })); }} /><PasswordField label="Xác nhận mật khẩu" value={confirm} error={errors.confirm} onChangeText={(value) => { setConfirm(value); setErrors((current) => ({ ...current, confirm: undefined })); }} /><PrimaryButton label="Đặt lại mật khẩu" loading={loading} onPress={() => {
      const next = { password: passwordError(password), confirm: matchingPasswordError(password, confirm) };
      setErrors(next); if (Object.values(next).some(Boolean)) return;
      run(async () => { await authService.resetPassword(email, password, token); changeStep('success'); });
    }} /></AuthShell>;
  }
  return <AuthShell title="Quên mật khẩu" description="Nhập email để nhận mã xác minh."><AuthBanner message={apiError} /><AuthField label="Email" value={email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email} onChangeText={(value) => { setEmail(value); setErrors((current) => ({ ...current, email: undefined })); }} /><CaptchaInput token={captchaToken} onTokenChange={(value) => { setCaptchaToken(value); setErrors((current) => ({ ...current, captcha: undefined })); }} error={errors.captcha} /><PrimaryButton label="Gửi mã xác minh" loading={loading} onPress={() => {
    const next = { email: emailError(email), captcha: required(captchaToken, 'CAPTCHA') };
    setErrors(next); if (Object.values(next).some(Boolean)) return;
    run(async () => { await authService.requestPasswordReset(email.trim(), captchaToken); changeStep('otp'); });
  }} /></AuthShell>;
}
