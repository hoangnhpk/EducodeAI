export type TrinhDo = "nguoi_moi" | "trung_cap" | "nang_cao" | "";

export type TrangThaiAI = "cho" | "dang_phan_tich" | "da_co_ket_qua";

export interface DuLieuYeuCauLoTrinh {
  hoTen: string;
  trinhDo: TrinhDo;
  phongCachHoc: string;
  mucTieuNgheNghiep: string;
  thoiGianHoc: string;
  mucDoCamKet: string;
  cacMangTapTrung: string[];
}

export interface KhoaHocSuDung {
  maKhoaHoc: number;
  TuTuan: number;
  DenTuan: number;
  tenKhoaHoc: string;
  noiDungChinh: string;
}

export interface GiaiDoanLoTrinh {
  GiaiDoan: number;
  mucTieu: string;
  khoaHocSuDung: KhoaHocSuDung[];
}

export interface KetQuaLoTrinhAI {
  tongThoiGianTuan: number;
  loTrinh: GiaiDoanLoTrinh[];
}
