export type TrinhDo = "Người mới" | "Trung cấp" | "Nâng cao" | "";

export type TrangThaiAI = "cho" | "dang_phan_tich" | "da_co_ket_qua";

export interface DuLieuYeuCauLoTrinh {
  hoTen: string;
  trinhDo: TrinhDo;
  phongCachHoc: string;
  mucTieuNgheNghiep: string;
  thoiGianHoc: string;
  mucDoCamKet: string;
  kienThucHienCo: string;
  kinhNghiem: string;
  khoKhan: string;
}

export interface KhoaHocSuDung {
  maKhoaHoc: number;
  TuTuan: number;
  DenTuan: number;
  tenKhoaHoc: string;
  noiDungChinh: string;
  ghiChu: string;
}

export interface GiaiDoanLoTrinh {
  GiaiDoan: number;
  mucTieu: string;
  khoaHocSuDung: KhoaHocSuDung[];
}

export interface KetQuaLoTrinhAI {
  maLoTrinh?: number;
  tenLoTrinh: string;
  moTaChung: string;
  tongThoiGianTuan: number;
  loTrinh: GiaiDoanLoTrinh[];
}
