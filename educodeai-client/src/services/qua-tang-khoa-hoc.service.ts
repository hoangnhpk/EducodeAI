import axiosClient from "@/configs/axios";

export interface TangKhoaHocRequest {
  maKhoaHoc: number;
  maNguoiNhan: number;
  loiNhan?: string;
}

export interface KetQuaTangKhoaHocDTO {
  maQuaTang: number;
  maKhoaHoc: number;
  maNguoiNhan: number;
  maNguoiTang: number;
  loaiNguoiTang: string;
  trangThai: string;
  daGuiEmailNguoiTang: boolean;
  daGuiEmailNguoiNhan: boolean;
  thongBao: string;
  createdAt: string;
}

export interface QuaTangKhoaHocItemDTO {
  maQuaTang: number;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  maNguoiTang: number;
  tenNguoiTang: string;
  maNguoiNhan: number;
  tenNguoiNhan: string;
  emailNguoiNhan?: string;
  loaiNguoiTang: string;
  trangThai: string;
  loiNhan?: string;
  createdAt: string;
}

export interface KhoaHocTangOptionDTO {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  giaKhoaHoc: number;
  donViTienTe: string;
}

export interface HocVienTangOptionDTO {
  maNguoiDung: number;
  hoTen: string;
  email?: string;
}

export const quaTangKhoaHocService = {
  giangVienTang: async (payload: TangKhoaHocRequest): Promise<KetQuaTangKhoaHocDTO> => {
    return axiosClient.post<KetQuaTangKhoaHocDTO>("/api/giang-vien/qua-tang-khoa-hoc/tang", payload);
  },

  adminTang: async (payload: TangKhoaHocRequest): Promise<KetQuaTangKhoaHocDTO> => {
    return axiosClient.post<KetQuaTangKhoaHocDTO>("/api/quan-tri-vien/qua-tang-khoa-hoc/tang", payload);
  },

  lichSuGiangVien: async (maKhoaHoc?: number, tuKhoa?: string): Promise<QuaTangKhoaHocItemDTO[]> => {
    return axiosClient.get<QuaTangKhoaHocItemDTO[]>("/api/giang-vien/qua-tang-khoa-hoc/lich-su", {
      params: {
        maKhoaHoc: maKhoaHoc || undefined,
        tuKhoa: tuKhoa || undefined,
      },
    });
  },

  lichSuAdmin: async (tuKhoa?: string): Promise<QuaTangKhoaHocItemDTO[]> => {
    return axiosClient.get<QuaTangKhoaHocItemDTO[]>("/api/quan-tri-vien/qua-tang-khoa-hoc/lich-su", {
      params: { tuKhoa: tuKhoa || undefined },
    });
  },

  layKhoaHocCoTheTangChoHocVien: async (maNguoiNhan: number): Promise<KhoaHocTangOptionDTO[]> => {
    return axiosClient.get<KhoaHocTangOptionDTO[]>(`/api/quan-tri-vien/qua-tang-khoa-hoc/hoc-vien/${maNguoiNhan}/khoa-hoc-co-the-tang`);
  },

  layKhoaHocCuaGiangVien: async (): Promise<KhoaHocTangOptionDTO[]> => {
    return axiosClient.get<KhoaHocTangOptionDTO[]>("/api/giang-vien/qua-tang-khoa-hoc/khoa-hoc-cua-toi");
  },

  layHocVienCoTheNhanTheoKhoaHoc: async (maKhoaHoc: number, tuKhoa?: string): Promise<HocVienTangOptionDTO[]> => {
    return axiosClient.get<HocVienTangOptionDTO[]>(`/api/giang-vien/qua-tang-khoa-hoc/khoa-hoc/${maKhoaHoc}/hoc-vien-co-the-nhan`, {
      params: { tuKhoa: tuKhoa || undefined },
    });
  },
};

export default quaTangKhoaHocService;
