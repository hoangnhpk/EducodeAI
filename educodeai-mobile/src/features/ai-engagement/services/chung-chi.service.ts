import api from '../../../shared/configs/api';

export interface ChiTietCauTraLoiChungChi {
  IdCauHoi: number;
  IndexLuaChon: number;
}

export interface BaiKiemTraChungChi {
  maBaiKiemTra: number;
  tieuDe: string;
  moTa: string;
  soCauHoi: number;
  thoiGianLamBai?: number | null;
  diemCanDat: number;
  choPhepLamLai: boolean;
  daoCauHoi: boolean;
  duDieuKienDuThi: boolean;
  lyDoChuaDuDieuKien?: string | null;
  daCoDeThi: boolean;
  nguonDe?: string | null;
  duLieuCauHoiJSON: string;
}

export interface ThongTinChungChi {
  daCap: boolean;
  maChungChi?: string | null;
  ngayCap?: string | null;
  soLanThi: number;
  diemLanGanNhat?: number | null;
  datLanGanNhat?: boolean | null;
  soCauDungLanGanNhat?: number | null;
  tongSoCauHoi: number;
  tenHocVien?: string | null;
  tenKhoaHoc?: string | null;
  tenChungChi?: string | null;
  hoTenHienThi?: string | null;
  emailNhan?: string | null;
  daGuiEmail: boolean;
  ngayGuiEmail?: string | null;
}

export interface DuLieuChungChiKhoaHoc {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  coChungChi: boolean;
  tenChungChi?: string | null;
  baiKiemTraChungChi?: BaiKiemTraChungChi | null;
  thongTinChungChi?: ThongTinChungChi | null;
}

export interface NopBaiKiemTraChungChiRequest {
  MaKhoaHoc: number;
  MaNguoiDung: number;
  HoTenHienThi: string;
  EmailNhan: string;
  ChiTietLamBai: ChiTietCauTraLoiChungChi[];
}

export interface KetQuaNopBaiKiemTraChungChi {
  thanhCong: boolean;
  daDat: boolean;
  diemSo: number;
  soCauDung: number;
  tongSoCau: number;
  thongBao: string;
  thongTinChungChi?: ThongTinChungChi | null;
}

export const ChungChiService = {
  async layTheoKhoaHoc(maKhoaHoc: number) {
    const response = await api.get<DuLieuChungChiKhoaHoc>(`/NoiDungKhoaHoc/${maKhoaHoc}`);
    return response.data;
  },

  async nopBai(request: NopBaiKiemTraChungChiRequest) {
    const response = await api.post<KetQuaNopBaiKiemTraChungChi>(
      '/NoiDungKhoaHoc/chung-chi/nop-bai',
      request,
    );
    return response.data;
  },
};
