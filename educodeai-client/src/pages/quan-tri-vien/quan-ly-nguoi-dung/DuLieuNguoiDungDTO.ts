export interface NguoiDung {
    maNguoiDung: string;
    hoTen?: string;
    email?: string;
    anhDaiDien?: string;
    vaiTro: string;       // "Admin" | "Giảng viên" | "Học viên"
    trangThai: string;    // "Hoạt động" | "Bị khóa" | "Khóa vĩnh viễn"
    ngayTao?: string;
    lyDoKhoa?: string;
    thoiGianMoKhoa?: string;
    statusText?: string;
}