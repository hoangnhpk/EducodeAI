import api from '@/configs/axios';

export const TinhCachAI = {
    Friendly: 0,
    Strict: 1,
    Normal: 2
} as const;

export type TinhCachAI = typeof TinhCachAI[keyof typeof TinhCachAI];

export interface StartPhongVanRequest {
    viTriUngTuyen: string;
    capDo: string;
    tinhCachAI: TinhCachAI;
    soLuongCauHoi: number;
}

export interface StartPhongVanResponse {
    maPhongVan: number;
    cauHoiDauTien: string;
}

export interface AnswerPhongVanRequest {
    maPhongVan: number;
    cauTraLoi: string;
}

export interface AnswerPhongVanResponse {
    isFinished: boolean;
    nhanXetCauTruoc: string;
    cauHoiTiepTheo: string;
}

export interface PhongVanDocLapTurn {
    role: string;
    message: string;
    timestamp: Date;
}

export interface EndPhongVanResponse {
    diemSo: number;
    danhGiaChung: string;
    lichSuChat: PhongVanDocLapTurn[];
}

export interface LichSuPhongVan {
    maPhongVan: number;
    viTriUngTuyen: string;
    capDo: string;
    tinhCachAI: TinhCachAI;
    soLuongCauHoi: number;
    diemSo: number;
    danhGiaChung: string;
    trangThai: number;
    ngayPhongVan: Date;
}

export const PhongVanAIService = {
    startInterview: async (request: StartPhongVanRequest) => {
        return await api.post<StartPhongVanResponse>('/PhongVanAI/start', request);
    },
    answerQuestion: async (request: AnswerPhongVanRequest) => {
        return await api.post<AnswerPhongVanResponse>('/PhongVanAI/answer', request);
    },
    endInterview: async (maPhongVan: number) => {
        return await api.post<EndPhongVanResponse>(`/PhongVanAI/end/${maPhongVan}`);
    },
    getHistory: async () => {
        return await api.get<LichSuPhongVan[]>('/PhongVanAI/history');
    }
};
