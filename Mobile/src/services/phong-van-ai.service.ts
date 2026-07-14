import api from '../configs/api';

export enum TinhCachAI {
    Friendly = 1,
    Strict = 2,
    Normal = 3
}

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
        const response = await api.post('/PhongVanAI/start', request);
        return response.data;
    },
    answerQuestion: async (request: AnswerPhongVanRequest) => {
        const response = await api.post('/PhongVanAI/answer', request);
        return response.data;
    },
    endInterview: async (maPhongVan: number) => {
        const response = await api.post(`/PhongVanAI/end/${maPhongVan}`);
        return response.data;
    },
    getHistory: async () => {
        const response = await api.get('/PhongVanAI/history');
        return response.data;
    }
};
