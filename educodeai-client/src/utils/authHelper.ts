// src/utils/authHelper.ts

export interface UserInfo {
    maNguoiDung?: number;
    email?: string;
    hoTen?: string;
    taiKhoan?: string;
    anhDaiDien?: string | null;
    [key: string]: any;
}

/**
 * Hàm lấy ID của người dùng đang đăng nhập
 * @returns {number | null}
 */
export const getUserId = (): number | null => {
    try {
        const userInfoStr = localStorage.getItem('user_info');
        
        if (!userInfoStr) {
            return null;
        }

        const userInfo: UserInfo = JSON.parse(userInfoStr);

        // Lấy trường maNguoiDung theo đúng dữ liệu của bạn
        if (userInfo && userInfo.maNguoiDung) {
            return Number(userInfo.maNguoiDung); 
        }

        return null;
    } catch (error) {
        console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", error);
        return null;
    }
};

/**
 * (Tùy chọn) Hàm lấy toàn bộ thông tin User
 */
export const getUserInfo = (): UserInfo | null => {
    try {
        const userInfoStr = localStorage.getItem('user_info');
        return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch (error) {
        return null;
    }
};