import { router } from 'expo-router';
import { useState } from 'react';

import { getApiErrorMessage } from '../../../shared/lib/api-error';
import { getDeviceMetadata } from '../../../shared/lib/device-metadata';
import { AuthShell, Feedback, Field, PasswordField, PrimaryButton, TextLink } from '../components/auth-ui';
import { CaptchaInput } from '../components/captcha-input';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { parseAuthResponse } from '../types';

export default function RegisterScreen() {
  const { establishSession } = useAuth();
  const [hoTen, setHoTen] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState(''); const [captchaToken, setCaptchaToken] = useState(''); const [step, setStep] = useState<'form' | 'otp'>('form'); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const register = async () => {
    if (!hoTen.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError('Vui lòng nhập họ tên và email hợp lệ.');
    if (password.length < 8) return setError('Mật khẩu cần ít nhất 8 ký tự.');
    if (password !== confirm) return setError('Mật khẩu xác nhận không khớp.');
    if (!captchaToken) return setError('Vui lòng hoàn tất xác minh CAPTCHA.');
    setLoading(true); setError(null);
    try { await authService.register({ hoTen: hoTen.trim(), email: email.trim(), matKhau: password, captchaToken }); setCaptchaToken(''); setStep('otp'); } catch (e) { setCaptchaToken(''); setError(getApiErrorMessage(e)); } finally { setLoading(false); }
  };
  const verify = async () => {
    if (!/^\d{6}$/.test(otp)) return setError('OTP phải gồm 6 chữ số.');
    setLoading(true); setError(null);
    try { const raw = await authService.confirmRegistration({ taiKhoan: email.trim(), otpCode: otp, ...(await getDeviceMetadata()) }); const session = parseAuthResponse(raw); if (!session) throw new Error('Phản hồi xác minh không hợp lệ.'); await establishSession(session); } catch (e) { setError(getApiErrorMessage(e)); } finally { setLoading(false); }
  };
  if (step === 'otp') return <AuthShell title="Xác minh email" subtitle={`Mã OTP đã được gửi đến ${email}.`}><Field label="Mã OTP" value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={6} /><Feedback message={error} /><PrimaryButton label="Hoàn tất đăng ký" loading={loading} onPress={verify} /><TextLink label="Sửa thông tin" onPress={() => setStep('form')} /></AuthShell>;
  return <AuthShell title="Tạo tài khoản" subtitle="Đăng ký tài khoản học viên EduCodeAI."><Field label="Họ và tên" value={hoTen} onChangeText={setHoTen} autoComplete="name" /><Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" /><PasswordField label="Mật khẩu" value={password} onChangeText={setPassword} autoComplete="new-password" /><PasswordField label="Xác nhận mật khẩu" value={confirm} onChangeText={setConfirm} /><CaptchaInput token={captchaToken} onTokenChange={setCaptchaToken} /><Feedback message={error} /><PrimaryButton label="Đăng ký" loading={loading} onPress={register} /><TextLink label="Đã có tài khoản? Đăng nhập" onPress={() => router.replace('/(auth)/login')} /></AuthShell>;
}
