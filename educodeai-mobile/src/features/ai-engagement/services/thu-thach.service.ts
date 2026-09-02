import api from '../../../shared/configs/api';

/**
 * Contract khớp web `educodeai-client/src/services/thu-thach.service.ts`
 * và backend `ThuThachController` route `api/hoc-vien/thu-thach`.
 * baseURL của `api` đã có `/api` → path ở đây KHÔNG thêm prefix `/api`.
 */

export interface ThuThachTuanResponse {
  tongExp: number;
  huyHieuHienTai: string;
  maDanhHieuDangDeo: number | null;
  giayConLaiDenLamMoi: number;
  danhSachNhiemVu: NhiemVuThuThach[];
  danhSachDanhHieu: DanhHieu[];
}

export interface NhiemVuThuThach {
  maMau: number;
  maNhiemVu: string;
  tieuDe: string;
  moTa: string;
  icon: string;
  giaTriHienTai: number;
  chiTieu: number;
  expThuong: number;
  trangThai: 'in_progress' | 'completed' | 'claimed';
  phanTramTienDo: number;
}

export interface DanhHieu {
  maDanhHieu: number;
  maCode: string;
  tenDanhHieu: string;
  moTa: string | null;
  expYeuCau: number;
  daMoKhoa: boolean;
  dangDeo: boolean;
}

export interface NhanThuongResponse {
  expNhanDuoc: number;
  tongExp: number;
  danhHieuMoiMoKhoa?: string | null;
  message?: string;
  bangNhiemVu?: ThuThachTuanResponse;
}

export type LoaiBangXepHang = 'tuan' | 'toan_web';

export interface BangXepHangItem {
  hang: number;
  maNguoiDung: number;
  hoTen: string;
  anhDaiDien: string | null;
  exp: number;
  tenDanhHieu: string | null;
  maCodeDanhHieu: string | null;
  gioHocPhut: number | null;
  laToi: boolean;
}

export interface BangXepHangResponse {
  loai: LoaiBangXepHang;
  ngayBatDau: string | null;
  ngayKetThuc: string | null;
  giayConLaiDenLamMoi: number;
  hangCuaToi: number | null;
  expCuaToi: number;
  danhSach: BangXepHangItem[];
}

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

type ApiNhiemVu = Partial<{
  maMau: number;
  MaMau: number;
  maNhiemVu: string;
  MaNhiemVu: string;
  tieuDe: string;
  TieuDe: string;
  moTa: string;
  MoTa: string;
  icon: string;
  Icon: string;
  giaTriHienTai: number;
  GiaTriHienTai: number;
  chiTieu: number;
  ChiTieu: number;
  expThuong: number;
  ExpThuong: number;
  trangThai: string;
  TrangThai: string;
  phanTramTienDo: number;
  PhanTramTienDo: number;
}>;

type ApiDanhHieu = Partial<{
  maDanhHieu: number;
  MaDanhHieu: number;
  maCode: string;
  MaCode: string;
  tenDanhHieu: string;
  TenDanhHieu: string;
  moTa: string | null;
  MoTa: string | null;
  expYeuCau: number;
  ExpYeuCau: number;
  daMoKhoa: boolean;
  DaMoKhoa: boolean;
  dangDeo: boolean;
  DangDeo: boolean;
}>;

type ApiThuThachTuan = Partial<{
  tongExp: number;
  TongExp: number;
  huyHieuHienTai: string;
  HuyHieuHienTai: string;
  maDanhHieuDangDeo: number | null;
  MaDanhHieuDangDeo: number | null;
  giayConLaiDenLamMoi: number;
  GiayConLaiDenLamMoi: number;
  danhSachNhiemVu: ApiNhiemVu[];
  DanhSachNhiemVu: ApiNhiemVu[];
  danhSachDanhHieu: ApiDanhHieu[];
  DanhSachDanhHieu: ApiDanhHieu[];
}>;

