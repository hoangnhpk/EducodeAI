import type { AuthSession, LoginClassification } from '../types/auth.types.ts';
import { normalizeAuthUser } from '../guards/role-guard.ts';

const record = (value: unknown): Record<string, unknown> | null => value && typeof value === 'object' ? value as Record<string, unknown> : null;
const text = (value: unknown): string => typeof value === 'string' ? value : '';

export const classifyLoginResponse = (value: unknown): LoginClassification => {
  const response = record(value);
  if (!response) return { kind: 'invalid-response' };
  const message = text(response.message);
  if (response.requiresOtp === true && text(response.email)) return { kind: 'otp-required', email: text(response.email), message };
  if (response.requiresLogoutOldest === true && text(response.email) && text(response.oldestDeviceName)) {
    return { kind: 'device-replacement-required', email: text(response.email), oldestDeviceName: text(response.oldestDeviceName), message };
  }
  if (response.requiresCaptcha === true) return { kind: 'captcha-required', message };
  const user = normalizeAuthUser(response.user);
  if (text(response.token) && user) {
    const session: AuthSession = { accessToken: text(response.token), tokenExpiresAt: text(response.tokenExpiresAt) || null, user };
    return { kind: 'authenticated', session };
  }
  return { kind: 'invalid-response' };
};
