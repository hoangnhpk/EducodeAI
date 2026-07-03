import axiosClient from '@/configs/axios';
import type {
  ThuThachTuanResponse,
  NhiemVuThuThach,
  TrangThaiNhiemVu,
  DanhHieu,
  NhanThuongResponse,
  BangXepHangResponse,
  BangXepHangItem,
} from '@/pages/hoc-vien/thu-thach/types';

interface ApiNhiemVu {
  maMau?: number;
  MaMau?: number;
  maNhiemVu?: string;
  MaNhiemVu?: string;
  tieuDe?: string;
  TieuDe?: string;
  moTa?: string;
  MoTa?: string;
  icon?: string;
  Icon?: string;
  giaTriHienTai?: number;
  GiaTriHienTai?: number;
  chiTieu?: number;
  ChiTieu?: number;
  expThuong?: number;
  ExpThuong?: number;
  trangThai?: string;
  TrangThai?: string;
  phanTramTienDo?: number;
  PhanTramTienDo?: number;
}

interface ApiDanhHieu {
  maDanhHieu?: number;
  MaDanhHieu?: number;
  maCode?: string;
  MaCode?: string;
  tenDanhHieu?: string;
  TenDanhHieu?: string;
  moTa?: string | null;
  MoTa?: string | null;
  expYeuCau?: number;
  ExpYeuCau?: number;
  daMoKhoa?: boolean;
  DaMoKhoa?: boolean;
  dangDeo?: boolean;
  DangDeo?: boolean;
}

interface ApiThuThachTuan {
  tongExp?: number;
  TongExp?: number;
  huyHieuHienTai?: string;
  HuyHieuHienTai?: string;
  maDanhHieuDangDeo?: number | null;
  MaDanhHieuDangDeo?: number | null;
  ngayDauTuan?: string;
  NgayDauTuan?: string;
  ngayKetThucTuan?: string;
  NgayKetThucTuan?: string;
  giayConLaiDenLamMoi?: number;
  GiayConLaiDenLamMoi?: number;
  danhSachNhiemVu?: ApiNhiemVu[];
  DanhSachNhiemVu?: ApiNhiemVu[];
  danhSachDanhHieu?: ApiDanhHieu[];
  DanhSachDanhHieu?: ApiDanhHieu[];
}

function mapTrangThai(raw?: string): TrangThaiNhiemVu {
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
    moTa: item.moTa ?? item.MoTa,
    expYeuCau: item.expYeuCau ?? item.ExpYeuCau ?? 0,
    daMoKhoa: item.daMoKhoa ?? item.DaMoKhoa ?? false,
    dangDeo: item.dangDeo ?? item.DangDeo ?? false,
  };
}

function mapThuThachTuan(raw: ApiThuThachTuan): ThuThachTuanResponse {
  const list = raw.danhSachNhiemVu ?? raw.DanhSachNhiemVu ?? [];
  const dh = raw.danhSachDanhHieu ?? raw.DanhSachDanhHieu ?? [];
  return {
    tongExp: raw.tongExp ?? raw.TongExp ?? 0,
    huyHieuHienTai: raw.huyHieuHienTai ?? raw.HuyHieuHienTai ?? 'Tân binh học tập',
    maDanhHieuDangDeo: raw.maDanhHieuDangDeo ?? raw.MaDanhHieuDangDeo ?? null,
    ngayDauTuan: raw.ngayDauTuan ?? raw.NgayDauTuan ?? '',
    ngayKetThucTuan: raw.ngayKetThucTuan ?? raw.NgayKetThucTuan ?? '',
    giayConLaiDenLamMoi: raw.giayConLaiDenLamMoi ?? raw.GiayConLaiDenLamMoi ?? 0,
    danhSachNhiemVu: list.map(mapNhiemVu),
    danhSachDanhHieu: dh.map(mapDanhHieu),
  };
}

export async function layThuThachTuan(): Promise<ThuThachTuanResponse> {
  const body = await axiosClient.get<{ success: boolean; data: ApiThuThachTuan }>(
    '/api/hoc-vien/thu-thach/tuan'
  );
  return mapThuThachTuan(body.data ?? {});
}

