import axiosInstance from '@/configs/axios';

export const authService = {
  // ===== ĐĂNG NHẬP =====
  login: async (identifier: string, pass: string) => {
    const data = await axiosInstance.post<{
      token: string;
      user: any;
    }>('/NguoiDung/login', {
      UsernameOrEmail: identifier,
      Password: pass,
    });

    if (data?.token) {
      localStorage.setItem('user_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
    }

    return data;
  },

  // ===== GỬI OTP =====
  sendOtp: async (registerData: any) => {
    return await axiosInstance.post('/NguoiDung/send-otp', registerData);
  },

  // ===== XÁC NHẬN ĐĂNG KÝ =====
  confirmRegister: async (registerData: any) => {
    return await axiosInstance.post('/NguoiDung/confirm-register', registerData);
  },

  // ===== QUÊN MẬT KHẨU =====
  forgotPasswordSendOtp: async (email: string) => {
    return await axiosInstance.post(
      '/NguoiDung/forgot-password-send-otp',
      { Email: email }
    );
  },

  resetPassword: async (data: any) => {
    return await axiosInstance.post('/NguoiDung/reset-password', data);
  },
};
