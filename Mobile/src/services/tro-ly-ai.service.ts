import api from '../configs/api';

export interface ChatMessage {
    VaiTro: 'user' | 'assistant';
    NoiDung: string;
}

export interface TuVanHocTapRequest {
    LichSuChat: ChatMessage[];
    TieuDeBaiHoc: string | null;
    NoiDungBaiHoc: string | null;
}

export interface TuVanHocTapResponse {
    cauTraLoi: string;
}

export const TroLyAIService = {
    async tuVanHocTap(data: TuVanHocTapRequest) {
        return api.post<TuVanHocTapResponse>('/ChatBotAI/tu-van-hoc-tap', data, { timeout: 120000 });
    }
};
