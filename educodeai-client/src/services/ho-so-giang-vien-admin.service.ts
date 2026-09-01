import axiosClient from "@/configs/axios";

export interface HoSoGiangVienListItem {
  maHoSoDangKyGiangVien: number;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  linhVucGiangDay: string;
  loaiGiayTo: string;
  soGiayTo: string;
  anhDaiDienUrl?: string;
  trangThaiHoSo: string;
  lyDoTuChoi?: string;
  ngayTao: string;
  ngayDuyet?: string;
  maNguoiDung?: number;
}

export interface HoSoGiangVienTaiLieu {
  maTaiLieu: number;
  loaiTaiLieu: "CV" | "ChungChi" | string;
  tenFile: string;
  contentType: string;
  kichThuoc: number;
  trangThai: string;
  lyDoTuChoi?: string;
  ngayTaiLen: string;
  ngayDuyet?: string;
  tenChungChi?: string;
  donViCap?: string;
  ngayCapChungChi?: string;
  ngayHetHanChungChi?: string;
  maChungChi?: string;
  urlXacMinh?: string;
  downloadUrl: string;
}

export interface HoSoGiangVienDetail extends HoSoGiangVienListItem {
  taiKhoan: string;
  tieuSu: string;
  linkedInUrl?: string;
  websiteUrl?: string;
  thongTinCccdQuet?: Record<string, string>;
  phuongThucThanhToan: string;
  tenNganHang?: string;
  soTaiKhoanNhanTien?: string;
  tenChuTaiKhoan?: string;
  maSoThue?: string;
  loaiDoiTuongThue?: string;
  maQuanTriVienDuyet?: number;
  ngayCapNhat: string;
  taiLieus: HoSoGiangVienTaiLieu[];
}

export interface DuyetHoSoResponse {
  success: boolean;
  message: string;
  maNguoiDung: number;
  taiKhoan: string;
}

export interface ChungChiAdminFilter {
  tuKhoa?: string;
  trangThai?: string;
  donViCap?: string;
  tuNgay?: string;
  denNgay?: string;
  trang: number;
  kichThuocTrang: number;
}

export type TrangThaiChungChi = "ChoDuyet" | "CanBoSung" | "DaDuyet" | "TuChoi";

export interface ChungChiAdminChild {
  maTaiLieu: number;
  tenChungChi: string;
  donViCap?: string;
  ngayCap?: string;
  ngayHetHan?: string;
  maChungChi?: string;
  urlXacMinh?: string;
  tenFile: string;
  contentType: string;
  kichThuoc: number;
  trangThai: TrangThaiChungChi;
  lyDoXuLy?: string;
  phienBan: number;
  ngayCapNhat: string;
  ngayDuyet?: string;
  hienThiCongKhai: boolean;
}

export interface QuyetDinhChungChi {
  maTaiLieu: number;
  trangThai: Exclude<TrangThaiChungChi, "ChoDuyet">;
  lyDo?: string;
  phienBan: number;
}

export interface ChungChiAdminItem {
  maDotGui: string;
  maNguoiDung: number;
  hoTen: string;
  email: string;
  anhDaiDienUrl?: string;
  trangThai: string;
  lyDoXuLy?: string;
  ngayTaiLen: string;
  ngayCapNhat: string;
  ngayDuyet?: string;
  soLuongChungChi: number;
  chungChis: ChungChiAdminChild[];
}

export interface ChungChiAdminPaged {
  duLieu: ChungChiAdminItem[];
  tongSo: number;
  trang: number;
  kichThuocTrang: number;
  tongSoTrang: number;
}

export const HoSoGiangVienAdminService = {
  layDanhSach: async (trangThai?: string): Promise<HoSoGiangVienListItem[]> => {
    const params: Record<string, string> = {};
    if (trangThai) params.trangThai = trangThai;
    return await axiosClient.get<HoSoGiangVienListItem[]>(
      "/api/QuanTriVien/quan-ly-ho-so-giang-vien/ds-ho-so",
      { params }
    );
  },

  layChiTiet: async (maHoSo: number): Promise<HoSoGiangVienDetail> => {
    return await axiosClient.get<HoSoGiangVienDetail>(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/chi-tiet/${maHoSo}`
    );
  },

  taiTaiLieu: async (maHoSo: number, maTaiLieu: number): Promise<Blob> => {
    return await axiosClient.get(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/${maHoSo}/tai-lieu/${maTaiLieu}`,
      { responseType: "blob" }
    );
  },

  demChoDuyet: async (): Promise<number> => {
    const res = await axiosClient.get<{ soLuong: number }>(
      "/api/QuanTriVien/quan-ly-ho-so-giang-vien/dem-cho-duyet"
    );
    return res.soLuong;
  },

  duyetHoSo: async (maHoSo: number): Promise<DuyetHoSoResponse> => {
    return await axiosClient.put<DuyetHoSoResponse>(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/duyet/${maHoSo}`
    );
  },

  tuChoiHoSo: async (maHoSo: number, lyDoTuChoi: string) => {
    return await axiosClient.put(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/tu-choi/${maHoSo}`,
      { lyDoTuChoi }
    );
  },

  yeuCauBoSung: async (maHoSo: number, noiDungBoSung: string) => {
    return await axiosClient.put(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/yeu-cau-bo-sung/${maHoSo}`,
      { noiDungBoSung }
    );
  },

  layDanhSachChungChi: async (filter: ChungChiAdminFilter): Promise<ChungChiAdminPaged> => {
    const params = Object.fromEntries(
      Object.entries(filter).filter(([, value]) => value !== "" && value !== undefined)
    );
    return await axiosClient.get<ChungChiAdminPaged>(
      "/api/QuanTriVien/quan-ly-ho-so-giang-vien/chung-chi",
      { params }
    );
  },

  taiChungChi: async (maTaiLieu: number): Promise<Blob> =>
    await axiosClient.get(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/chung-chi/${maTaiLieu}/tai-lieu`,
      { responseType: "blob" }
    ),

  quyetDinhChungChi: async (maDotGui: string, quyetDinhs: QuyetDinhChungChi[]) =>
    await axiosClient.put(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/chung-chi/dot-gui/${maDotGui}/quyet-dinh`,
      { quyetDinhs }
    ),

  duyetChungChi: async (maDotGui: string) =>
    await axiosClient.put(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/chung-chi/dot-gui/${maDotGui}/duyet`
    ),

  tuChoiChungChi: async (maDotGui: string, lyDo: string) =>
    await axiosClient.put(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/chung-chi/dot-gui/${maDotGui}/tu-choi`,
      { lyDo }
    ),

  yeuCauBoSungChungChi: async (maDotGui: string, lyDo: string) =>
    await axiosClient.put(
      `/api/QuanTriVien/quan-ly-ho-so-giang-vien/chung-chi/dot-gui/${maDotGui}/yeu-cau-bo-sung`,
      { lyDo }
    )
};
