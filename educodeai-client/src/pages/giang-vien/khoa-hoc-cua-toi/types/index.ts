// ============================================================
// Types: Module Khóa Học Của Tôi (Giảng Viên)
// ============================================================

// ---------- Course ----------

export interface KhoaHocListItem {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  hinhAnh?: string;
  linhVuc: string;
  trinhDo: string;
  thoiLuongGio: number;
  soHocVien: number;
  tienDoTrungBinh: number;
  diemDanhGiaTB: number;
  trangThai?: string;
  giaKhoaHoc: number;
  donViTienTe: string;
  choPhepMua: boolean;
  coChungChi: boolean;
  daCoDeThiChungChi: boolean;
  ngayTao: string;
  soChuong?: number;
  soBaiHoc?: number;
}

export interface KhoaHocDetail {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  moTa?: string;
  hinhAnh?: string;
  linhVuc: string;
  trinhDo: string;
  thoiLuongGio: number;
  trangThai?: string;
  giaKhoaHoc: number;
  donViTienTe: string;
  choPhepMua: boolean;
  ngayTao: string;
  coChungChi: boolean;
  tenChungChi?: string;
  diemDatChungChi: number;
  soCauHoiChungChi: number;
  thoiGianLamBaiChungChi: number;
  daCoDeThiChungChi: boolean;
  nguonDeChungChi?: string;
  ngayTaoDeChungChi?: string;
  soHocVien: number;
  tiLeHoanThanh: number;
  diemDanhGiaTB: number;
  danhSachHocVien: HocVienTrongKhoaHoc[];
  kyNangChinh?: string;
  danhSachChuong: ChuongHocDetail[];
}

export interface KhoaHocCreateUpdate {
  tenKhoaHoc: string;
  moTa?: string;
  hinhAnh?: string;
  linhVuc: string;
  trinhDo: string;
  thoiLuongGio: number;
  trangThai?: string;
  giaKhoaHoc: number;
  donViTienTe: string;
  choPhepMua: boolean;
  kyNangChinh?: string;
  coChungChi: boolean;
  tenChungChi?: string;
  diemDatChungChi: number;
  soCauHoiChungChi: number;
  thoiGianLamBaiChungChi: number;
}

// ---------- Student ----------

export interface HocVienTrongKhoaHoc {
  maNguoiDung: number;
  hoTen: string;
  email: string;
  anhDaiDien?: string;
  ngayDangKy: string;
  tienDo: number;
  diemTrungBinh?: number;
}

// ---------- Chapter ----------

export interface ChuongHoc {
  maChuong: number;
  tenChuong: string;
  thuTu: number;
}

export interface ChuongHocDetail {
  maChuong: number;
  tenChuong: string;
  thuTu: number;
  danhSachBaiHoc: BaiHocDetail[];
}

export interface ChuongHocCreateUpdate {
  tenChuong: string;
  thuTu: number;
}

export interface ChuongHocResponse {
  maChuong: number;
  tenChuong: string;
  thuTu: number;
}

export interface ReorderChuongItem {
  maChuong: number;
  thuTu: number;
}

export interface ReorderChuongPayload {
  chapterOrders: ReorderChuongItem[];
}

// ---------- Lesson ----------

export interface BaiHocDetail {
  maBaiHoc: number;
  tieuDe: string;
  moTa?: string;
  linkVideo?: string;
  thoiLuong: number;
  thuTu: number;
  loaiBaiHoc?: string;
}

export interface BaiHocCreateUpdate {
  tieuDe: string;
  moTa?: string;
  linkVideo?: string;
  thoiLuong: number;
  thuTu: number;
}

export interface BaiHocFileCreateUpdate {
  tieuDe: string;
  moTa?: string;
  file?: File | null;
  thuTu: number;
}

export interface BaiHocResponse {
  maBaiHoc: number;
  tieuDe: string;
  moTa?: string;
  linkVideo?: string;
  thoiLuong: number;
  thuTu: number;
  loaiBaiHoc?: string;
}

export interface ReorderBaiHocItem {
  maBaiHoc: number;
  thuTu: number;
}

export interface ReorderBaiHocPayload {
  lessonOrders: ReorderBaiHocItem[];
}

// ---------- Certificate ----------

export interface CertificateConfig {
  coChungChi: boolean;
  tenChungChi?: string;
  diemDatChungChi: number;
  soCauHoiChungChi: number;
  thoiGianLamBaiChungChi: number;
}

export interface KetQuaTaoDeChungChiAI {
  thanhCong: boolean;
  thongBao: string;
  soCauHoi: number;
  nguonDeChungChi?: string | null;
  ngayTaoDeChungChi?: string | null;
}

export interface CauHoiChungChi {
  id: number;
  cauHoi: string;
  dapAnA: string;
  dapAnB: string;
  dapAnC: string;
  dapAnD: string;
  dapAnDung: string;
  giaiThich: string;
}

// ---------- YouTube ----------

export interface PlaylistAnalyzeRequest {
  playlistUrl: string;
}

export interface PlaylistAnalyzeResult {
  playlistId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoCount: number;
  channelTitle?: string;
}

export interface YouTubeVideoItem {
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration: number; // seconds
  durationFormatted?: string;
}

export interface PlaylistImportRequest {
  maKhoaHoc: number;
  playlistId: string;
  videos: YouTubeVideoItem[];
  targetChapterId?: number | null;
  newChapterName?: string;
}

export interface PlaylistImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  importedLessons?: any[];
}

// ---------- UI Helpers ----------

export type TrangThaiKhoaHoc = 'Tất cả' | 'Draft' | 'Published' | 'Archived';

export type ViewState =
  | { view: 'list' }
  | { view: 'create' }
  | { view: 'edit'; maKhoaHoc: number }
  | { view: 'import'; maKhoaHoc: number }
  | { view: 'manage'; maKhoaHoc: number };
