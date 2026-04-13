import axiosInstance from '@/configs/axios';
import { getDeviceInfo } from '../utils/deviceHelper';

const api = axiosInstance as any;

export const authService = {
  // 1. KIỂM TRA EMAIL (Dùng ở trang Đăng ký)
  checkEmail: async (email: string) => {
    return await api.get('/api/NguoiDung/check-email', { params: { email } });
  },

  // 2. YÊU CẦU ĐĂNG KÝ (Gửi thông tin lên RAM, nhận OTP về Email)
  sendOtpRegister: async (registerData: any, captchaToken: string) => {
    return await api.post('/api/XacThuc/dang-ky', {
      hoTen: registerData.fullname,       // Fix: lấy từ fullname
      taiKhoan: registerData.username,    // Fix: Backend thường cần tài khoản (username)
      email: registerData.email,
      matKhau: registerData.password,     // Fix: lấy từ password
      captchaToken: captchaToken          // Lấy token thật từ giao diện truyền vào
    });
  },

  // 3. XÁC NHẬN ĐĂNG KÝ (Lưu chính thức vào Database)
  confirmRegister: async (email: string, otpCode: string) => {
    const { maThietBi, tenThietBi } = getDeviceInfo();
    return await api.post('/api/XacThuc/xac-minh-dang-ky', {
      taiKhoan: email, // Truyền Email vào đây
      otpCode,
      maThietBi,
      tenThietBi
    });
},

  // 4. ĐĂNG NHẬP BƯỚC 1 & 2
  // Thêm tham số captcha, mặc định là "SKIP_CAPTCHA" để khớp với Backend
  login: async (identifier: string, pass: string, captcha: string = "SKIP_CAPTCHA") => {
    const { maThietBi, tenThietBi } = getDeviceInfo();
    return await api.post('/api/XacThuc/dang-nhap', {
      taiKhoan: identifier,
      matKhau: pass,
      maThietBi,
      tenThietBi,
      captchaToken: captcha // Truyền biến captcha vào đây, KHÔNG gắn cứng string nữa
    });
  },

  // 5. XÁC NHẬN MÃ OTP (Để chốt hạ lấy Token)
  confirmLogin: async (payload: { taiKhoan: string, otpCode?: string }) => {
    const { maThietBi, tenThietBi } = getDeviceInfo();

    // ĐỔI TÊN ĐƯỜNG LINK Ở ĐÂY CHO KHỚP VỚI BACKEND
    return await api.post('/api/XacThuc/xac-nhan-otp', {
      ...payload,
      maThietBi,
      tenThietBi
    });
  },

  // 6. ĐĂNG NHẬP BẰNG GOOGLE / FACEBOOK
  googleLogin: async (payload: { email: string, name: string, picture: string }, maThietBi: string, tenThietBi: string) => {
    return await api.post(`/api/XacThuc/google-login?maThietBi=${maThietBi}&tenThietBi=${tenThietBi}`, payload);
  },

  facebookLogin: async (payload: { email: string, name: string, picture: string, userID: string }, maThietBi: string, tenThietBi: string) => {
    return await api.post(`/api/XacThuc/facebook-login?maThietBi=${maThietBi}&tenThietBi=${tenThietBi}`, payload);
  },

  refreshToken: async (refreshToken: string, maThietBi: string) => {
    return await api.post(`/api/XacThuc/refresh-token?refreshToken=${refreshToken}&maThietBi=${maThietBi}`);
  },

  // 7. ĐĂNG XUẤT
  logout: async () => {
    const { maThietBi } = getDeviceInfo();
    try {
      await api.post('/api/XacThuc/dang-xuat', { maThietBi });
    } finally {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_info');
    }
  },
  // 8. QUÊN MẬT KHẨU - YÊU CẦU GỬI OTP
  forgotPasswordSendOtp: async (emailValue: string) => {
    // LƯU Ý QUAN TRỌNG: Phải bọc trong cặp ngoặc nhọn { } để biến thành Object JSON
    // Nếu bạn chỉ gửi chữ emailValue trơn, Backend (C#) sẽ không hiểu và nhận giá trị null.
    return await api.post('/api/XacThuc/quen-mat-khau', { 
        email: emailValue 
    });
  },

  // 9. ĐẶT LẠI MẬT KHẨU MỚI
  resetPassword: async (payload: { Email: string, NewPassword: string, OtpCode: string }) => {
    const { maThietBi, tenThietBi } = getDeviceInfo();
    return await api.post('/api/XacThuc/dat-lai-mat-khau', {
        email: payload.Email,
        NewPassword: payload.NewPassword, // Gửi đúng tên trường cho Backend
        OtpCode: payload.OtpCode,
        maThietBi,
        tenThietBi
    });
  },
  // --- QUẢN LÝ THIẾT BỊ ---
  
  // 10. Lấy danh sách thiết bị đang đăng nhập
  getDevices: async (maThietBiHienTai: string) => {
    return await api.get('/api/XacThuc/danh-sach-thiet-bi', { params: { maThietBiHienTai } });
  },

  // 11. Đăng xuất 1 thiết bị cụ thể (khi click nút Đăng xuất trên danh sách)
  logoutDevice: async (maThietBiCanXoa: string) => {
    return await api.post('/api/XacThuc/dang-xuat', `"${maThietBiCanXoa}"`, {
        headers: { 'Content-Type': 'application/json' }
    });
  },

  // --- ĐỔI MẬT KHẨU BÊN TRONG HỆ THỐNG ---

  // 12. Yêu cầu gửi mã OTP để đổi mật khẩu
  requestOtpDoiMatKhau: async () => {
    return await api.post('/api/XacThuc/yeu-cau-otp-doi-mat-khau');
  },

  // 13. Submit Đổi mật khẩu
  doiMatKhau: async (payload: { MatKhauCu: string, MatKhauMoi: string, OtpCode: string }) => {
    return await api.post('/api/XacThuc/doi-mat-khau', payload);
  },

  // Yêu cầu OTP để đăng xuất từ xa
  requestOtpDangXuatTuXa: async () => {
    return await api.post('/api/XacThuc/yeu-cau-otp-dang-xuat-tu-xa');
  },

  // Xác nhận OTP để chốt hạ đăng xuất từ xa
  xacNhanDangXuatTuXa: async (payload: { DangXuatTatCa: boolean, DanhSachMaPhien: number[], OtpCode: string, CaptchaToken: string }) => {
    return await api.post('/api/XacThuc/xac-nhan-dang-xuat-tu-xa', payload);
  }
};