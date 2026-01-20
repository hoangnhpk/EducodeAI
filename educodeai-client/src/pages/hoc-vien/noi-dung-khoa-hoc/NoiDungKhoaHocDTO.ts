export type LoaiBaiHoc = 'video' | 'van-ban' | 'thuc-hanh' | 'trac-nghiem';

// export interface CauHoi {
//   id: number;
//   cauHoi: string;
//   cacLuaChon: string[];
//   dapAnDung: number;
// }

// export interface TestCase {
//   input: string;
//   expected: string;
// }

export interface BaiHoc {
  id: number;
  tieuDe: string;
  loai: LoaiBaiHoc;
  thoiLuong: string;
  noiDung?: string;
  linkVideo?: string;
  ThuTu: number; 
}

export interface ChuongHoc {
  id: number;
  tenChuong: string;
  baiHocs: BaiHoc[];
}

export interface KhoaHocData {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  cacChuong: ChuongHoc[];
}