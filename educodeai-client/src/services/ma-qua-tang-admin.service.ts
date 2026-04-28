import axiosClient from "@/configs/axios";
import type { LichSuMaQuaTangDTO } from "./thanh-toan-khoa-hoc.service";

export const MaQuaTangAdminService = {
  layDanhSach: async (trangThai?: string, tuKhoa?: string): Promise<LichSuMaQuaTangDTO[]> => {
    const params: Record<string, string> = {};
    if (trangThai) params.trangThai = trangThai;
    if (tuKhoa) params.tuKhoa = tuKhoa;
    return await axiosClient.get<LichSuMaQuaTangDTO[]>("/api/quan-tri-vien/ma-qua-tang/danh-sach", { params });
  }
};
