export type StudentUser = {
  maNguoiDung?: number;
  hoTen?: string;
  email?: string;
  taiKhoan?: string;
  anhDaiDien?: string | null;
  vaiTro?: number | string;
  VaiTro?: number | string;
  [key: string]: unknown;
};

export type LoginOutcome =
  | { kind: 'completed'; token: string; user: StudentUser }
  | { kind: 'otp'; email: string; message?: string }
  | { kind: 'replacement'; email: string; oldestDeviceName: string; message?: string }
  | { kind: 'captcha'; message?: string }
  | { kind: 'invalid' };

export type AuthFlowState =
  | { step: 'credentials' }
  | { step: 'otp'; email: string; message?: string }
  | { step: 'replacementConfirm'; email: string; oldestDeviceName: string; message?: string }
  | { step: 'replacementOtp'; email: string; oldestDeviceName: string; message?: string }
  | { step: 'captcha'; message?: string };

export interface AuthUiAdapter {
  login(identifier: string, password: string, captchaToken?: string): Promise<LoginOutcome>;
  confirmLogin(email: string, otpCode: string): Promise<LoginOutcome>;
  confirmReplaceDevice(email: string, otpCode: string): Promise<LoginOutcome>;
  requestRegistration(input: RegisterInput): Promise<void>;
  confirmRegistration(email: string, otpCode: string): Promise<LoginOutcome>;
  requestPasswordReset(email: string, captchaToken: string): Promise<void>;
  verifyPasswordResetOtp(email: string, otpCode: string): Promise<string>;
  resetPassword(email: string, newPassword: string, resetToken: string): Promise<void>;
}

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  captchaToken: string;
};
