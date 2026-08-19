import axiosInstance from '@/configs/axios';
import { getDeviceInfo } from '../utils/deviceHelper';
import { clearAuthTokens, getAuthTokens } from '../utils/authStorage';
import { stopSessionHub } from '../configs/sessionHub';
import { beginLogout, finishLogout } from '../utils/authLifecycle';

const api = axiosInstance as any;

export const authService = {
  registerGiangVien: async (formData: FormData) => {
    return await api.post('/api/XacThuc/dang-ky-giang-vien', formData);
  },

  scanIdentityDocument: async (formData: FormData) => {
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

  googleLogin: async (payload: { credential: string }, maThietBi: string, tenThietBi: string) => {
    return await api.post(`/api/XacThuc/google-login?maThietBi=${maThietBi}&tenThietBi=${tenThietBi}`, payload);
  },

  facebookLogin: async (payload: { accessToken: string }, maThietBi: string, tenThietBi: string) => {
    return await api.post(`/api/XacThuc/facebook-login?maThietBi=${maThietBi}&tenThietBi=${tenThietBi}`, payload);
  },

  refreshToken: async (maThietBi: string) => {
    // Refresh token nằm trong HttpOnly cookie; gửi kèm nhờ withCredentials.
    return await api.post('/api/XacThuc/refresh-token', { maThietBi }, { withCredentials: true });
  },

  logout: async () => {
    const { maThietBi } = getDeviceInfo();
    beginLogout();
    const accessToken = getAuthTokens().accessToken;
    clearAuthTokens();
    localStorage.removeItem('user_info');
    await stopSessionHub();
    try {
      if (accessToken) {
        await api.post('/api/XacThuc/dang-xuat', `"${maThietBi}"`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } finally {
      finishLogout();
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

  getDevices: async (maThietBiHienTai: string) => {
    return await api.get('/api/XacThuc/danh-sach-thiet-bi', { params: { maThietBiHienTai } });
  },

  doiMatKhau: async (payload: { MatKhauCu: string; MatKhauMoi: string }) => {
    return await api.post('/api/XacThuc/doi-mat-khau', payload);
  },

  requestOtpDangXuatTuXa: async () => {
    return await api.post('/api/XacThuc/yeu-cau-otp-dang-xuat-tu-xa');
  },

  xacNhanDangXuatTuXa: async (payload: { DangXuatTatCa: boolean; DanhSachMaPhien: number[]; OtpCode: string; CaptchaToken: string }) => {
    return await api.post('/api/XacThuc/xac-nhan-dang-xuat-tu-xa', payload);
  }
};

