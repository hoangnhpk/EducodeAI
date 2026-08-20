import api from '../configs/api';

export interface ThuThachTuanResponse {
  tongExp: number;
  huyHieuHienTai: string;
  maDanhHieuDangDeo: number | null;
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
  isSuccess: boolean;
  expNhanDuoc: number;
  tongExpMoi: number;
  message: string;
}

export interface BangXepHangItem {
  maHocVien: number;
  tenHocVien: string;
  anhDaiDien: string;
  tongExp: number;
  tenDanhHieu: string;
  hang: number;
}

export interface BangXepHangResponse {
  topUsers: BangXepHangItem[];
  currentUser: BangXepHangItem | null;
}

export const ThuThachService = {
  getThuThachTuan: async () => {
    return api.get<ThuThachTuanResponse>('/ThuThach/tuan-hien-tai');
  },
  nhanThuong: async (maMau: number) => {
    return api.post<NhanThuongResponse>('/ThuThach/nhan-thuong-nhiem-vu', { maMau });
  },
  doiDanhHieu: async (maDanhHieu: number) => {
    return api.post('/ThuThach/doi-danh-hieu', { maDanhHieu });
  },
  getBangXepHang: async () => {
    return api.get<BangXepHangResponse>('/ThuThach/bang-xep-hang');
  }
};
