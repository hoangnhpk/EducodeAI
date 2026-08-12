import { AxiosError } from 'axios';
import api from '../../../shared/configs/api';
import type { AuthUiAdapter, LoginOutcome, RegisterInput } from '../types/auth-ui.types';
import { classifyLoginResponse } from '../utils/classify-login-response';

const data = (response: { data: unknown }) => classifyLoginResponse(response.data);
export const authErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as { message?: unknown; errors?: Record<string, string[]> } | undefined;
    if (typeof payload?.message === 'string') return payload.message;
    const first = payload?.errors && Object.values(payload.errors).flat()[0];
    if (first) return first;
    if (!error.response) return 'Không thể kết nối máy chủ. Vui lòng thử lại.';
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
};

/** UI-only adapter. Device fields are intentionally omitted until the owned device layer supplies them. */
export const authUiAdapter: AuthUiAdapter = {
  async login(identifier, password, captchaToken) {
    return data(await api.post('/XacThuc/dang-nhap', { taiKhoan: identifier, matKhau: password, captchaToken }));
  },
  async confirmLogin(email, otpCode) {
    return data(await api.post('/XacThuc/xac-nhan-otp', { taiKhoan: email, otpCode }));
  },
  async confirmReplaceDevice(email, otpCode) {
    return data(await api.post('/XacThuc/xac-nhan-thay-the-thiet-bi', { taiKhoan: email, otpCode }));
  },
  async requestRegistration(input: RegisterInput) {
    await api.post('/XacThuc/dang-ky', {
      hoTen: input.fullName,
      email: input.email,
      matKhau: input.password,
      captchaToken: input.captchaToken,
    });
  },
  async confirmRegistration(email, otpCode) {
    return data(await api.post('/XacThuc/xac-minh-dang-ky', { taiKhoan: email, otpCode }));
  },
  async requestPasswordReset(email, captchaToken) {
    await api.post('/XacThuc/quen-mat-khau', { email, captchaToken });
  },
  async verifyPasswordResetOtp(email, otpCode) {
    const response = await api.post('/XacThuc/xac-minh-otp-quen-mat-khau', { email, otpCode });
    const payload = response.data as { resetToken?: unknown; ResetToken?: unknown };
    const token = payload.resetToken ?? payload.ResetToken;
    if (typeof token !== 'string' || !token) throw new Error('INVALID_RESET_RESPONSE');
    return token;
  },
  async resetPassword(email, newPassword, resetToken) {
    await api.post('/XacThuc/dat-lai-mat-khau', { email, newPassword, resetToken });
  },
};

export const invalidOutcomeMessage = (_outcome: LoginOutcome) => 'Phản hồi xác thực không hợp lệ. Vui lòng thử lại.';
