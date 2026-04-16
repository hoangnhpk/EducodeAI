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

        const raw =
            userInfo?.maNguoiDung ??
            userInfo?.MaNguoiDung ??
            userInfo?.id ??
            userInfo?.Id ??
            userInfo?.userId ??
            userInfo?.UserId;

        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) return n;

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