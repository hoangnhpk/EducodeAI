import axiosInstance from '@/configs/axios';

// Ép kiểu any cho api để bypass lỗi TypeScript nhanh
const api = axiosInstance as any;

export const authService: any = {
  // ===== ĐĂNG NHẬP =====
  login: async (identifier: string, pass: string) => {
    const data = await api.post('/NguoiDung/login', {
      UsernameOrEmail: identifier,
      Password: pass,
    });

    // SỬA Ở ĐÂY: Phải kiểm tra 'data' chứ không phải 'res'
    if (!data?.token) {
      throw new Error('Login response không có token');
    }

    // Lưu token vào localStorage ngay tại đây để đồng bộ với Interceptor
    localStorage.setItem('user_token', data.token);

    return data;
  },
 googleLogin: async (payload: { token: string }) => {
    // Gửi token nhận từ Google lên Backend
    return await api.post('/api/NguoiDung/google-login', payload);
  },
  // ===== KIỂM TRA EMAIL TỒN TẠI =====
  checkEmail: async (email: string) => {
    // Phải return trực tiếp kết quả để RegisterPage nhận được { exists: true/false }
    return await api.get('/NguoiDung/check-email', {
      params: { email },
    });
  },

  // ===== GỬI OTP (ĐĂNG KÝ) =====
  sendOtp: async (registerData: any) => {
    return await api.post('/NguoiDung/send-otp', registerData);
  },

  // ===== XÁC NHẬN ĐĂNG KÝ =====
  confirmRegister: async (registerData: any) => {
    return await api.post('/NguoiDung/confirm-register', registerData);
  },

  // ===== QUÊN MẬT KHẨU (GỬI OTP) =====
  forgotPasswordSendOtp: async (email: string) => {
    return await api.post('/NguoiDung/forgot-password-send-otp', {
      Email: email,
    });
  },

  // ===== ĐẶT LẠI MẬT KHẨU =====
  resetPassword: async (data: any) => {
    return await api.post('/NguoiDung/reset-password', data);
  },

  // ===== ĐĂNG XUẤT =====
  logout: () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
  },
  googleLogin: async (payload: { token: string }) => {
    // Gửi token nhận từ Google lên Backend
    return await api.post('/api/NguoiDung/google-login', payload);
  },
};
