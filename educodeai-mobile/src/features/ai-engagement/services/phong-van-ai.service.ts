import api from '../../../shared/configs/api';

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
    tinNhanAI: string;
}

export interface PhongVanDocLapTurn {
    role: string;
    message: string;
    timestamp: string;
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
    ngayPhongVan: string;
}

interface ApiEnvelope<T> {
    success: boolean;
    data?: T;
    message?: string;
}

function unwrapResponse<T>(envelope: ApiEnvelope<T>): T {
    if (!envelope.success || envelope.data === undefined) {
        throw new Error(envelope.message || 'Phản hồi từ máy chủ không hợp lệ.');
    }
    return envelope.data;
}

const AI_TIMEOUT = 120000;

export const PhongVanAIService = {
    async startInterview(request: StartPhongVanRequest) {
        const response = await api.post<ApiEnvelope<StartPhongVanResponse>>(
            '/PhongVanAI/start',
            request,
            { timeout: AI_TIMEOUT },
        );
        return unwrapResponse(response.data);
    },
    async answerQuestion(request: AnswerPhongVanRequest) {
        const response = await api.post<ApiEnvelope<AnswerPhongVanResponse>>(
            '/PhongVanAI/answer',
            request,
            { timeout: AI_TIMEOUT },
        );
        return unwrapResponse(response.data);
    },
    async endInterview(maPhongVan: number) {
        const response = await api.post<ApiEnvelope<EndPhongVanResponse>>(
            `/PhongVanAI/end/${maPhongVan}`,
            undefined,
            { timeout: AI_TIMEOUT },
        );
        return unwrapResponse(response.data);
    },
    async getHistory() {
        const response = await api.get<ApiEnvelope<LichSuPhongVan[]>>('/PhongVanAI/history');
        return unwrapResponse(response.data);
    }
};
