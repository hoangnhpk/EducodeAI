export type TrangThaiNhiemVu = 'in_progress' | 'completed' | 'claimed';

export interface NhiemVuThuThach {
  maMau: number;
  maNhiemVu: string;
  tieuDe: string;
  moTa: string;
  icon: string;
  giaTriHienTai: number;
  chiTieu: number;
  expThuong: number;
  trangThai: TrangThaiNhiemVu;
  phanTramTienDo: number;
}

export interface DanhHieu {
  maDanhHieu: number;
  maCode: string;
  tenDanhHieu: string;
  moTa?: string | null;
  expYeuCau: number;
  daMoKhoa: boolean;
  dangDeo: boolean;
}

export interface ThuThachTuanResponse {
  tongExp: number;
  huyHieuHienTai: string;
  maDanhHieuDangDeo?: number | null;
  ngayDauTuan: string;
  ngayKetThucTuan: string;
  giayConLaiDenLamMoi: number;
  danhSachNhiemVu: NhiemVuThuThach[];
  danhSachDanhHieu: DanhHieu[];
}

export interface NhanThuongResponse {
  expNhanDuoc: number;
  tongExp: number;
  danhHieuMoiMoKhoa?: string | null;
  bangNhiemVu: ThuThachTuanResponse;
  bangXepHang?: BangXepHangResponse;
}

export interface BangXepHangItem {
  hang: number;
  maNguoiDung: number;
  hoTen: string;
  anhDaiDien?: string | null;
  exp: number;
  tenDanhHieu?: string | null;
  maCodeDanhHieu?: string | null;
  gioHocPhut?: number | null;
  laToi: boolean;
}

export type LoaiBangXepHang = 'tuan' | 'toan_web';

export interface BangXepHangResponse {
  loai: LoaiBangXepHang;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
  giayConLaiDenLamMoi?: number;
  hangCuaToi?: number | null;
  expCuaToi: number;
  danhSach: BangXepHangItem[];
}
