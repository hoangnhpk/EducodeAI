import axiosInstance from '../configs/axios';

export const authService = {
    // 1. Hàm Đăng nhập
    login: async (identifier: string, pass: string) => {
        const response = await axiosInstance.post('/NguoiDung/login', {
            // Đảm bảo Key viết hoa chữ cái đầu nếu Backend dùng PascalCase
            UsernameOrEmail: identifier, 
            Password: pass
        });
        
        if (response.data.token) {
            localStorage.setItem('user_token', response.data.token);
            localStorage.setItem('user_info', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // 2. Hàm Gửi OTP (Dùng cho Đăng ký)
    sendOtp: async (registerData: any) => {
        // registerData nên là: { HoTen, Email, TaiKhoan, MatKhau }
        const response = await axiosInstance.post('/NguoiDung/send-otp', registerData);
        return response.data; 
    },

    // 3. Hàm Xác nhận đăng ký
    confirmRegister: async (registerData: any) => {
        const response = await axiosInstance.post('/NguoiDung/confirm-register', registerData);
        return response.data;
    },
    forgotPasswordSendOtp: async (email: string) => {
        const response = await axiosInstance.post('/NguoiDung/forgot-password-send-otp', { Email: email });
        return response.data;
    },
    resetPassword: async (data: any) => {
        const response = await axiosInstance.post('/NguoiDung/reset-password', data);
        return response.data;
    }
};