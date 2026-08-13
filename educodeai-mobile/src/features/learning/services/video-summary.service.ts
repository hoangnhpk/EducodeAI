import api from '../../../shared/configs/api';
import type { Lesson } from '../types/learning.types';

export interface VideoSummaryResult { ketQua: string; }

export async function getVideoSummary(lesson: Lesson): Promise<string> {
  const response = await api.post<VideoSummaryResult>('/ChatBotAI/tom-tat-video', {
    MaBaiHoc: lesson.id,
    PhuDeVideo: lesson.phuDeVideo || lesson.noiDung || '',
    VideoId: getYouTubeId(lesson.linkVideo),
    TieuDe: lesson.tieuDe || '',
  }, { timeout: 120000 });
  return response.data?.ketQua || '';
}

function getYouTubeId(value?: string | null) {
  if (!value) return '';
  const match = value.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/i);
  return match?.[1] ?? '';
}
