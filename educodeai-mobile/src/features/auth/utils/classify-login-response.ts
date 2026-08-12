import type { LoginOutcome, StudentUser } from '../types/auth-ui.types';

const text = (value: unknown) => typeof value === 'string' ? value : undefined;

export function classifyLoginResponse(value: unknown): LoginOutcome {
  if (!value || typeof value !== 'object') return { kind: 'invalid' };
  const response = value as Record<string, unknown>;
  if (response.requiresOtp === true && text(response.email))
    return { kind: 'otp', email: text(response.email)!, message: text(response.message) };
  if (response.requiresLogoutOldest === true && text(response.email) && text(response.oldestDeviceName))
    return { kind: 'replacement', email: text(response.email)!, oldestDeviceName: text(response.oldestDeviceName)!, message: text(response.message) };
  if (response.requiresCaptcha === true) return { kind: 'captcha', message: text(response.message) };
  if (text(response.token)?.trim() && response.user && typeof response.user === 'object')
    return { kind: 'completed', token: text(response.token)!, user: response.user as StudentUser };
  return { kind: 'invalid' };
}

export function isStudent(user: StudentUser): boolean {
  const role = user.vaiTro ?? user.VaiTro;
  return Number(role) === 2;
}
