import api from '../../../shared/configs/api';

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

export interface NoiDungHoc {
  chuDe: string;
  moTa: string;
  kyNangDatDuoc: string[];
}

export interface ChiTietGiaiDoan {
  giaiDoan: number;
  tenGiaiDoan: string;
  thoiGian: string;
  mucTieu: string;
  noiDung: NoiDungHoc[];
}

export interface KetQuaLoTrinhAI {
  tenLoTrinh: string;
  mucTieu: string;
  tongThoiGian: string;
  loTrinh: ChiTietGiaiDoan[];
  maLoTrinh?: number;
}

export interface LoTrinhAICuaToiDTO {
  maLoTrinh: number;
  mucTieuNgheNghiep: string;
  trangThai: string;
  ngayTao: string;
  noiDungJSON: string;
  baiHocs?: unknown[];
}

function parseRoadmap(noiDungJSON: string): KetQuaLoTrinhAI {
  let value: unknown;
  try {
    value = JSON.parse(noiDungJSON);
  } catch {
    throw new Error('Nội dung lộ trình từ máy chủ không hợp lệ.');
  }
  if (!value || typeof value !== 'object') {
    throw new Error('Nội dung lộ trình từ máy chủ không hợp lệ.');
  }
  const roadmap = value as Partial<KetQuaLoTrinhAI>;
  const stages = Array.isArray(roadmap.loTrinh)
    ? roadmap.loTrinh.filter((stage): stage is ChiTietGiaiDoan => (
      Boolean(stage)
      && typeof stage === 'object'
      && typeof stage.giaiDoan === 'number'
      && typeof stage.tenGiaiDoan === 'string'
      && Array.isArray(stage.noiDung)
    ))
    : [];
  return {
    tenLoTrinh: typeof roadmap.tenLoTrinh === 'string' ? roadmap.tenLoTrinh : 'Lộ trình AI',
    mucTieu: typeof roadmap.mucTieu === 'string' ? roadmap.mucTieu : '',
    tongThoiGian: typeof roadmap.tongThoiGian === 'string' ? roadmap.tongThoiGian : '',
    loTrinh: stages,
  };
}

function parsePositiveNumber(value: string | undefined, fieldName: string, fallback?: number) {
  if (!value?.trim() && fallback !== undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} phải là số lớn hơn 0.`);
  }
  return parsed;
}

const AI_TIMEOUT = 120000;

export const aiRoadmapService = {
  async taoLoTrinh(data: DuLieuYeuCauLoTrinh) {
    const response = await api.post<{ maLoTrinh: number; noiDungJSON: string }>(
      '/lo-trinh-ai/them',
      {
        trinhDoHienTai: data.trinhDo,
        phongCachHoc: data.phongCachHoc,
        mucTieuNgheNghiep: data.mucTieuNgheNghiep,
        thoiGianHocDuKien: parsePositiveNumber(data.thoiGianHoc, 'Số tuần dự kiến'),
        thoiGianMoiTuan: parsePositiveNumber(data.mucDoCamKet, 'Số giờ học mỗi tuần', 1),
        kienThucHienCo: data.kienThucHienCo,
        kinhNghiemThucTe: data.kinhNghiem,
        khoKhanHienTai: data.khoKhan,
      },
      { timeout: AI_TIMEOUT },
    );
    return { ...parseRoadmap(response.data.noiDungJSON), maLoTrinh: response.data.maLoTrinh };
  },

  async getAllLoTrinh() {
    const response = await api.get<LoTrinhAICuaToiDTO[]>('/lo-trinh-ai/lay-tat-ca-lo-trinh');
    return response.data;
  },

  async getChiTietLoTrinh(maLoTrinh: number) {
    const response = await api.get<LoTrinhAICuaToiDTO>(`/lo-trinh-ai/chi-tiet/${maLoTrinh}`);
    return { record: response.data, roadmap: parseRoadmap(response.data.noiDungJSON) };
  },
};
