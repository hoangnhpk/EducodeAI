export type LessonType = 'Video' | 'Text' | 'Ide' | 'Quiz';

export interface QuizInfo {
  maBaiTapQuiz: number;
  maBaiTap: number;
  thoiGianLamBai?: number | null;
  diemCanDat: number;
  choPhepLamLai: boolean;
  daoCauHoi: boolean;
  duLieuCauHoiJSON: string;
}

export interface Lesson {
  id: number;
  tieuDe: string;
  loaiBaiHoc: LessonType;
  noiDung?: string;
  thoiLuong: number;
  thuTu: number;
  linkVideo?: string | null;
  videoSource?: string | null;
  videoPublicId?: string | null;
  videoStatus?: string | null;
  daXem?: boolean;
  laHocThu?: boolean;
  biKhoa?: boolean;
  thongTinQuiz?: QuizInfo | null;
  thongTinThucHanh?: { tieuDe: string; noiDungHTML: string } | null;
}

export interface Chapter {
  id: number;
  tieuDe: string;
  thuTu: number;
  danhSachBaiHoc: Lesson[];
}

export interface CourseContent {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  slug: string;
  danhSachChuongHoc: Chapter[];
  daDangKy?: boolean;
  laCheDoHocThu?: boolean;
}

export interface Note {
  id: number;
  thoiGianVideo: number;
  noiDung: string;
  ngayTao: string;
}

export interface SaveNotePayload {
  MaGhiChu?: number;
  MaBaiHoc: number;
  MaNguoiDung: number;
  ThoiGianVideo: number;
  NoiDung: string;
}

export interface SaveProgressPayload {
  MaBaiHoc: number;
  MaNguoiDung: number;
  DaXem: boolean;
  ThoiGianHoc: number;
}

export interface QuizAnswer {
  IdCauHoi: number;
  IndexLuaChon: number;
}

export interface SaveQuizResultPayload {
  MaBaiHoc: number;
  MaBaiTap: number;
  MaNguoiDung: number;
  DiemSo: number;
  SoCauDung: number;
  TongSoCau: number;
  DaDat: boolean;
  ChiTietLamBai: QuizAnswer[];
}

export interface ReviewSummary {
  trungBinhSao?: number;
  tongSoDanhGia?: number;
  danhSachDanhGia?: { soSao: number; nhanXet: string; hoTen?: string }[];
}

export interface ReviewPayload {
  MaKhoaHoc: number;
  MaNguoiDung: number;
  SoSao: number;
  NhanXet: string;
}
