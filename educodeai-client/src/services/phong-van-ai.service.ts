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
    tinNhanAI: string;
}

export interface PhongVanSession {
    maPhongVan: number;
    viTriUngTuyen: string;
    capDo: string;
    tinhCachAI: TinhCachAI;
    soLuongCauHoi: number;
    trangThai: number;
    ghiChu: string;
    lichSuChat: PhongVanDocLapTurn[];
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

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

const unwrapResponse = <T>(response: unknown): T => {
    const result = response as ApiResponse<T>;
    return result?.data ?? response as T;
};

export const PhongVanAIService = {
    startInterview: async (request: StartPhongVanRequest) => {
        const response = await axiosClient.post<unknown>('/api/PhongVanAI/start', request);
        return unwrapResponse<StartPhongVanResponse>(response);
    },
    answerQuestion: async (request: AnswerPhongVanRequest) => {
        const response = await axiosClient.post<unknown>('/api/PhongVanAI/answer', request);
        return unwrapResponse<AnswerPhongVanResponse>(response);
    },
    endInterview: async (maPhongVan: number) => {
        const response = await axiosClient.post<unknown>(`/api/PhongVanAI/end/${maPhongVan}`);
        return unwrapResponse<EndPhongVanResponse>(response);
    },
    getInterview: async (maPhongVan: number) => {
        const response = await axiosClient.get<unknown>(`/api/PhongVanAI/${maPhongVan}`);
        return unwrapResponse<PhongVanSession>(response);
    },
    updateNote: async (maPhongVan: number, ghiChu: string) => {
        const response = await axiosClient.put<unknown>(`/api/PhongVanAI/${maPhongVan}/note`, { ghiChu });
        return unwrapResponse<{ success: boolean }>(response);
    },
    getHistory: async () => {
        const response = await axiosClient.get<unknown>('/api/PhongVanAI/history');
        return unwrapResponse<LichSuPhongVan[]>(response);
    }
};
