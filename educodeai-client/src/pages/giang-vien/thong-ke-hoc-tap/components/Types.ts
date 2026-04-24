// ================== API RESPONSE TYPES ==================

export interface PagedResult<T> {
  total: number;
  data: T[];
}

export interface ThongKeOverview {
  gioHocTrungBinh?: number | null;
  soKhoaHocDangDay?: number | null;
  tongBaiTap?: number | null;
  tyLeHoanThanhTB?: number | null;
}

export interface TrangThaiHocVien {
  trangThai: string;
  soLuong: number;
}

export interface TienDoTheoThoiGian {
  tuan: number;
  tyLeHoanThanh: number;
}

export type NhomThuNhapTheoThoiGian = 'day' | 'week' | 'month';

export interface ThuNhapTongQuan {
  tongDoanhThu: number;
  tongPhiNenTang: number;
  tongThucNhan: number;
  thucNhanThangNay: number;
  tongDonHang: number;
}

export interface ThuNhapTheoThoiGian {
  nhanThoiGian: string;
  tongDoanhThu: number;
  phiNenTang: number;
  thucNhan: number;
}

export interface ThuNhapTheoKhoaHoc {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  soDonHang: number;
  tongDoanhThu: number;
  phiNenTang: number;
  thucNhan: number;
}

export interface HocVien {
  maHocVien?: number;
  maNguoiDung?: number;
  tenHocVien?: string | null;
  hoTen?: string | null;
  email?: string | null;
  anhDaiDien?: string;
  soKhoaHocThamGia?: number | null;
  soBaiTapHoanThanh?: number | null;
  tongBaiTap?: number | null;
  tyLeHoanThanh?: number | null;
  diemTrungBinh?: number | null;
  tienDo?: number | null;
  soBaiDaNop?: number | null;
  gioHoc?: number | null;
  trangThai?: string;
}

export interface HocVienParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  completion: number;
  assignments: number;
  avgScore: number;
  status: 'completed' | 'in-progress' | 'at-risk';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ProgressDataPoint {
  week: string;
  value: number;
}
