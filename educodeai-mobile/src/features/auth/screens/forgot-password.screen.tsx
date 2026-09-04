import { router } from 'expo-router';
import { useState } from 'react';

import { getApiErrorMessage } from '../../../shared/lib/api-error';
import { getDeviceMetadata } from '../../../shared/lib/device-metadata';
import { AuthShell, Feedback, Field, PasswordField, PrimaryButton, TextLink } from '../components/auth-ui';
import { CaptchaInput } from '../components/captcha-input';
import { authService } from '../services/auth.service';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'done'>('email'); const [email, setEmail] = useState(''); const [otp, setOtp] = useState(''); const [token, setToken] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const run = async (action: () => Promise<void>) => { setLoading(true); setError(null); try { await action(); } catch (e) { setError(getApiErrorMessage(e)); } finally { setLoading(false); } };
  const send = () => { if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Vui lòng nhập email hợp lệ.'); if (!token) return setError('Vui lòng hoàn tất xác minh CAPTCHA.'); void run(async () => { await authService.forgotPassword({ email: email.trim(), captchaToken: token }); setToken(''); setStep('otp'); }); };
  const verify = () => { if (!/^\d{6}$/.test(otp)) return setError('OTP phải gồm 6 chữ số.'); void run(async () => { const result = await authService.verifyResetOtp({ email: email.trim(), otpCode: otp }); if (!result.resetToken) throw new Error('Không nhận được mã đặt lại mật khẩu.'); setToken(result.resetToken); setStep('password'); }); };
  const reset = () => { if (password.length < 8) return setError('Mật khẩu cần ít nhất 8 ký tự.'); if (password !== confirm) return setError('Mật khẩu xác nhận không khớp.'); void run(async () => { const device = await getDeviceMetadata(); await authService.resetPassword({ email: email.trim(), NewPassword: password, ResetToken: token, ...device }); setStep('done'); }); };
  if (step === 'done') return <AuthShell title="Đã đổi mật khẩu" subtitle="Bạn có thể đăng nhập bằng mật khẩu mới."><Feedback kind="success" message="Mật khẩu đã được cập nhật thành công." /><PrimaryButton label="Về trang đăng nhập" onPress={() => router.replace('/(auth)/login')} /></AuthShell>;
  if (step === 'password') return <AuthShell title="Mật khẩu mới" subtitle="Chọn mật khẩu mạnh và dễ nhớ với bạn."><PasswordField label="Mật khẩu mới" value={password} onChangeText={setPassword} /><PasswordField label="Xác nhận mật khẩu" value={confirm} onChangeText={setConfirm} /><Feedback message={error} /><PrimaryButton label="Đặt lại mật khẩu" loading={loading} onPress={reset} /></AuthShell>;
  if (step === 'otp') return <AuthShell title="Xác minh OTP" subtitle={`Nhập mã đã gửi đến ${email}.`}><Field label="Mã OTP" value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={6} /><Feedback message={error} /><PrimaryButton label="Xác minh" loading={loading} onPress={verify} /><TextLink label="Dùng email khác" onPress={() => setStep('email')} /></AuthShell>;
  return <AuthShell title="Quên mật khẩu" subtitle="Nhập email để nhận mã xác minh."><Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" /><CaptchaInput token={token} onTokenChange={setToken} /><Feedback message={error} /><PrimaryButton label="Gửi mã OTP" loading={loading} onPress={send} /><TextLink label="Quay lại đăng nhập" onPress={() => router.back()} /></AuthShell>;
}
