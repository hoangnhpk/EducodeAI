import axiosClient from '@/configs/axios';

export const TinhCachAI = {
    Friendly: 1,
    Strict: 2,
    Normal: 3
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
    diemManh: string[];
    canCaiThien: string[];
    loiKhuyen: string;
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
        return await axiosClient.post<StartPhongVanResponse>('/api/PhongVanAI/start', request);
    },
    answerQuestion: async (request: AnswerPhongVanRequest) => {
        return await axiosClient.post<AnswerPhongVanResponse>('/api/PhongVanAI/answer', request);
    },
    endInterview: async (maPhongVan: number) => {
        return await axiosClient.post<EndPhongVanResponse>(`/api/PhongVanAI/end/${maPhongVan}`);
    },
    getHistory: async () => {
        return await axiosClient.get<LichSuPhongVan[]>('/api/PhongVanAI/history');
    }
};
