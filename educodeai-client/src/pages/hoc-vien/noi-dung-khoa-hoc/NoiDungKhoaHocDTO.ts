export type LoaiBaiHocType = 'Video' | 'text' | 'ide' | 'quiz';

export interface BaiHoc {
    id: number;
    tieuDe: string;
    loaiBaiHoc: LoaiBaiHocType;
    noiDung?: string;
    thoiLuong: number;
    thuTu: number;
    linkVideo?: string | null;
    daXem?: boolean;
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