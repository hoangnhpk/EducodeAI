export interface KhoaHocGiangVienListDTO {
    maKhoaHoc: number;
    tenKhoaHoc: string;
    hinhAnh?: string;
    linhVuc: string;
    trinhDo: string;
    thoiLuongGio: number;
    soHocVien: number;
    tienDoTrungBinh: number;
    diemDanhGiaTB: number;
    trangThai?: string;
    coChungChi: boolean;
    daCoDeThiChungChi: boolean;
    ngayTao: string;
}

export interface HocVienTrongKhoaHocDTO {
    maNguoiDung: number;
    hoTen: string;
    email: string;
    anhDaiDien?: string;
    ngayDangKy: string;
    tienDo: number;
    diemTrungBinh?: number;
}

export interface BaiHocVideoDetailDTO {
    maBaiHoc: number;
    tieuDe: string;
    moTa?: string;
    linkVideo?: string;
    thoiLuong: number;
    thuTu: number;
}

export interface ChuongHocDetailDTO {
    maChuong: number;
    tenChuong: string;
    thuTu: number;
    danhSachBaiHoc: BaiHocVideoDetailDTO[];
}

export interface KhoaHocGiangVienDetailDTO {
    maKhoaHoc: number;
    tenKhoaHoc: string;
    moTa?: string;
    hinhAnh?: string;
    linhVuc: string;
    trinhDo: string;
    thoiLuongGio: number;
    trangThai?: string;
    ngayTao: string;
    coChungChi: boolean;
    tenChungChi?: string;
    diemDatChungChi: number;
    soCauHoiChungChi: number;
    thoiGianLamBaiChungChi: number;
    daCoDeThiChungChi: boolean;
    nguonDeChungChi?: string;
    ngayTaoDeChungChi?: string;
    soHocVien: number;
    tiLeHoanThanh: number;
    diemDanhGiaTB: number;
    danhSachHocVien: HocVienTrongKhoaHocDTO[];
    kyNangChinh?: string;
    danhSachChuong: ChuongHocDetailDTO[];
}

export interface KhoaHocCreateUpdateDTO {
    tenKhoaHoc: string;
    moTa?: string;
    hinhAnh?: string;
    linhVuc: string;
    trinhDo: string;
    thoiLuongGio: number;
    trangThai?: string;
    kyNangChinh?: string;
    coChungChi: boolean;
    tenChungChi?: string;
    diemDatChungChi: number;
    soCauHoiChungChi: number;
    thoiGianLamBaiChungChi: number;
}

export interface KetQuaTaoDeChungChiAIDTO {
    thanhCong: boolean;
    thongBao: string;
    soCauHoi: number;
    nguonDeChungChi?: string | null;
    ngayTaoDeChungChi?: string | null;
}

export interface ChuongHocDTO {
    maChuong: number;
    tenChuong: string;
    thuTu: number;
}

export interface ChuongHocCreateUpdateDTO {
    tenChuong: string;
    thuTu: number;
}

export interface ThemChuongResponseDTO {
    maChuong: number;
    tenChuong: string;
    thuTu: number;
}

export interface BaiHocVideoDTO {
    maBaiHoc: number;
    tieuDe: string;
    moTa?: string;
    linkVideo?: string;
    thoiLuong: number;
    thuTu: number;
}

export interface BaiHocVideoCreateUpdateDTO {
    tieuDe: string;
    moTa?: string;
    linkVideo?: string;
    thoiLuong: number;
    thuTu: number;
}

export interface ThemVideoResponseDTO {
    maBaiHoc: number;
    tieuDe: string;
    moTa?: string;
    linkVideo?: string;
    thoiLuong: number;
    thuTu: number;
}