type ApiBangXepHangItem = Partial<{
  hang: number;
  Hang: number;
  maNguoiDung: number;
  MaNguoiDung: number;
  hoTen: string;
  HoTen: string;
  anhDaiDien: string | null;
  AnhDaiDien: string | null;
  exp: number;
  Exp: number;
  tenDanhHieu: string | null;
  TenDanhHieu: string | null;
  maCodeDanhHieu: string | null;
  MaCodeDanhHieu: string | null;
  gioHocPhut: number | null;
  GioHocPhut: number | null;
  laToi: boolean;
  LaToi: boolean;
}>;

type ApiBangXepHang = Partial<{
  loai: string;
  Loai: string;
  ngayBatDau: string | null;
  NgayBatDau: string | null;
  ngayKetThuc: string | null;
  NgayKetThuc: string | null;
  giayConLaiDenLamMoi: number;
  GiayConLaiDenLamMoi: number;
  hangCuaToi: number | null;
  HangCuaToi: number | null;
  expCuaToi: number;
  ExpCuaToi: number;
  danhSach: ApiBangXepHangItem[];
  DanhSach: ApiBangXepHangItem[];
}>;

function mapTrangThai(raw?: string): NhiemVuThuThach['trangThai'] {
  const v = (raw ?? '').toLowerCase();
  if (v === 'completed') return 'completed';
  if (v === 'claimed') return 'claimed';
  return 'in_progress';
}

function mapNhiemVu(item: ApiNhiemVu): NhiemVuThuThach {
  return {
    maMau: item.maMau ?? item.MaMau ?? 0,
    maNhiemVu: item.maNhiemVu ?? item.MaNhiemVu ?? '',
    tieuDe: item.tieuDe ?? item.TieuDe ?? '',
    moTa: item.moTa ?? item.MoTa ?? '',
    icon: item.icon ?? item.Icon ?? 'book',
    giaTriHienTai: item.giaTriHienTai ?? item.GiaTriHienTai ?? 0,
    chiTieu: item.chiTieu ?? item.ChiTieu ?? 1,
    expThuong: item.expThuong ?? item.ExpThuong ?? 0,
    trangThai: mapTrangThai(item.trangThai ?? item.TrangThai),
    phanTramTienDo: item.phanTramTienDo ?? item.PhanTramTienDo ?? 0,
  };
}

function mapDanhHieu(item: ApiDanhHieu): DanhHieu {
  return {
    maDanhHieu: item.maDanhHieu ?? item.MaDanhHieu ?? 0,
    maCode: item.maCode ?? item.MaCode ?? '',
    tenDanhHieu: item.tenDanhHieu ?? item.TenDanhHieu ?? '',
    moTa: item.moTa ?? item.MoTa ?? null,
    expYeuCau: item.expYeuCau ?? item.ExpYeuCau ?? 0,
    daMoKhoa: item.daMoKhoa ?? item.DaMoKhoa ?? false,
    dangDeo: item.dangDeo ?? item.DangDeo ?? false,
  };
}

function mapThuThachTuan(raw: ApiThuThachTuan = {}): ThuThachTuanResponse {
  const list = raw.danhSachNhiemVu ?? raw.DanhSachNhiemVu ?? [];
  const dh = raw.danhSachDanhHieu ?? raw.DanhSachDanhHieu ?? [];
  return {
    tongExp: raw.tongExp ?? raw.TongExp ?? 0,
    huyHieuHienTai: raw.huyHieuHienTai ?? raw.HuyHieuHienTai ?? 'Tân binh học tập',
    maDanhHieuDangDeo: raw.maDanhHieuDangDeo ?? raw.MaDanhHieuDangDeo ?? null,
    giayConLaiDenLamMoi: raw.giayConLaiDenLamMoi ?? raw.GiayConLaiDenLamMoi ?? 0,
    danhSachNhiemVu: list.map(mapNhiemVu),
    danhSachDanhHieu: dh.map(mapDanhHieu),
  };
}

