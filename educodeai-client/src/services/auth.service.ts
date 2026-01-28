import axiosInstance from '@/configs/axios';

interface LoginResponse {
  token: string;
  user: any;
}

export const authService = {
  login: async (identifier: string, pass: string) => {
    const res = await axiosInstance.post<LoginResponse>('/NguoiDung/login', {
      UsernameOrEmail: identifier,
      Password: pass,
    });

    if (!res?.token) {
      throw new Error('Login response không có token');
    }

    localStorage.setItem('user_token', res.token);
    localStorage.setItem('user_info', JSON.stringify(res.user));

    return res;
  },

  sendOtp: (registerData: any) =>
    axiosInstance.post('/NguoiDung/send-otp', registerData),

  confirmRegister: (registerData: any) =>
    axiosInstance.post('/NguoiDung/confirm-register', registerData),

  forgotPasswordSendOtp: (email: string) =>
    axiosInstance.post('/NguoiDung/forgot-password-send-otp', { Email: email }),

  resetPassword: (data: any) =>
    axiosInstance.post('/NguoiDung/reset-password', data),
};
