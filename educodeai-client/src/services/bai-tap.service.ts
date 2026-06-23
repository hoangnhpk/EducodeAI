// Import cái axiosClient thần thánh của ông vào đây
import axiosClient from "@/configs/axios";
import type { DanhSachBaiTapDTO } from "@/pages/giang-vien/quan-ly-bai-tap/types";
import type { GenerateQuizAIDTO } from "@/pages/giang-vien/quan-ly-bai-tap/types";
import type { CreateQuizDTO } from "@/pages/giang-vien/quan-ly-bai-tap/types";

export const BaiTapService = {
    getDanhSachByGiangVien: () => {
        return axiosClient.get<DanhSachBaiTapDTO[]>(`/api/BaiTap/ds-bai-tap`);
    },

    taoQuizBangAI: (data: GenerateQuizAIDTO) => {
        return axiosClient.post<any>("/api/BaiTap/tao-bang-ai", data, {
        timeout: 120000, // 120s - Tha hồ cho AI suy ngẫm
      });
    },

    getKhoaHocs: () => {
        return axiosClient.get<any>("/api/BaiTap/khoa-hoc");
    },

    getChuongHocs: (maKhoaHoc: number) => {
        return axiosClient.get<any>(`/api/BaiTap/chuong-hoc/${maKhoaHoc}`);
    },

    getBaiHocs: (maChuong: number) => {
        return axiosClient.get<any>(`/api/BaiTap/bai-hoc/${maChuong}`);
    },
    xuatBanQuiz: (data: CreateQuizDTO) => {
        return axiosClient.post<any>("/api/BaiTap/xuat-ban", data);
    },

    capNhatQuiz: (maBaiTap: number, data: CreateQuizDTO) => {
        return axiosClient.put<any>(`/api/BaiTap/quiz/${maBaiTap}`, data);
    },

    deleteBaiTap: (maBaiTap: number) => {
        return axiosClient.delete<any>(`/api/BaiTap/xoa/${maBaiTap}`);
    },
    
    getChiTietBaiTap: (id: number) => {
        // Thay đổi URL theo đúng API lấy chi tiết bài tập của backend ông nha
        return axiosClient.get<any>(`/api/BaiTap/${id}`); 
    },
};