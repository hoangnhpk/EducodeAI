export type ReviewLoai = 'BinhLuan' | 'DanhGia';
export type ReviewTrangThai = 'ChoDuyet' | 'DaDuyet' | 'TuChoi';
export type FilterLoai = ReviewLoai | 'TatCa';
export type FilterTrangThai = ReviewTrangThai | 'TatCa';
export type FilterSoSao = 1 | 2 | 3 | 4 | 5 | 'TatCa';
export type ReviewSource = 'api' | 'mock';

export interface ReviewLinkedTarget {
  loaiDoiTuong: 'BaiHoc' | 'KhoaHoc';
  tenDoiTuong: string;
  tenKhoaHoc: string;
}

export interface ReviewUserInfo {
  id: number;
  ten: string;
  email?: string;
  avatar?: string;
}

export interface ReviewItem {
  id: number;
  loai: ReviewLoai;
  nguoiDung: ReviewUserInfo;
  tieuDe: string;
  noiDung: string;
  soSao?: number;
  ngayTao: string;
  trangThai: ReviewTrangThai;
  lienKet: ReviewLinkedTarget;
}

export interface ThongKeReview {
  tongBinhLuan: number;
  tongDanhGia: number;
  choDuyet: number;
  daDuyet: number;
  tuChoi: number;
  danhGiaTrungBinh: number;
  phanBoSao: {
    star1: number;
    star2: number;
    star3: number;
    star4: number;
    star5: number;
  };
}

export interface ReviewFilterParams {
  loai?: FilterLoai;
  trangThai?: FilterTrangThai;
  soSao?: FilterSoSao;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReviewMutationResponse {
  success: boolean;
  message?: string;
}

export interface ReviewServiceResult<T> {
  source: ReviewSource;
  data: T;
}
