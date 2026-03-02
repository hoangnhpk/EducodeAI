export interface NguoiDung {
    maNguoiDung: string;
    hoTen?: string;
    email?: string;
    anhDaiDien?: string;
    vaiTro: string;       // "Admin" | "Giảng viên" | "Học viên"
    trangThai: boolean;   // true = Hoạt động
    ngayTao?: string;
}