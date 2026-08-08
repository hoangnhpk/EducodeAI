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

type ApiEnvelope<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

const unwrapResponse = <T>(response: T | ApiEnvelope<T>): T => {
    if (typeof response === 'object' && response !== null && 'success' in response) {
        const envelope = response as ApiEnvelope<T>;
        if (!envelope.success || envelope.data === undefined) {
            throw new Error(envelope.message || 'Phản hồi từ máy chủ không hợp lệ.');
        }
        return envelope.data;
    }

    return response as T;
};

export const PhongVanAIService = {
    startInterview: async (request: StartPhongVanRequest) => {
        const response = await axiosClient.post<StartPhongVanResponse | ApiEnvelope<StartPhongVanResponse>>('/api/PhongVanAI/start', request);
        return unwrapResponse(response);
    },
    answerQuestion: async (request: AnswerPhongVanRequest) => {
        const response = await axiosClient.post<AnswerPhongVanResponse | ApiEnvelope<AnswerPhongVanResponse>>('/api/PhongVanAI/answer', request);
        return unwrapResponse(response);
    },
    endInterview: async (maPhongVan: number) => {
        const response = await axiosClient.post<EndPhongVanResponse | ApiEnvelope<EndPhongVanResponse>>(`/api/PhongVanAI/end/${maPhongVan}`);
        return unwrapResponse(response);
    },
    getHistory: async () => {
        const response = await axiosClient.get<LichSuPhongVan[] | ApiEnvelope<LichSuPhongVan[]>>('/api/PhongVanAI/history');
        return unwrapResponse(response);
    }
};
