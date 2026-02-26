// Định nghĩa khuôn mẫu hứng data từ API trả về
export interface DanhSachBaiTapDTO {
    maBaiTap: number;
    tenBaiTap: string;
    loaiBaiTap: string;
    tenKhoaHoc: string;
    tenChuong: string;
    tenBaiHoc: string;
    trangThai: string;
}

export interface GenerateQuizAIDTO {
  MaBaiHoc: number;
  TieuDe: string;
  NoiDungTomTat: string;
  DoKho: string;
  SoCauHoi: number;
}

export interface CreateQuizDTO {
    MaBaiHoc: number;
    ThoiGianLamBai: number;
    DiemCanDat: number;     // Khớp ERD: DiemCanDat
    ChoPhepLamLai: boolean; // Khớp ERD: ChoPhepLamLai
    DaoCauHoi: boolean;     // Khớp ERD: DaoCauHoi
    DuLieuCauHoi: string; // Khớp ERD: Trả về chuỗi JSON
}