function mapBangXepHangItem(item: ApiBangXepHangItem): BangXepHangItem {
  return {
    hang: item.hang ?? item.Hang ?? 0,
    maNguoiDung: item.maNguoiDung ?? item.MaNguoiDung ?? 0,
    hoTen: item.hoTen ?? item.HoTen ?? 'Học viên',
    anhDaiDien: item.anhDaiDien ?? item.AnhDaiDien ?? null,
    exp: item.exp ?? item.Exp ?? 0,
    tenDanhHieu: item.tenDanhHieu ?? item.TenDanhHieu ?? null,
    maCodeDanhHieu: item.maCodeDanhHieu ?? item.MaCodeDanhHieu ?? null,
    gioHocPhut: item.gioHocPhut ?? item.GioHocPhut ?? null,
    laToi: item.laToi ?? item.LaToi ?? false,
  };
}

function mapBangXepHang(raw: ApiBangXepHang = {}, fallback: LoaiBangXepHang = 'tuan'): BangXepHangResponse {
  const list = raw.danhSach ?? raw.DanhSach ?? [];
  const loaiRaw = (raw.loai ?? raw.Loai ?? fallback).toLowerCase();
  return {
    loai: loaiRaw === 'toan_web' ? 'toan_web' : 'tuan',
    ngayBatDau: raw.ngayBatDau ?? raw.NgayBatDau ?? null,
    ngayKetThuc: raw.ngayKetThuc ?? raw.NgayKetThuc ?? null,
    giayConLaiDenLamMoi: raw.giayConLaiDenLamMoi ?? raw.GiayConLaiDenLamMoi ?? 0,
    hangCuaToi: raw.hangCuaToi ?? raw.HangCuaToi ?? null,
    expCuaToi: raw.expCuaToi ?? raw.ExpCuaToi ?? 0,
    danhSach: list.map(mapBangXepHangItem),
  };
}

export const ThuThachService = {
  getThuThachTuan: async (): Promise<ThuThachTuanResponse> => {
    const res = await api.get<ApiEnvelope<ApiThuThachTuan>>('hoc-vien/thu-thach/tuan');
    return mapThuThachTuan(res.data?.data ?? {});
  },

  nhanThuong: async (maMau: number): Promise<NhanThuongResponse> => {
    const res = await api.post<
      ApiEnvelope<{
        expNhanDuoc?: number;
        ExpNhanDuoc?: number;
        tongExp?: number;
        TongExp?: number;
        danhHieuMoiMoKhoa?: string | null;
        DanhHieuMoiMoKhoa?: string | null;
        bangNhiemVu?: ApiThuThachTuan;
        BangNhiemVu?: ApiThuThachTuan;
      }>
    >(`hoc-vien/thu-thach/nhan-thuong/${maMau}`);
    const d = res.data?.data ?? {};
    return {
      expNhanDuoc: d.expNhanDuoc ?? d.ExpNhanDuoc ?? 0,
      tongExp: d.tongExp ?? d.TongExp ?? 0,
      danhHieuMoiMoKhoa: d.danhHieuMoiMoKhoa ?? d.DanhHieuMoiMoKhoa ?? null,
      message: res.data?.message,
      bangNhiemVu: mapThuThachTuan(d.bangNhiemVu ?? d.BangNhiemVu ?? {}),
    };
  },

  doiDanhHieu: async (maDanhHieu: number): Promise<ThuThachTuanResponse> => {
    const res = await api.put<ApiEnvelope<ApiThuThachTuan>>(`hoc-vien/thu-thach/danh-hieu/${maDanhHieu}`);
    return mapThuThachTuan(res.data?.data ?? {});
  },

  getBangXepHang: async (): Promise<BangXepHangResponse> => {
    const res = await api.get<ApiEnvelope<ApiBangXepHang>>('hoc-vien/thu-thach/bang-xep-hang', {
      params: { top: 20 },
    });
    return mapBangXepHang(res.data?.data ?? {}, 'tuan');
  },

  getBangXepHangToanWeb: async (): Promise<BangXepHangResponse> => {
    const res = await api.get<ApiEnvelope<ApiBangXepHang>>('hoc-vien/thu-thach/bang-xep-hang/toan-web', {
      params: { top: 50 },
    });
    return mapBangXepHang(res.data?.data ?? {}, 'toan_web');
  },
};
