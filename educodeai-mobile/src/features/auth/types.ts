import type { AuthUser } from '../../shared/types/auth-public';

export interface AuthResponse {
  token: string;
  tokenExpiresAt: string | null;
  user: AuthUser;
}

export type LoginResult =
  | { kind: 'requiresOtp'; email?: string; message?: string }
  | { kind: 'requiresLogoutOldest'; email?: string; oldestDeviceName?: string; message?: string }
  | { kind: 'requiresCaptcha'; message?: string }
  | { kind: 'authenticated'; session: AuthResponse }
  | { kind: 'invalid'; message?: string };

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export const isAuthUser = (value: unknown): value is AuthUser => {
  if (!record(value)) return false;
  return (typeof value.id === 'string' || (typeof value.id === 'number' && Number.isFinite(value.id))) &&
    text(value.taiKhoan) && text(value.hoTen) && text(value.email) && value.vaiTro === 2 &&
    (value.maNguoiDung === undefined || typeof value.maNguoiDung === 'string' || typeof value.maNguoiDung === 'number') &&
    (value.anhDaiDien === undefined || value.anhDaiDien === null || typeof value.anhDaiDien === 'string');
};

export const parseAuthResponse = (value: unknown): AuthResponse | null => {
  if (!record(value) || !text(value.token) || !isAuthUser(value.user)) return null;
  return { token: value.token.trim(), tokenExpiresAt: typeof value.tokenExpiresAt === 'string' ? value.tokenExpiresAt : null, user: value.user };
};

export const classifyLoginResponse = (value: unknown): LoginResult => {
  if (!record(value)) return { kind: 'invalid' };
  const message = typeof value.message === 'string' ? value.message : undefined;
  if (value.requiresOtp === true) return { kind: 'requiresOtp', email: typeof value.email === 'string' ? value.email : undefined, message };
  if (value.requiresLogoutOldest === true) return { kind: 'requiresLogoutOldest', email: typeof value.email === 'string' ? value.email : undefined, oldestDeviceName: typeof value.oldestDeviceName === 'string' ? value.oldestDeviceName : undefined, message };
  if (value.requiresCaptcha === true) return { kind: 'requiresCaptcha', message };
  const session = parseAuthResponse(value);
  return session ? { kind: 'authenticated', session } : { kind: 'invalid', message };
};
