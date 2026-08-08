import axiosInstance from '@/configs/axios';
import { getDeviceInfo } from '../utils/deviceHelper';
import { clearLocalSession } from '../utils/sessionTermination';
import { stopSessionHub } from '../configs/sessionHub';

const api = axiosInstance as any;

export interface IdentityScanResponse {
  thanhCong?: boolean;
  ThanhCong?: boolean;
  thongBao?: string;
  ThongBao?: string;
  soGiayTo?: string;
  SoGiayTo?: string;
  hoTen?: string;
  HoTen?: string;
  ngaySinh?: string;
  NgaySinh?: string;
  gioiTinh?: string;
  GioiTinh?: string;
  ngayCap?: string;
  NgayCap?: string;
  noiCap?: string;
  NoiCap?: string;
  diaChi?: string;
  DiaChi?: string;
  quocTich?: string;
  QuocTich?: string;
  danToc?: string;
  DanToc?: string;
  tonGiao?: string;
  TonGiao?: string;
  nguyenQuan?: string;
  NguyenQuan?: string;
}

export const authService = {
  registerGiangVien: async (formData: FormData) => {
    return await api.post('/api/XacThuc/dang-ky-giang-vien', formData);
  },

  scanIdentityDocument: async (formData: FormData): Promise<IdentityScanResponse> => {
    // Khong set Content-Type thu cong de axios tu them boundary
    return await api.post('/api/XacThuc/quet-giay-to', formData, { timeout: 120000 });
  },

  checkEmail: async (email: string) => {
    return await api.get('/api/NguoiDung/check-email', { params: { email } });
  },

  sendInstructorEmailOtp: async (email: string, captchaToken: string) => {
    return await api.post('/api/XacThuc/giang-vien/gui-otp-email', { email, captchaToken });
  },

  verifyInstructorEmailOtp: async (email: string, otpCode: string) => {
    return await api.post('/api/XacThuc/giang-vien/xac-minh-otp-email', { email, otpCode });
  },

  sendOtpRegister: async (registerData: any, captchaToken: string) => {
    return await api.post('/api/XacThuc/dang-ky', {
      hoTen: registerData.fullname,
      taiKhoan: registerData.username,
      email: registerData.email,
      matKhau: registerData.password,
      captchaToken
    });
  },

  confirmRegister: async (email: string, otpCode: string) => {
    const { maThietBi, tenThietBi } = getDeviceInfo();
    return await api.post('/api/XacThuc/xac-minh-dang-ky', {
      taiKhoan: email,
      otpCode,
      maThietBi,
      tenThietBi
    });
  },

  login: async (identifier: string, pass: string, captcha?: string) => {
    const { maThietBi, tenThietBi } = getDeviceInfo();
    return await api.post('/api/XacThuc/dang-nhap', {
      taiKhoan: identifier.trim(),
      matKhau: pass,
      maThietBi,
      tenThietBi,
      ...(captcha ? { captchaToken: captcha } : {})
    });
  },

  confirmLogin: async (payload: { taiKhoan: string; otpCode?: string }) => {
    const { maThietBi, tenThietBi } = getDeviceInfo();
    return await api.post('/api/XacThuc/xac-nhan-otp', {
      ...payload,
      maThietBi,
      tenThietBi
    });
  },

  confirmReplaceDevice: async (payload: { taiKhoan: string; otpCode: string }) => {
    const { maThietBi, tenThietBi } = getDeviceInfo();
    return await api.post('/api/XacThuc/xac-nhan-thay-the-thiet-bi', {
      ...payload,
      maThietBi,
      tenThietBi
    });
  },

  googleLogin: async (payload: { credential: string }, maThietBi: string, tenThietBi: string) => {
    return await api.post('/api/XacThuc/google-login', payload, {
      params: { maThietBi, tenThietBi }
    });
  },

  facebookLogin: async (payload: { accessToken: string }, maThietBi: string, tenThietBi: string) => {
    return await api.post('/api/XacThuc/facebook-login', payload, {
      params: { maThietBi, tenThietBi }
    });
  },

  refreshToken: async (maThietBi: string) => {
    // Refresh token nằm trong HttpOnly cookie; gửi kèm nhờ withCredentials.
    return await api.post('/api/XacThuc/refresh-token', { maThietBi }, { withCredentials: true });
  },

  logout: async () => {
    const { maThietBi } = getDeviceInfo();
    await stopSessionHub();
    try {
      await api.post('/api/XacThuc/dang-xuat', `"${maThietBi}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
    } finally {
      clearLocalSession();
    }
  },

  forgotPasswordSendOtp: async (emailValue: string, captchaToken: string) => {
    return await api.post('/api/XacThuc/quen-mat-khau', { email: emailValue, captchaToken });
  },

  verifyForgotPasswordOtp: async (email: string, otpCode: string) => {
    return await api.post('/api/XacThuc/xac-minh-otp-quen-mat-khau', { email, otpCode });
  },

  resetPassword: async (payload: { Email: string; NewPassword: string; ResetToken: string }) => {
    const { maThietBi, tenThietBi } = getDeviceInfo();
    return await api.post('/api/XacThuc/dat-lai-mat-khau', {
      email: payload.Email,
      NewPassword: payload.NewPassword,
      ResetToken: payload.ResetToken,
      maThietBi,
      tenThietBi
    });
  },

  getDevices: async () => {
    return await api.get('/api/XacThuc/danh-sach-thiet-bi');
  },

  doiMatKhau: async (payload: { MatKhauCu: string; MatKhauMoi: string }) => {
    return await api.post('/api/XacThuc/doi-mat-khau', payload);
  },

  requestOtpDangXuatTuXa: async (captchaToken: string) => {
    return await api.post('/api/XacThuc/yeu-cau-otp-dang-xuat-tu-xa', { captchaToken });
  },

  xacNhanDangXuatTuXa: async (payload: { DangXuatTatCa: boolean; DanhSachMaPhien: number[]; OtpCode: string }) => {
    return await api.post('/api/XacThuc/xac-nhan-dang-xuat-tu-xa', payload);
  }
};

