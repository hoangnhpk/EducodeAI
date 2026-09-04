import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { getApiErrorMessage } from '../../../shared/lib/api-error';
import { getDeviceMetadata } from '../../../shared/lib/device-metadata';
import { authService } from '../services/auth.service';
import { classifyLoginResponse, parseAuthResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthShell, Feedback, Field, PasswordField, PrimaryButton, TextLink } from '../components/auth-ui';
import { CaptchaInput } from '../components/captcha-input';

export default function LoginScreen() {
  const { establishSession } = useAuth();
  const [taiKhoan, setTaiKhoan] = useState(''); const [matKhau, setMatKhau] = useState('');
  const [otp, setOtp] = useState(''); const [mode, setMode] = useState<'login' | 'otp' | 'replace'>('login');
  const [pendingAccount, setPendingAccount] = useState(''); const [oldest, setOldest] = useState('');
  const [captchaRequired, setCaptchaRequired] = useState(false); const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);

  const submitLogin = async () => {
    if (!taiKhoan.trim() || !matKhau) return setError('Vui lòng nhập tài khoản và mật khẩu.');
    if (captchaRequired && !captchaToken) {
      setCaptchaError('Vui lòng hoàn tất xác minh CAPTCHA.');
      return;
    }
    setLoading(true); setError(null); setCaptchaError(undefined);
    try {
      const device = await getDeviceMetadata();
      const submittedCaptchaToken = captchaRequired ? captchaToken : undefined;
      const result = classifyLoginResponse(await authService.login({ taiKhoan: taiKhoan.trim(), matKhau, captchaToken: submittedCaptchaToken, ...device }));
      if (result.kind === 'authenticated') await establishSession(result.session);
      else if (result.kind === 'requiresOtp') { setPendingAccount(result.email ?? taiKhoan.trim()); setMode('otp'); }
      else if (result.kind === 'requiresLogoutOldest') { setPendingAccount(result.email ?? taiKhoan.trim()); setOldest(result.oldestDeviceName ?? 'thiết bị cũ nhất'); setMode('replace'); }
      else if (result.kind === 'requiresCaptcha') {
        setCaptchaRequired(true); setCaptchaToken(''); setError(result.message ?? 'Vui lòng xác minh CAPTCHA để tiếp tục.');
      } else setError(result.message ?? 'Không thể đăng nhập.');
    } catch (e) {
      if (captchaRequired) setCaptchaToken('');
      setError(getApiErrorMessage(e));
    } finally { setLoading(false); }
  };

  const confirm = async () => {
    if (!/^\d{6}$/.test(otp)) return setError('OTP phải gồm 6 chữ số.');
    setLoading(true); setError(null);
    try {
      const payload = { taiKhoan: pendingAccount, otpCode: otp, ...(await getDeviceMetadata()) };
      const raw = mode === 'replace' ? await authService.replaceOldest(payload) : await authService.confirmOtp(payload);
      const session = parseAuthResponse(raw);
      if (!session) throw new Error('Phản hồi đăng nhập không hợp lệ.');
      await establishSession(session);
    } catch (e) { setError(getApiErrorMessage(e)); } finally { setLoading(false); }
  };

  if (mode !== 'login') return <AuthShell title="Xác minh đăng nhập" subtitle={mode === 'replace' ? `Xác nhận để thay thế ${oldest}.` : 'Nhập mã OTP đã gửi đến email của bạn.'}>
    <Field label="Mã OTP" value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={6} textContentType="oneTimeCode" />
    <Feedback message={error} /><PrimaryButton label={mode === 'replace' ? 'Xác nhận thay thế' : 'Xác nhận OTP'} loading={loading} onPress={confirm} />
    <TextLink label="Quay lại đăng nhập" onPress={() => { setMode('login'); setOtp(''); setError(null); }} />
  </AuthShell>;

  return <AuthShell title="Đăng nhập" subtitle="Tiếp tục hành trình học tập của bạn.">
    <Field label="Tài khoản hoặc email" value={taiKhoan} onChangeText={setTaiKhoan} autoCapitalize="none" autoComplete="username" />
    <PasswordField label="Mật khẩu" value={matKhau} onChangeText={setMatKhau} autoComplete="current-password" onSubmitEditing={submitLogin} />
    {captchaRequired ? <CaptchaInput token={captchaToken} onTokenChange={(token) => { setCaptchaToken(token); if (token) setCaptchaError(undefined); }} error={captchaError} /> : null}
    <Feedback message={error} /><PrimaryButton label="Đăng nhập" loading={loading} onPress={submitLogin} />
    <View><TextLink label="Quên mật khẩu?" onPress={() => router.push('/(auth)/forgot-password')} /><TextLink label="Chưa có tài khoản? Đăng ký" onPress={() => router.push('/(auth)/register')} /></View>
  </AuthShell>;
}
