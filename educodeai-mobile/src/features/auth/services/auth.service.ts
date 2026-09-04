import api from '../../../shared/configs/api';
import { getDeviceMetadata, type DeviceMetadata } from '../../../shared/lib/device-metadata';
import type { AuthResponse } from '../types';

export interface LoginPayload { taiKhoan: string; matKhau: string; captchaToken?: string; maThietBi: string; tenThietBi?: string }
export interface OtpPayload { taiKhoan: string; otpCode: string; maThietBi: string; tenThietBi?: string }
export interface RegisterPayload { hoTen: string; email: string; matKhau: string; captchaToken: string }
export interface ResetPasswordPayload { email: string; NewPassword: string; ResetToken: string; maThietBi?: string; tenThietBi?: string }

const dataOf = <T>(response: { data: T }): T => response.data;

export const authService = {
  async login(payload: LoginPayload): Promise<unknown> { return dataOf(await api.post('/XacThuc/dang-nhap', payload)); },
  async confirmOtp(payload: OtpPayload): Promise<AuthResponse> { return dataOf(await api.post('/XacThuc/xac-nhan-otp', payload)); },
  async replaceOldest(payload: OtpPayload): Promise<AuthResponse> { return dataOf(await api.post('/XacThuc/xac-nhan-thay-the-thiet-bi', payload)); },
  async register(payload: RegisterPayload): Promise<unknown> { return dataOf(await api.post('/XacThuc/dang-ky', payload)); },
  async confirmRegistration(payload: OtpPayload): Promise<AuthResponse> { return dataOf(await api.post('/XacThuc/xac-minh-dang-ky', payload)); },
  async forgotPassword(payload: { email: string; captchaToken?: string }): Promise<unknown> { return dataOf(await api.post('/XacThuc/quen-mat-khau', payload)); },
  async verifyResetOtp(payload: { email: string; otpCode: string }): Promise<{ resetToken: string; expiresInSeconds?: number }> { return dataOf(await api.post('/XacThuc/xac-minh-otp-quen-mat-khau', payload)); },
  async resetPassword(payload: ResetPasswordPayload): Promise<unknown> { return dataOf(await api.post('/XacThuc/dat-lai-mat-khau', payload)); },
  async changePassword(payload: { MatKhauCu: string; MatKhauMoi: string }): Promise<unknown> { return dataOf(await api.post('/XacThuc/doi-mat-khau', payload)); },
  async logout(deviceId: string): Promise<unknown> { return dataOf(await api.post('/XacThuc/dang-xuat', deviceId)); },
};

export const withDevice = async <T extends object>(payload: T, metadata?: DeviceMetadata): Promise<T & DeviceMetadata> => ({ ...payload, ...(metadata ?? await getDeviceMetadata()) });
