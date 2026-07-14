import axiosClient from "@/configs/axios";

export interface ThongTinViAIDTO {
  soDuAiBalanceUsd: number;
  soDuVndKhaDung: number;
  tyGiaHienTai: number;
}

export interface YeuCauNapTienAIDTO {
  soTienVnd: number;
}

export interface KetQuaNapTienAIDTO {
  maGiaoDich: number;
  soTienVnd: number;
  soTienUsd: number;
  tyGiaApDung: number;
  soDuAiBalanceUsdMoi: number;
  soDuVndKhaDungMoi: number;
  createdAt: string;
}

export interface LichSuNapTienAIItemDTO {
  maGiaoDich: number;
  soTienVnd: number;
  soTienUsd: number;
  tyGiaApDung: number;
  trangThai: string;
  createdAt: string;
}

export const NapTienAIService = {
  async layThongTinVi(): Promise<ThongTinViAIDTO> {
    return await axiosClient.get<ThongTinViAIDTO>("/api/giang-vien/nap-tien-ai/vi");
  },

  async napTien(soTienVnd: number): Promise<KetQuaNapTienAIDTO> {
    return await axiosClient.post<KetQuaNapTienAIDTO>("/api/giang-vien/nap-tien-ai/nap-tien", { soTienVnd });
  },

  async layLichSu(): Promise<LichSuNapTienAIItemDTO[]> {
    return await axiosClient.get<LichSuNapTienAIItemDTO[]>("/api/giang-vien/nap-tien-ai/lich-su");
  }
};
