import api from '../../../shared/configs/api';
import type {
  ConfirmRemoteLogoutPayload,
  DeviceSession,
  ProfileImageFile,
  StudentProfile,
} from '../types/account.types';

export const AccountService = {
  async getProfile(): Promise<StudentProfile> {
    const response = await api.get<StudentProfile>('/hoc-vien/ho-so');
    return response.data;
  },

  async updateProfile(fullName: string, image?: ProfileImageFile): Promise<StudentProfile> {
    const form = new FormData();
    form.append('HoTen', fullName.trim());
    if (image) {
      form.append('AnhDaiDien', image as unknown as Blob);
    }
    const response = await api.put<StudentProfile>('/hoc-vien/ho-so', form);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/XacThuc/doi-mat-khau', {
      MatKhauCu: currentPassword,
      MatKhauMoi: newPassword,
    });
  },

  async getDevices(currentDeviceId: string): Promise<DeviceSession[]> {
    const response = await api.get<DeviceSession[]>('/XacThuc/danh-sach-thiet-bi', {
      params: { maThietBiHienTai: currentDeviceId },
    });
    return response.data;
  },

  async requestRemoteLogoutOtp(): Promise<void> {
    await api.post('/XacThuc/yeu-cau-otp-dang-xuat-tu-xa');
  },

  async confirmRemoteLogout(payload: ConfirmRemoteLogoutPayload): Promise<void> {
    await api.post('/XacThuc/xac-nhan-dang-xuat-tu-xa', payload);
  },

  async logoutCurrentDevice(deviceId: string): Promise<void> {
    await api.post('/XacThuc/dang-xuat', JSON.stringify(deviceId), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
