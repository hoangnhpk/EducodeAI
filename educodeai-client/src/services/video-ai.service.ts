import axiosClient from '@/configs/axios';

export interface VideoQuizDTO {
    maVideoQuiz: number;
    cauHoi: string;
    dapAnA: string;
    dapAnB: string;
    dapAnC?: string;
    dapAnD?: string;
    dapAnDung: string;
}

export interface VideoChapterDTO {
    maChapter: number;
    maBaiHoc: number;
    thoiGianBatDau: number;
    thoiGianKetThuc: number;
    kienThucChinh: string;
    batBuoc: boolean;
    videoQuizs: VideoQuizDTO[];
    daKiemTra?: boolean; // Cờ dùng trên frontend, không lưu DB
}

export const VideoAIService = {
    /**
     * Lấy danh sách Chapter + Quiz AI cho bài học.
     * Nếu chưa có → tự động gọi API phân tích video (lấy phụ đề YouTube → Gemini).
     */
    async khoiTaoVideoInteractive(maBaiHoc: number): Promise<VideoChapterDTO[]> {
        try {
            // Bước 1: Kiểm tra đã có dữ liệu chưa
            const existing = await axiosClient.get<VideoChapterDTO[]>(
                `/api/HocVien/VideoAI/GetVideoInteractive/${maBaiHoc}`
            );

            if (existing && existing.length > 0) {
                return existing;
            }

            // Bước 2: Chưa có → kích hoạt phân tích AI (tự động lấy phụ đề YouTube)
            await axiosClient.post(`/api/HocVien/VideoAI/PhanTichVideo/${maBaiHoc}`);

            // Bước 3: Lấy lại kết quả sau phân tích
            const after = await axiosClient.get<VideoChapterDTO[]>(
                `/api/HocVien/VideoAI/GetVideoInteractive/${maBaiHoc}`
            );
            return after ?? [];
        } catch {
            // Nếu lỗi (video không có phụ đề, Gemini lỗi...) → trả mảng rỗng, không ảnh hưởng luồng xem video
            return [];
        }
    }
};
