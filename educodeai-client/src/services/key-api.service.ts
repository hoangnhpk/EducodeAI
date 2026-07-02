import axiosClient from '@/configs/axios';
import type { KeyApiSummary, KeyApiManage, ApiKeyRevealDto } from '../pages/quan-tri-vien/quan-ly-api-key/QuanLyApiKey.types';

export const keyApiService = {
  getAll: () => axiosClient.get<KeyApiSummary[]>('/api/KeyApi'),
  
  getById: (id: number) => axiosClient.get<KeyApiSummary>(`/api/KeyApi/${id}`),
  
  create: (data: KeyApiManage) => axiosClient.post('/api/KeyApi', data),

  update: (id: number, data: KeyApiManage) => axiosClient.put(`/api/KeyApi/${id}`, data),
  
  toggleStatus: (id: number, status: boolean) => 
    axiosClient.put(`/api/KeyApi/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    }),
    
  delete: (id: number) => axiosClient.delete(`/api/KeyApi/${id}`),
  
  syncToRedis: (id: number) => axiosClient.post(`/api/KeyApi/${id}/sync-config`),

  resetUsage: (id: number) => axiosClient.post(`/api/KeyApi/${id}/reset-usage`),

  revealKey: (id: number) => axiosClient.get<ApiKeyRevealDto>(`/api/KeyApi/${id}/reveal`)
};
