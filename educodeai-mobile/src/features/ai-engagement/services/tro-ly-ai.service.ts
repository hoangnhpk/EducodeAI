import api from '../../../shared/configs/api';

export interface ChatMessage {
    VaiTro: 'user' | 'assistant';
    NoiDung: string;
}

export interface TuVanHocTapRequest {
    LichSuChat: ChatMessage[];
    MaBaiHoc?: number | null;
    TieuDeBaiHoc: string | null;
    NoiDungBaiHoc: string | null;
    ThoiGianVideo?: number | null;
}

export interface TuVanHocTapResponse {
    cauTraLoi: string;
}

export const TroLyAIService = {
    async tuVanHocTap(data: TuVanHocTapRequest) {
        // api.ts hiện đã thêm /api vào baseURL. Owner Auth sẽ quản lý boundary này.
        return api.post<TuVanHocTapResponse>('/ChatBotAI/tu-van-hoc-tap', data, { timeout: 120000 });
    }
};
