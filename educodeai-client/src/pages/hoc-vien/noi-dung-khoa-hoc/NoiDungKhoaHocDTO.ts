export type LoaiBaiHocType = 'Video' | 'Text' | 'Ide' | 'Quiz';

export interface TestCaseDTO {
    dauVao: string;
    ketQuaMongDoi: string;
}

export interface BaiTapThucHanhDTO {
    maBaiTapIDE: number;
    tieuDe: string;
    noiDungHTML: string;
    codeMau: string;
    testCases: TestCaseDTO[];
    maNgonNgu?: number | null;
}

export interface BaiTapQuizDTO {
    maBaiTapQuiz: number;
    maBaiTap: number;
    thoiGianLamBai?: number | null;
    diemCanDat: number;
    choPhepLamLai: boolean;
    daoCauHoi: boolean;
    duLieuCauHoiJSON: string; 
}

export interface BaiKiemTraChungChiDTO {
    maBaiKiemTra: number;
    tieuDe: string;
    moTa: string;
    soCauHoi: number;
    thoiGianLamBai?: number | null;
    diemCanDat: number;
    choPhepLamLai: boolean;
    daoCauHoi: boolean;
    duDieuKienDuThi: boolean;
    lyDoChuaDuDieuKien?: string | null;
    daCoDeThi: boolean;
    nguonDe?: string | null;
    duLieuCauHoiJSON: string;
}

export interface ThongTinChungChiDTO {
    daCap: boolean;
    maChungChi?: string | null;
    ngayCap?: string | null;
    soLanThi: number;
    diemLanGanNhat?: number | null;
    datLanGanNhat?: boolean | null;
    soCauDungLanGanNhat?: number | null;
    tongSoCauHoi: number;
    tenHocVien?: string | null;
    tenKhoaHoc?: string | null;
    tenChungChi?: string | null;
    hoTenHienThi?: string | null;
    emailNhan?: string | null;
    daGuiEmail: boolean;
    ngayGuiEmail?: string | null;
}


export interface BaiHoc {
    id: number;
    tieuDe: string;
    loaiBaiHoc: LoaiBaiHocType;
    noiDung?: string;
    thoiLuong: number;
    thuTu: number;
    linkVideo?: string | null;
    videoSource?: string | null;
    videoPublicId?: string | null;
    videoStatus?: string | null;
    hasSubtitle?: boolean;
    subtitleUrl?: string | null;
    daXem?: boolean;
    laHocThu?: boolean;
    biKhoa?: boolean;

    thongTinQuiz?: BaiTapQuizDTO | null;
    thongTinThucHanh?: BaiTapThucHanhDTO | null;
    maBaiTapThucHanh?: number | null;
}

export interface ChuongHoc {
    id: number;
    tieuDe: string;
    thuTu: number;
    danhSachBaiHoc: BaiHoc[]; 
}

export interface KhoaHocData {
    maKhoaHoc: number;
    tenKhoaHoc: string; 
    slug: string;
    coChungChi: boolean;
    tenChungChi?: string | null;
    danhSachChuongHoc: ChuongHoc[];
    baiKiemTraChungChi?: BaiKiemTraChungChiDTO | null;
    thongTinChungChi?: ThongTinChungChiDTO | null;
    donViTienTe?: string;
    daDangKy?: boolean;
    laCheDoHocThu?: boolean;
    soVideoHocThu?: number;
}

export interface GhiChuItem {
    id: number;
    thoiGianVideo: number;
    noiDung: string;
    ngayTao: string;
}
