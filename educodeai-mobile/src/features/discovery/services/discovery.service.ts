import api from '../../../shared/configs/api';

export interface DiscoveryCourse {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  slug?: string;
  hinhAnh?: string;
  linhVuc?: string;
  diemDanhGiaTB?: number;
  thoiLuongGio?: number;
  trinhDo?: string;
  kyNangChinh?: string;
  khoaHocDaDangKy?: boolean;
  giaKhoaHoc?: number;
  donViTienTe?: string;
}

export interface CourseDetail extends DiscoveryCourse {
  moTa?: string;
  videoGioiThieu?: string | null;
  banSeHocDuocGi?: string[];
  tongSoHocVien?: number;
  tongDanhGia?: number;
  coChungChi?: boolean;
  tenChungChi?: string;
  giangVien?: { maGiangVien: number; hoTen: string; anhDaiDien?: string | null } | null;
  chuongs: { maChuong: number; tenChuong: string; baiHocs: { maBaiHoc: number; tenBaiHoc: string; videoUrl?: string; thoiLuong?: number }[] }[];
}

export interface CourseReviews { items: { maDanhGia: number; soSao: number; nhanXet: string; ngayDanhGia: string; nguoiDung: { hoTen: string; anhDaiDien?: string | null } }[]; totalCount: number; totalPages: number; currentPage: number }

export const DiscoveryService = {
  async getCourses(search = ''): Promise<DiscoveryCourse[]> {
    const response = await api.get<DiscoveryCourse[]>('/KhoaHoc/all', { params: { search, maGiangVien: null } });
    return response.data ?? [];
  },
  async getCourseDetail(courseId: number): Promise<CourseDetail> {
    const response = await api.get<CourseDetail>(`/hocvien/chitietkhoahoc/${courseId}`);
    return response.data;
  },
  async getReviews(courseId: number): Promise<CourseReviews> {
    const response = await api.get<CourseReviews>(`/hocvien/chitietkhoahoc/${courseId}/danh-gia`, { params: { page: 1, pageSize: 10, filter: 'all' } });
    return response.data;
  },
  async enrollFree(courseId: number) {
    const response = await api.post<{ message: string; maKhoaHoc: number }>('/hocvien/chitietkhoahoc/dang-ky', { maKhoaHoc: courseId });
    return response.data;
  },
};
