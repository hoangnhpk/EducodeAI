import axiosClient from '@/configs/axios';

export interface ThongKeTongQuanDTO {
  tongHocVien: number;
  tongGiangVien: number;
  tongKhoaHoc: number;
  tongLuotDangKy: number;
}

export interface DangKyTheoThangDTO {
  nam: number;
  thang: number;
  nhan: string;
  soLuotDangKy: number;
  tongTien: number;
}

export interface PagedResultDTO<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface HocVienItemDTO {
  maNguoiDung: number;
  taiKhoan: string;
  hoTen: string;
  email: string;
  trangThai: string;
  ngayThamGia: string;
}

export interface GiangVienItemDTO {
  maNguoiDung: number;
  taiKhoan: string;
  hoTen: string;
  email: string;
  trangThai: string;
  ngayThamGia: string;
}

export interface KhoaHocItemDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  linhVuc: string;
  trinhDo: string;
  trangThai: string;
  thoiLuongGio: number;
  ngayTao: string;
  maGiangVien: number;
  tenGiangVien: string;
}

export interface DangKyItemDTO {
  maDangKy: number;
  ngayDangKy: string;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  maHocVien: number;
  tenHocVien: string;
  emailHocVien: string;
}

export interface TopKhoaHocDangKyDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  soLuotDangKy: number;
}

export interface TopGiangVienDangKyDTO {
  maGiangVien: number;
  tenGiangVien: string;
  email: string;
  soLuotDangKy: number;
}

export interface HoatDongChiSoDTO {
  dau: number;
  wau: number;
  mau: number;
}

export interface HoatDongHeThongDTO {
  asOfUtc: string;
  hocThat: HoatDongChiSoDTO;
  dangNhap: HoatDongChiSoDTO;
}

export interface ChatLuongKhoaHocItemDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  maGiangVien: number;
  tenGiangVien: string;
  soDangKy: number;
  tienDoTrungBinh: number;
  tyLeHoanThanh: number;
  soDanhGia: number;
  diemDanhGiaTrungBinh: number;
  soBinhLuan: number;
  diemChatLuong: number;
}

export const thongKeAdminService = {
  getTongQuan: async (): Promise<ThongKeTongQuanDTO> => {
    const body = await axiosClient.get<{ success: boolean; data: ThongKeTongQuanDTO }>(
      '/api/admin/thong-ke/tong-quan'
    );
    return body.data;
  },

  getDangKy12Thang: async (): Promise<DangKyTheoThangDTO[]> => {
    const body = await axiosClient.get<{ success: boolean; data: DangKyTheoThangDTO[] }>(
      '/api/admin/thong-ke/dang-ky-12-thang'
    );
    return body.data ?? [];
  },

  getDangKyTheoThang: async (params: { from?: string; to?: string }): Promise<DangKyTheoThangDTO[]> => {
    const body = await axiosClient.get<{ success: boolean; data: DangKyTheoThangDTO[] }>(
      '/api/admin/thong-ke/dang-ky-theo-thang',
      { params }
    );
    return body.data ?? [];
  },

  getTopKhoaHoc: async (params: {
    from?: string;
    to?: string;
    top?: number;
  }): Promise<TopKhoaHocDangKyDTO[]> => {
    const body = await axiosClient.get<{ success: boolean; data: TopKhoaHocDangKyDTO[] }>(
      '/api/admin/thong-ke/top-khoa-hoc',
      { params }
    );
    return body.data ?? [];
  },

  getTopGiangVien: async (params: {
    from?: string;
    to?: string;
    top?: number;
  }): Promise<TopGiangVienDangKyDTO[]> => {
    const body = await axiosClient.get<{ success: boolean; data: TopGiangVienDangKyDTO[] }>(
      '/api/admin/thong-ke/top-giang-vien',
      { params }
    );
    return body.data ?? [];
  },

  getHoatDong: async (params: { from?: string; to?: string }): Promise<HoatDongHeThongDTO> => {
    const body = await axiosClient.get<{ success: boolean; data: HoatDongHeThongDTO }>(
      '/api/admin/thong-ke/hoat-dong',
      { params }
    );
    return body.data;
  },
  getChatLuongKhoaHoc: async (params: { from?: string; to?: string; top?: number }): Promise<ChatLuongKhoaHocItemDTO[]> => {
    const body = await axiosClient.get<{ success: boolean; data: ChatLuongKhoaHocItemDTO[] }>(
      '/api/admin/thong-ke/chat-luong-khoa-hoc',
      { params }
    );
    return body.data ?? [];
  },

  getChiTietHocVien: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PagedResultDTO<HocVienItemDTO>> => {
    const body = await axiosClient.get<{ success: boolean; data: PagedResultDTO<HocVienItemDTO> }>(
      '/api/admin/thong-ke/chi-tiet/hoc-vien',
      { params }
    );
    return body.data;
  },

  getChiTietGiangVien: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PagedResultDTO<GiangVienItemDTO>> => {
    const body = await axiosClient.get<{
      success: boolean;
      data: PagedResultDTO<GiangVienItemDTO>;
    }>('/api/admin/thong-ke/chi-tiet/giang-vien', { params });
    return body.data;
  },

  getChiTietKhoaHoc: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PagedResultDTO<KhoaHocItemDTO>> => {
    const body = await axiosClient.get<{ success: boolean; data: PagedResultDTO<KhoaHocItemDTO> }>(
      '/api/admin/thong-ke/chi-tiet/khoa-hoc',
      { params }
    );
    return body.data;
  },

  getChiTietDangKy: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PagedResultDTO<DangKyItemDTO>> => {
    const body = await axiosClient.get<{ success: boolean; data: PagedResultDTO<DangKyItemDTO> }>(
      '/api/admin/thong-ke/chi-tiet/dang-ky',
      { params }
    );
    return body.data;
  },
};

export default thongKeAdminService;
