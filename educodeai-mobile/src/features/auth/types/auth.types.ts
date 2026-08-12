export const USER_ROLES = {
  admin: 0,
  instructor: 1,
  student: 2,
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface AuthUser {
  maNguoiDung: number;
  id: number;
  taiKhoan: string;
  hoTen: string;
  email: string;
  vaiTro: UserRole;
  anhDaiDien: string | null;
}

export interface AuthSession {
  accessToken: string;
  tokenExpiresAt: string | null;
  user: AuthUser;
}

export interface LoginRequest {
  taiKhoan: string;
  matKhau: string;
  captchaToken: string;
  maThietBi: string;
  tenThietBi: string;
}

export interface LoginSuccessResponse {
  token: string;
  tokenExpiresAt?: string;
  user: AuthUser;
}

export interface LoginCaptchaResponse { requiresCaptcha: true; message: string }
export interface LoginOtpResponse { requiresOtp: true; email: string; message: string }
export interface LoginReplaceDeviceResponse {
  requiresLogoutOldest: true;
  oldestDeviceName: string;
  email: string;
  message: string;
}

export type LoginResponse = LoginSuccessResponse | LoginCaptchaResponse | LoginOtpResponse | LoginReplaceDeviceResponse;

export type LoginClassification =
  | { kind: 'authenticated'; session: AuthSession }
  | { kind: 'captcha-required'; message: string }
  | { kind: 'otp-required'; email: string; message: string }
  | { kind: 'device-replacement-required'; email: string; oldestDeviceName: string; message: string }
  | { kind: 'invalid-response' };
