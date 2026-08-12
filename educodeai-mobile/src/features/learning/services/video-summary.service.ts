import api from '../../../shared/configs/api';

export interface VideoInteractiveChapter {
  maChapter: number;
  maBaiHoc: number;
  thoiGianBatDau: number;
  thoiGianKetThuc: number;
  kienThucChinh: string;
  batBuoc: boolean;
  videoQuizs: {
    maVideoQuiz: number;
    cauHoi: string;
    dapAnA: string;
    dapAnB: string;
    dapAnC?: string;
    dapAnD?: string;
    dapAnDung: string;
  }[];}

export async function getVideoInteractive(lessonId: number): Promise<VideoInteractiveChapter[]> {
  try {
    const existing = await api.get<VideoInteractiveChapter[]>(`/HocVien/VideoAI/GetVideoInteractive/${lessonId}`);
    if (existing.data?.length) return existing.data;
    await api.post(`/HocVien/VideoAI/PhanTichVideo/${lessonId}`);
    const analyzed = await api.get<VideoInteractiveChapter[]>(`/HocVien/VideoAI/GetVideoInteractive/${lessonId}`);
    return analyzed.data ?? [];
  } catch {
    return [];
  }
}
