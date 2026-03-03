// ===== DANH SÁCH KHÓA HỌC =====
export interface KhoaHocGiangVienListDTO {
    maKhoaHoc:        number;
    tenKhoaHoc:       string;
    hinhAnh?:         string;
    linhVuc:          string;
    trinhDo:          string;
    thoiLuongGio:     number;
    soHocVien:        number;
    tienDoTrungBinh:  number;  // BE đã fix — được tính từ Average(TienDo)
    diemDanhGiaTB:    number;
    trangThai?:       string;
    ngayTao:          string;
}

// ===== HỌC VIÊN =====
export interface HocVienTrongKhoaHocDTO {
    maNguoiDung:   number;
    hoTen:         string;
    email:         string;
    anhDaiDien?:   string;
    ngayDangKy:    string;
    tienDo:        number;
    diemTrungBinh?: number;  // BE đã fix — được map từ DangKyKhoaHoc.DiemTrungBinh
}

// ===== BÀI HỌC VIDEO (trong Detail) =====
// BE đã thêm — được trả về từ GetChiTiet qua ChuongHocDetailDTO
export interface BaiHocVideoDetailDTO {
    maBaiHoc:   number;
    tieuDe:     string;
    moTa?:      string;
    linkVideo?: string;
    thoiLuong:  number;
    thuTu:      number;
}

// ===== CHƯƠNG HỌC (trong Detail) =====
// BE đã thêm — được trả về từ GetChiTiet
export interface ChuongHocDetailDTO {
    maChuong:        number;
    tenChuong:       string;
    thuTu:           number;
    danhSachBaiHoc:  BaiHocVideoDetailDTO[];
}

// ===== CHI TIẾT KHÓA HỌC =====
export interface KhoaHocGiangVienDetailDTO {
    maKhoaHoc:        number;
    tenKhoaHoc:       string;
    moTa?:            string;
    hinhAnh?:         string;
    linhVuc:          string;
    trinhDo:          string;
    thoiLuongGio:     number;
    trangThai?:       string;
    ngayTao:          string;
    soHocVien:        number;
    tiLeHoanThanh:    number;
    diemDanhGiaTB:    number;
    danhSachHocVien:  HocVienTrongKhoaHocDTO[];
    kyNangChinh?:     string;       // BE đã fix — được trả về trong GetChiTiet
    danhSachChuong:   ChuongHocDetailDTO[];  // BE đã thêm
}

// ===== TẠO / CẬP NHẬT KHÓA HỌC =====
export interface KhoaHocCreateUpdateDTO {
    tenKhoaHoc:    string;
    moTa?:         string;
    hinhAnh?:      string;
    linhVuc:       string;
    trinhDo:       string;
    thoiLuongGio:  number;
    trangThai?:    string;
    kyNangChinh?:  string;  // BE đã fix — được map khi Tao và CapNhat
}

// ===== CHƯƠNG HỌC =====
export interface ChuongHocDTO {
    maChuong:  number;
    tenChuong: string;
    thuTu:     number;
}

export interface ChuongHocCreateUpdateDTO {
    tenChuong: string;
    thuTu:     number;
}

// BE đã fix — ThemChuong trả về object có ID thật thay vì bool
export interface ThemChuongResponseDTO {
    maChuong:  number;
    tenChuong: string;
    thuTu:     number;
}

// ===== BÀI HỌC VIDEO =====
export interface BaiHocVideoDTO {
    maBaiHoc:   number;
    tieuDe:     string;
    moTa?:      string;
    linkVideo?: string;
    thoiLuong:  number;
    thuTu:      number;
}

export interface BaiHocVideoCreateUpdateDTO {
    tieuDe:     string;
    moTa?:      string;
    linkVideo?: string;
    thoiLuong:  number;
    thuTu:      number;
}

// BE đã fix — ThemVideo trả về object có ID thật thay vì bool
export interface ThemVideoResponseDTO {
    maBaiHoc:   number;
    tieuDe:     string;
    moTa?:      string;
    linkVideo?: string;
    thoiLuong:  number;
    thuTu:      number;
}
