export interface LoTrinhAICuaToiDTO {
  maLoTrinh: number;
  tenLoTrinh: string;
  moTaChung: string;
  tongSoKhoaHoc: number;
  tongThoiGianTuan: number;
  tongSoGiaiDoan: number;       // Mới thêm
  soGiaiDoanHoanThanh: number;  // Mới thêm
  phanTramHoanThanh: number;

  giaiDoan?: ChiTietGiaiDoanDTO[];
}

export interface KhoaHocTrongLoTrinhDTO {
    maKhoaHoc: number;
    tenKhoaHoc: string;
    noiDungChinh: string;
    ghiChu: string;
    tuTuan: number;
    denTuan: number;
    slug?: string;
}

export interface ChiTietGiaiDoanDTO {
    giaiDoan: number;
    mucTieu: string;
    tongKhoaHoc: number;
    khoaHocHoanThanh: number;
    phanTram: number;
    hoanThanh: boolean;
    // Đây là phần mở rộng để hứng danh sách khóa học nếu BE trả về
    danhSachKhoaHoc?: KhoaHocTrongLoTrinhDTO[]; 
}