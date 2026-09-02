import type { AxiosError } from 'axios';

export interface StudentProfile {
  maNguoiDung?: number;
  hoTen: string;
  email?: string;
  taiKhoan?: string;
  anhDaiDien?: string | null;
}

export interface ProfileImageFile {
  uri: string;
  name: string;
  type: string;
}

export interface DeviceSession {
  maPhien: number;
  tenThietBi: string;
  isCurrentDevice: boolean;
  thoiGianHoatDongCuoi: string;
}

export interface ConfirmRemoteLogoutPayload {
  OtpCode: string;
  DangXuatTatCa: boolean;
  DanhSachMaPhien: number[];
}

interface ApiErrorBody {
  message?: string;
  Message?: string;
}

export function getAccountErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError.response?.data?.message ?? axiosError.response?.data?.Message ?? fallback;
}
