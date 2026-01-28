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


export interface BaiHoc {
    id: number;
    tieuDe: string;
    loaiBaiHoc: LoaiBaiHocType;
    noiDung?: string;
    thoiLuong: number;
    thuTu: number;
    linkVideo?: string | null;
    daXem?: boolean;

    thongTinQuiz?: BaiTapQuizDTO | null;
    thongTinThucHanh?: BaiTapThucHanhDTO | null;
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
    danhSachChuongHoc: ChuongHoc[];
}

export interface GhiChuItem {
    id: number;
    thoiGianVideo: number;
    noiDung: string;
    ngayTao: string;
}