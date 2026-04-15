// ================== API RESPONSE TYPES ==================

export interface PagedResult<T> {
  total: number;
  data: T[];
}

// ================== OVERVIEW ==================

export interface ThongKeOverview {
  gioHocTrungBinh: number;
  soKhoaHocDangDay: number;
  tongBaiTap: number;
  tyLeHoanThanhTB: number;
}

// ================== TRẠNG THÁI HỌC VIÊN ==================

export interface TrangThaiHocVien {
  trangThai: string; // "Hoàn thành", "Đang học", "Chưa bắt đầu", "Nguy cơ bỏ học"
  soLuong: number;
}

// ================== TIẾN ĐỘ THEO THỜI GIAN ==================

export interface TienDoTheoThoiGian {
  tuan: number;
  tyLeHoanThanh: number;
}

// ================== HỌC VIÊN ==================

export interface HocVien {
  maNguoiDung: number;
  hoTen: string;
  email: string;
  anhDaiDien?: string;
  tienDo: number;
  soBaiDaNop: number;
  gioHoc: number;
  trangThai: string; // "Hoàn thành" | "Đang học" | "Chưa học"
}

// ================== API PARAMS ==================

export interface HocVienParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// ================== OLD TYPES (GIỮ LẠI ĐỂ TƯƠNG THÍCH) ==================

export interface Student {
  id: number;
  name: string;
  email: string;
  completion: number;
  assignments: number;
  avgScore: number;
  status: 'completed' | 'in-progress' | 'at-risk';
}

// ================== CHART DATA ==================

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ProgressDataPoint {
  week: string;
  value: number;
}