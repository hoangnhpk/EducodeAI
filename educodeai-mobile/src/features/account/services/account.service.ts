import api from '../../../shared/configs/api';
import { getDeviceMetadata } from '../../../shared/lib/device-metadata';
import type { AuthPublicApi } from '../../auth';

export interface StudentProfile { hoTen: string; email: string; vaiTro: number; anhDaiDien?: string | null; tongKhoaHoc?: number; daHoanThanh?: number; chungChi?: number; gioDaHoc?: number; dangHoc?: number; tyLeHoanThanh?: number }
export interface NativeFile { uri: string; name: string; type: string }
export interface DeviceSession { maPhien: string | number; maThietBi?: string; tenThietBi?: string; thoiGianHoatDongCuoi?: string | null; isCurrentDevice: boolean }
export interface RemoteLogoutPayload { otpCode: string; dangXuatTatCa: boolean; danhSachMaPhien?: (string | number)[] }

let profileGeneration = 0;
let deviceGeneration = 0;
const data = <T>(response: { data: T }): T => response.data;

export const accountService = {
  async getProfile(): Promise<StudentProfile> { return data(await api.get('/hoc-vien/ho-so')); },
  async updateProfile(name: string, file?: NativeFile): Promise<StudentProfile> {
    const form = new FormData();
    form.append('HoTen', name.trim());
    if (file) form.append('AnhDaiDien', file as unknown as Blob);
    return data(await api.put('/hoc-vien/ho-so', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  async changePassword(payload: { MatKhauCu: string; MatKhauMoi: string }): Promise<unknown> { return data(await api.post('/XacThuc/doi-mat-khau', payload)); },
  async listDevices(currentId: string): Promise<DeviceSession[]> { return data(await api.get('/XacThuc/danh-sach-thiet-bi', { params: { maThietBiHienTai: currentId } })); },
  async requestRemoteLogoutOtp(): Promise<unknown> { return data(await api.post('/XacThuc/yeu-cau-otp-dang-xuat-tu-xa')); },
  async confirmRemoteLogout(payload: RemoteLogoutPayload): Promise<unknown> { return data(await api.post('/XacThuc/xac-nhan-dang-xuat-tu-xa', payload)); },
};

export const AccountService = {
  getProfile: accountService.getProfile,
  updateProfile: accountService.updateProfile,
  async changePassword(currentPassword: string, newPassword: string): Promise<unknown> {
    return accountService.changePassword({ MatKhauCu: currentPassword, MatKhauMoi: newPassword });
  },
  async getDevices(): Promise<(DeviceSession & { maPhien: number; tenThietBi: string; thoiGianHoatDongCuoi: string })[]> {
    const { maThietBi } = await getDeviceMetadata();
    const devices = await accountService.listDevices(maThietBi);
    return devices.map((device) => ({
      ...device,
      maPhien: Number(device.maPhien),
      tenThietBi: device.tenThietBi ?? 'Thiết bị không xác định',
      thoiGianHoatDongCuoi: device.thoiGianHoatDongCuoi ?? '',
    }));
  },
  requestRemoteLogoutOtp: accountService.requestRemoteLogoutOtp,
  async confirmRemoteLogout(payload: { OtpCode: string; DangXuatTatCa: boolean; DanhSachMaPhien?: (string | number)[] }): Promise<unknown> {
    return accountService.confirmRemoteLogout({
      otpCode: payload.OtpCode,
      dangXuatTatCa: payload.DangXuatTatCa,
      danhSachMaPhien: payload.DanhSachMaPhien,
    });
  },
};

export const accountOperations = {
  nextProfile: () => ++profileGeneration,
  isCurrentProfile: (id: number) => id === profileGeneration,
  nextDevices: () => ++deviceGeneration,
  isCurrentDevices: (id: number) => id === deviceGeneration,
};

export const isProfileCompatible = (profile: StudentProfile, auth: AuthPublicApi): boolean =>
  profile.vaiTro === 2 && profile.email.trim().toLowerCase() === (auth.user?.email ?? '').trim().toLowerCase();
