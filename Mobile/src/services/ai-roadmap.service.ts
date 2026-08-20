import api from '../configs/api';

export interface DuLieuYeuCauLoTrinh {
  trinhDo: string;
  phongCachHoc: string;
  mucTieuNgheNghiep: string;
  thoiGianHoc?: string;
  mucDoCamKet?: string;
  kienThucHienCo: string;
  kinhNghiem: string;
  khoKhan: string;
}

export interface KetQuaLoTrinhAI {
  tenLoTrinh: string;
  mucTieu: string;
  tongThoiGian: string;
  loTrinh: ChiTietGiaiDoan[];
  maLoTrinh?: number;
}

export interface ChiTietGiaiDoan {
  giaiDoan: number;
  tenGiaiDoan: string;
  thoiGian: string;
  mucTieu: string;
  noiDung: NoiDungHoc[];
}

export interface NoiDungHoc {
  chuDe: string;
  moTa: string;
  kyNangDatDuoc: string[];
}

export interface LoTrinhAICuaToiDTO {
  maLoTrinh: number;
  mucTieuNgheNghiep: string;
  trangThai: string;
  ngayTao: string;
  noiDungJSON: string;
  baiHocs?: any[];
}

export const aiRoadmapService = {
  taoLoTrinh: async (data: DuLieuYeuCauLoTrinh) => {
    const thoiGianHocDuKien = data.thoiGianHoc ? Number(data.thoiGianHoc) : undefined;
    const thoiGianMoiTuan = data.mucDoCamKet ? Number(data.mucDoCamKet) : undefined;

    const payload = {
      trinhDoHienTai: data.trinhDo,
      phongCachHoc: data.phongCachHoc,
      mucTieuNgheNghiep: data.mucTieuNgheNghiep,
      thoiGianHocDuKien,
      thoiGianMoiTuan,
      kienThucHienCo: data.kienThucHienCo,
      kinhNghiemThucTe: data.kinhNghiem,
      khoKhanHienTai: data.khoKhan
    };

    const res = await api.post<{ maLoTrinh: number; noiDungJSON: string }>('/lo-trinh-ai/them', payload);
    const noiDung = JSON.parse(res.data.noiDungJSON) as KetQuaLoTrinhAI;

    return {
      ...noiDung,
      loTrinh: noiDung.loTrinh ?? [],
      maLoTrinh: res.data.maLoTrinh
    };
  },

  getAllLoTrinh: async () => {
    return api.get<LoTrinhAICuaToiDTO[]>('/lo-trinh-ai/lay-tat-ca-lo-trinh');
  },

  getChiTietLoTrinh: async (maLoTrinh: number) => {
    return api.get<LoTrinhAICuaToiDTO>(`/lo-trinh-ai/chi-tiet/${maLoTrinh}`);
  }
};
