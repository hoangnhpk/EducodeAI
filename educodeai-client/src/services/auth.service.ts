import axiosInstance from '@/configs/axios';
import { getDeviceInfo } from '../utils/deviceHelper';

const api = axiosInstance as any;

export const authService = {
  registerGiangVien: async (formData: FormData) => {
    return await api.post('/api/XacThuc/dang-ky-giang-vien', formData);
  },

  checkEmail: async (email: string) => {
    return await api.get('/api/NguoiDung/check-email', { params: { email } });
  },

  sendInstructorEmailOtp: async (email: string) => {
    return await api.post('/api/XacThuc/giang-vien/gui-otp-email', { email });
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

  login: async (identifier: string, pass: string, captcha: string = 'SKIP_CAPTCHA') => {
    const { maThietBi, tenThietBi } = getDeviceInfo();
    return await api.post('/api/XacThuc/dang-nhap', {
      taiKhoan: identifier,
      matKhau: pass,
      maThietBi,
      tenThietBi,
      captchaToken: captcha
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

  googleLogin: async (payload: { email: string; name: string; picture: string }, maThietBi: string, tenThietBi: string) => {
    return await api.post(`/api/XacThuc/google-login?maThietBi=${maThietBi}&tenThietBi=${tenThietBi}`, payload);
  },

  facebookLogin: async (payload: { email: string; name: string; picture: string; userID: string }, maThietBi: string, tenThietBi: string) => {
    return await api.post(`/api/XacThuc/facebook-login?maThietBi=${maThietBi}&tenThietBi=${tenThietBi}`, payload);
  },

  refreshToken: async (refreshToken: string, maThietBi: string) => {
    return await api.post(`/api/XacThuc/refresh-token?refreshToken=${refreshToken}&maThietBi=${maThietBi}`);
  },

  logout: async () => {
    const { maThietBi } = getDeviceInfo();
    try {
      await api.post('/api/XacThuc/dang-xuat', `"${maThietBi}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
    } finally {
      localStorage.removeItem('user_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user_info');
    }
  },

  forgotPasswordSendOtp: async (emailValue: string) => {
    return await api.post('/api/XacThuc/quen-mat-khau', { email: emailValue });
  },

  resetPassword: async (payload: { Email: string; NewPassword: string; OtpCode: string }) => {
    const { maThietBi, tenThietBi } = getDeviceInfo();
    return await api.post('/api/XacThuc/dat-lai-mat-khau', {
      email: payload.Email,
      NewPassword: payload.NewPassword,
      OtpCode: payload.OtpCode,
      maThietBi,
      tenThietBi
    });
  },

  getDevices: async (maThietBiHienTai: string) => {
    return await api.get('/api/XacThuc/danh-sach-thiet-bi', { params: { maThietBiHienTai } });
  },

  logoutDevice: async (maThietBiCanXoa: string) => {
    return await api.post('/api/XacThuc/dang-xuat', `"${maThietBiCanXoa}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  doiMatKhau: async (payload: { MatKhauCu: string; MatKhauMoi: string; OtpCode: string }) => {
    return await api.post('/api/XacThuc/doi-mat-khau', payload);
  },

  requestOtpDangXuatTuXa: async () => {
    return await api.post('/api/XacThuc/yeu-cau-otp-dang-xuat-tu-xa');
  },

  xacNhanDangXuatTuXa: async (payload: { DangXuatTatCa: boolean; DanhSachMaPhien: number[]; OtpCode: string; CaptchaToken: string }) => {
    return await api.post('/api/XacThuc/xac-nhan-dang-xuat-tu-xa', payload);
  }
};