export async function nhanThuongNhiemVu(maMau: number): Promise<NhanThuongResponse> {
  const body = await axiosClient.post<{
    success: boolean;
    data: {
      expNhanDuoc?: number;
      ExpNhanDuoc?: number;
      tongExp?: number;
      TongExp?: number;
      danhHieuMoiMoKhoa?: string | null;
      DanhHieuMoiMoKhoa?: string | null;
      bangNhiemVu?: ApiThuThachTuan;
      BangNhiemVu?: ApiThuThachTuan;
      bangXepHang?: ApiBangXepHang;
      BangXepHang?: ApiBangXepHang;
    };
  }>(`/api/hoc-vien/thu-thach/nhan-thuong/${maMau}`);

  const d = body.data ?? {};
  const bxhRaw = d.bangXepHang ?? d.BangXepHang;
  return {
    expNhanDuoc: d.expNhanDuoc ?? d.ExpNhanDuoc ?? 0,
    tongExp: d.tongExp ?? d.TongExp ?? 0,
    danhHieuMoiMoKhoa: d.danhHieuMoiMoKhoa ?? d.DanhHieuMoiMoKhoa ?? null,
    bangNhiemVu: mapThuThachTuan(d.bangNhiemVu ?? d.BangNhiemVu ?? {}),
    bangXepHang: coDuLieuBangXepHang(bxhRaw) ? mapBangXepHang(bxhRaw) : undefined,
  };
}

export async function deoDanhHieu(maDanhHieu: number): Promise<ThuThachTuanResponse> {
  const body = await axiosClient.put<{ success: boolean; data: ApiThuThachTuan }>(
    `/api/hoc-vien/thu-thach/danh-hieu/${maDanhHieu}`
  );
  return mapThuThachTuan(body.data ?? {});
}

export function formatDemNguoc(giay: number): string {
  const safe = Math.max(0, giay);
  const ngay = Math.floor(safe / 86400);
  const gio = Math.floor((safe % 86400) / 3600);
  if (ngay > 0) return `${ngay} ngày ${gio} giờ`;
  const phut = Math.floor((safe % 3600) / 60);
  if (gio > 0) return `${gio} giờ ${phut} phút`;
  return `${phut} phút`;
}

interface ApiBangXepHangItem {
  hang?: number;
  Hang?: number;
  maNguoiDung?: number;
  MaNguoiDung?: number;
  hoTen?: string;
  HoTen?: string;
  anhDaiDien?: string | null;
  AnhDaiDien?: string | null;
  exp?: number;
  Exp?: number;
  tenDanhHieu?: string | null;
  TenDanhHieu?: string | null;
  maCodeDanhHieu?: string | null;
  MaCodeDanhHieu?: string | null;
  gioHocPhut?: number | null;
  GioHocPhut?: number | null;
  laToi?: boolean;
  LaToi?: boolean;
}

interface ApiBangXepHang {
  loai?: string;
  Loai?: string;
  ngayBatDau?: string;
  NgayBatDau?: string;
  ngayKetThuc?: string;
  NgayKetThuc?: string;
  giayConLaiDenLamMoi?: number;
  GiayConLaiDenLamMoi?: number;
  hangCuaToi?: number | null;
  HangCuaToi?: number | null;
  expCuaToi?: number;
  ExpCuaToi?: number;
  danhSach?: ApiBangXepHangItem[];
  DanhSach?: ApiBangXepHangItem[];
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

function mapBangXepHang(raw: ApiBangXepHang): BangXepHangResponse {
  const list = raw.danhSach ?? raw.DanhSach ?? [];
  const loaiRaw = (raw.loai ?? raw.Loai ?? 'tuan').toLowerCase();
  const loai = loaiRaw === 'toan_web' ? 'toan_web' : 'tuan';
  return {
    loai,
    ngayBatDau: raw.ngayBatDau ?? raw.NgayBatDau ?? null,
    ngayKetThuc: raw.ngayKetThuc ?? raw.NgayKetThuc ?? null,
    giayConLaiDenLamMoi: raw.giayConLaiDenLamMoi ?? raw.GiayConLaiDenLamMoi ?? 0,
    hangCuaToi: raw.hangCuaToi ?? raw.HangCuaToi ?? null,
    expCuaToi: raw.expCuaToi ?? raw.ExpCuaToi ?? 0,
    danhSach: list.map(mapBangXepHangItem),
  };
}

function coDuLieuBangXepHang(raw?: ApiBangXepHang | null): raw is ApiBangXepHang {
  if (!raw) return false;
  if (raw.danhSach != null || raw.DanhSach != null) return true;
  if (raw.loai != null || raw.Loai != null) return true;
  if (raw.hangCuaToi != null || raw.HangCuaToi != null) return true;
  return false;
}

export async function layBangXepHang(): Promise<BangXepHangResponse> {
  const body = await axiosClient.get<{ success: boolean; data: ApiBangXepHang }>(
    '/api/hoc-vien/thu-thach/bang-xep-hang',
    { params: { top: 20 } }
  );
  return mapBangXepHang(body.data ?? {});
}

export async function layBangXepHangToanWeb(): Promise<BangXepHangResponse> {
  const body = await axiosClient.get<{ success: boolean; data: ApiBangXepHang }>(
    '/api/hoc-vien/thu-thach/bang-xep-hang/toan-web',
    { params: { top: 50 } }
  );
  return mapBangXepHang(body.data ?? {});
}
