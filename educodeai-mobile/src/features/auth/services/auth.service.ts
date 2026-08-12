import api from '../../../shared/configs/api';
import { getDeviceInfo } from '../../../shared/utils/device-helper';
import type { LoginClassification, LoginResponse } from '../types/auth.types';
import { classifyLoginResponse } from './login-classifier';

export interface SessionStateResponse { isBanned: boolean; sessionActive: boolean; isValid: boolean }
export interface RemoteLogoutRequest {
  DangXuatTatCa: boolean;
  DanhSachMaPhien?: number[] | null;
  OtpCode: string;
  CaptchaToken?: string | null;
}
const classify = (data: LoginResponse): LoginClassification => classifyLoginResponse(data);

export const authService = {
  async login(identifier: string, password: string, captchaToken = 'SKIP_CAPTCHA') {
    const { data } = await api.post<LoginResponse>('/XacThuc/dang-nhap', { taiKhoan: identifier, matKhau: password, captchaToken, ...await getDeviceInfo() });
    return classify(data);
  },
  async confirmLogin(taiKhoan: string, otpCode: string) {
    const { data } = await api.post<LoginResponse>('/XacThuc/xac-nhan-otp', { taiKhoan, otpCode, ...await getDeviceInfo() }); return classify(data);
  },
  async confirmReplaceDevice(taiKhoan: string, otpCode: string) {
    const { data } = await api.post<LoginResponse>('/XacThuc/xac-nhan-thay-the-thiet-bi', { taiKhoan, otpCode, ...await getDeviceInfo() }); return classify(data);
  },
  register: (payload: { hoTen: string; taiKhoan: string; email: string; matKhau: string; captchaToken: string }) => api.post('/XacThuc/dang-ky', payload),
  async verifyRegistration(taiKhoan: string, otpCode: string): Promise<LoginClassification> {
    const { data } = await api.post<LoginResponse>('/XacThuc/xac-minh-dang-ky', { taiKhoan, otpCode, ...await getDeviceInfo() });
    return classify(data);
  },
  forgotPassword: (email: string, captchaToken: string) => api.post('/XacThuc/quen-mat-khau', { email, captchaToken }),
  verifyForgotPassword: (email: string, otpCode: string) => api.post('/XacThuc/xac-minh-otp-quen-mat-khau', { email, otpCode }),
  async resetPassword(email: string, newPassword: string, resetToken: string) {
    return api.post('/XacThuc/dat-lai-mat-khau', { email, newPassword, resetToken, ...await getDeviceInfo() });
  },
  async getSessionState(): Promise<SessionStateResponse> { return (await api.get<SessionStateResponse>('/XacThuc/session-state')).data; },
  async getDevices() { const { maThietBi } = await getDeviceInfo(); return (await api.get('/XacThuc/danh-sach-thiet-bi', { params: { maThietBiHienTai: maThietBi } })).data; },
  changePassword: (matKhauCu: string, matKhauMoi: string) => api.post('/XacThuc/doi-mat-khau', { matKhauCu, matKhauMoi }),
  requestRemoteLogout: () => api.post('/XacThuc/yeu-cau-otp-dang-xuat-tu-xa'),
  confirmRemoteLogout: (payload: RemoteLogoutRequest) => api.post('/XacThuc/xac-nhan-dang-xuat-tu-xa', payload),
  async logout(): Promise<void> { const { maThietBi } = await getDeviceInfo(); await api.post('/XacThuc/dang-xuat', maThietBi, { headers: { 'Content-Type': 'application/json' } }); },
};
