import api from '../../../shared/configs/api';
import { authService } from '../../auth/services/auth.service';
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
      form.append('AnhDaiDien', image as unknown as string);
    }
    const response = await api.put<StudentProfile>('/hoc-vien/ho-so', form);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await authService.changePassword(currentPassword, newPassword);
  },

  async getDevices(): Promise<DeviceSession[]> {
    return authService.getDevices() as Promise<DeviceSession[]>;
  },

  async requestRemoteLogoutOtp(): Promise<void> {
    await authService.requestRemoteLogout();
  },

  async confirmRemoteLogout(payload: ConfirmRemoteLogoutPayload): Promise<void> {
    await authService.confirmRemoteLogout(payload);
  },
};
