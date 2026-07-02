export type ReviewTrangThai = 'ChoDuyet' | 'DaDuyet' | 'TuChoi';
export type FilterTrangThai = ReviewTrangThai | 'TatCa';
export type FilterSoSao = 1 | 2 | 3 | 4 | 5 | 'TatCa';
export type ReviewSource = 'api' | 'mock';

export interface ReviewCourseInfo {
  id: number;
  tenKhoaHoc: string;
  giangVien?: string;
}

export interface ReviewUserInfo {
  id: number;
  ten: string;
  email?: string;
  avatar?: string;
}

export interface ReviewItem {
  id: number;
  maNguoiDung: number;
  maKhoaHoc: number;
  nguoiDung: ReviewUserInfo;
  khoaHoc: ReviewCourseInfo;
  noiDung: string;
  soSao: number;
  ngayTao: string;
  trangThai: ReviewTrangThai;
}

export interface ThongKeReview {
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

export type FilterMaKhoaHoc = number | 'TatCa';

export interface ReviewFilterParams {
  trangThai?: FilterTrangThai;
  soSao?: FilterSoSao;
  maKhoaHoc?: FilterMaKhoaHoc;
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
