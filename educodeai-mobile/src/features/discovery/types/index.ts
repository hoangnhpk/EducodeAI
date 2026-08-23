/**
 * DTO module Discovery & Commerce — copy đúng field từ contract web:
 * - educodeai-client/src/pages/hoc-vien/trang-chu/TrangChu.tsx (IKhoaHoc)
 * - educodeai-client/src/services/khoa-hoc-da-mua-hoc-vien.service.ts
 * - educodeai-client/src/services/chi-tiet-khoa-hoc.service.ts
 * - educodeai-client/src/services/thanh-toan-khoa-hoc.service.ts
 * Không tự thêm field khi backend chưa trả về.
 */

// ===== Home / danh sách (GET /KhoaHoc/all) =====

export interface CourseListItemDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  slug: string;
  hinhAnh: string;
  linhVuc: string;
  diemDanhGiaTB: number;
  thoiLuongGio: number;
  trinhDo: string;
  kyNangChinh: string;
  khoaHocDaDangKy: boolean;
  giaKhoaHoc: number;
  donViTienTe: string;
}

// Đánh giá trang chủ (GET /hocvien/chitietkhoahoc/danh-gia-trang-chu)
export interface HomeReviewDTO {
  maDanhGia: number;
  soSao: number;
  nhanXet: string;
  nguoiDung?: { hoTen?: string; anhDaiDien?: string };
  khoaHoc?: { tenKhoaHoc?: string; giangVien?: string };
}

// Giảng viên tiêu biểu (GET /hocvien/chitietkhoahoc/giang-vien-tieu-bieu)
export interface HomeInstructorDTO {
  maGiangVien: number;
  hoTen: string;
  anhDaiDien?: string;
  chuyenMon?: string;
  tongKhoaHoc?: number;
  diemTrungBinh?: number;
}

// ===== Khóa học của tôi (GET /hocvien/khoa-hoc-da-mua) =====

export interface MyCourseDTO {
  maDangKy: number;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  hinhAnh?: string | null;
  linhVuc: string;
  thoiLuongGio: number;
  /** 0–100 */
  tienDo: number;
  /** "DangHoc" | "HoanThanh" | null */
  trangThai?: string | null;
  ngayDangKy: string;
  slug: string;
}

// ===== Chi tiết khóa học (GET /hocvien/chitietkhoahoc/{id}) =====

export interface LessonDTO {
  maBaiHoc: number;
  tenBaiHoc: string;
  videoUrl: string;
  thoiLuong: number;
}

export interface ChapterDTO {
  maChuong: number;
  tenChuong: string;
  baiHocs: LessonDTO[];
}

export interface InstructorDTO {
  maGiangVien: number;
  hoTen: string;
  anhDaiDien: string;
}

export interface CourseDetailDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  moTa: string;
  videoGioiThieu: string | null;
  banSeHocDuocGi: string[];
  tongSoHocVien: number;
  giaKhoaHoc: number;
  donViTienTe: string;
  khoaHocDaDangKy: boolean;
  hinhAnh: string;
  linhVuc: string;
  trinhDo: string;
  thoiLuongGio: number;
  diemDanhGiaTB: number;
  tongDanhGia: number;
  coChungChi: boolean;
  tenChungChi: string;
  slug: string;
  giangVien: InstructorDTO | null;
  chuongs: ChapterDTO[];
}

export interface ReviewDTO {
  maDanhGia: number;
  soSao: number;
  nhanXet: string;
  ngayDanhGia: string;
  nguoiDung: { hoTen: string; anhDaiDien: string };
}

export interface ReviewPageDTO {
  items: ReviewDTO[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface RegisterCourseResultDTO {
  message: string;
  maKhoaHoc: number;
}

// ===== Thanh toán (GET/POST /hocvien/thanh-toan-khoa-hoc/...) =====

export interface PurchaseInfoDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  moTa?: string;
  hinhAnh?: string;
  giaKhoaHoc: number;
  donViTienTe: string;
  daMua: boolean;
  choPhepMua: boolean;
  laMienPhi?: boolean;
}

export interface BuyNowResultDTO {
  thanhCong: boolean;
  thongBao: string;
  maDonHang?: number;
  maKhoaHoc: number;
  daMua: boolean;
}

export interface QrPaymentDTO {
  maDonHang: number;
  maKhoaHoc: number;
  soTienCanThanhToan: number;
  donViTienTe: string;
  noiDungChuyenKhoan: string;
  duongDanAnhQr: string;
  hetHanLuc?: string;
}

export interface PaymentStatusDTO {
  maDonHang: number;
  /** Ví dụ: "PAID" */
  trangThaiDonHang: string;
  daMoKhoaHoc: boolean;
  thongBao: string;
}

// ===== Quà tặng =====

export interface GiftQrDTO {
  maQuaTang: number;
  code: string;
  maDonHang: number;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  soTienCanThanhToan: number;
  donViTienTe: string;
  noiDungChuyenKhoan: string;
  duongDanAnhQr: string;
  hetHanThanhToan?: string;
  trangThaiMaQuaTang: string;
}

export interface GiftStatusDTO {
  maDonHang: number;
  trangThaiDonHang: string;
  trangThaiMaQuaTang: string;
  sanSangSuDung: boolean;
  thongBao: string;
}

export interface RedeemGiftResultDTO {
  thanhCong: boolean;
  thongBao: string;
  code: string;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  maNguoiNhan: number;
}

/** Trạng thái: PENDING_PAYMENT | ACTIVE | REDEEMED | EXPIRED */
export interface GiftHistoryItemDTO {
  maQuaTang: number;
  code: string;
  maDonHang: number;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  soTien: number;
  donViTienTe: string;
  noiDungChuyenKhoan: string;
  maNguoiTang: number;
  tenNguoiTang?: string;
  emailNguoiTang?: string;
  trangThai: string;
  createdAt: string;
  activatedAt?: string;
  redeemedAt?: string;
  maNguoiNhan?: number;
  tenNguoiNhan?: string;
  emailNguoiNhan?: string;
}

// ===== Hỗ trợ thanh toán =====

export interface PaymentSupportDTO {
  maGiaoDichHoTro: number;
  loaiHoTro: 'COURSE_PURCHASE' | 'WITHDRAW_REQUEST';
  maDonHang: number;
  noiDungChuyenKhoan: string;
  maNguoiDung: number;
  tenHocVien: string;
  soTienDonHang: number;
  loaiTien: string;
  trangThaiHoTro: string;
  trangThaiDonHang: string;
  thongTinLienLac: string;
  noiDungHocVien?: string;
  createdAt: string;
}

// ===== Ownership state public cho Learning module (Khôi) =====

export type CourseOwnership = 'owned' | 'free' | 'purchasable' | 'unavailable';
