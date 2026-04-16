// ==================== BÌNH LUẬN ====================
export interface BinhLuan {
  maBinhLuan: number;
  maNguoiDung: number;
  tenNguoiDung: string; // Join từ bảng NguoiDung
  avatarUrl?: string;
  maBaiHoc: number;
  tenBaiHoc: string; // Join từ bảng BaiHoc
  noiDung: string;
  maBinhLuanCha: number | null;
  ngayTao: string;
  trangThai: 'ChoDuyet' | 'DaDuyet' | 'TuChoi';
}

// ==================== ĐÁNH GIÁ ====================
export interface DanhGia {
  maDanhGia: number;
  maNguoiDung: number;
  tenNguoiDung: string; // Join từ bảng NguoiDung
  avatarUrl?: string;
  maKhoaHoc: number;
  tenKhoaHoc: string; // Join từ bảng KhoaHoc
  soSao: number; // 1-5
  nhanXet: string;
  ngayDanhGia: string;
  trangThai: 'ChoDuyet' | 'DaDuyet' | 'TuChoi';
}

// ==================== THỐNG KÊ ====================
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

export interface KhoaHoc {
  id: number;
  tenKhoaHoc: string;
}

// ==================== FILTER PARAMS ====================
export interface ReviewFilterParams {
  loai?: 'BinhLuan' | 'DanhGia' | 'TatCa';
  trangThai?: 'ChoDuyet' | 'DaDuyet' | 'TuChoi' | 'TatCa';
  soSao?: number | 'TatCa';
  maKhoaHoc?: number | 'TatCa';
  search?: string;
  tuNgay?: string;
  denNgay?: string;
  page?: number;
  pageSize?: number;
}

// ==================== PAGED RESULT ====================
export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== COMBINED TYPE ====================
export type ReviewItem = {
  id: number;
  loai: 'BinhLuan' | 'DanhGia';
  nguoiDung: {
    id: number;
    ten: string;
    avatar?: string;
  };
  tieuDe: string; // Tên bài học hoặc khóa học
  noiDung: string;
  soSao?: number; // Chỉ có với đánh giá
  ngayTao: string;
  trangThai: 'ChoDuyet' | 'DaDuyet' | 'TuChoi';
};