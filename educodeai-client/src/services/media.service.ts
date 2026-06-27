import axiosClient from '@/configs/axios';
import axios from 'axios';

const BASE = '/api/giang-vien/media';

// Helper to extract nested 'data' from custom backend response format
const extractData = <T>(res: any): T => {
  if (res && res.success !== undefined) {
    if (!res.success) throw new Error(res.message || 'API request failed');
    return res.data as T;
  }
  return res as T; // Fallback for endpoints that return un-wrapped results
};

export interface ChuKyUploadVideoDTO {
    timestamp: string;
    signature: string;
    apiKey: string;
    cloudName: string;
    folder: string;
}

export const layChuKyUploadVideo = async () => {
  const res = await axiosClient.get(`${BASE}/lay-chu-ky-upload`);
  return extractData<ChuKyUploadVideoDTO>(res);
};

export interface LuuThongTinVideoDTO {
  maBaiHoc: number;
  publicId: string;
  secureUrl: string;
  thoiLuong: number;
  dungLuong: number;
}

export const luuThongTinVideo = async (dto: LuuThongTinVideoDTO) => {
  const res = await axiosClient.post(`${BASE}/luu-video`, dto);
  return extractData<any>(res);
};

export const layTokenPhatVideo = async (publicId: string) => {
  const res = await axiosClient.get(`${BASE}/lay-token-phat-video?publicId=${publicId}`);
  return extractData<{ token: string }>(res);
};

export const uploadVideoToCloudinary = async (
  file: File, 
  signatureData: ChuKyUploadVideoDTO, 
  onProgress?: (percent: number) => void
) => {
  const chunkSize = 20 * 1024 * 1024; // 20MB mỗi chunk
  const totalChunks = Math.ceil(file.size / chunkSize);
  // Tạo unique ID cho phiên upload
  const uniqueUploadId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/video/upload`;
  let uploadResult: any = null;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);

    const res = await axios.post(url, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-Unique-Upload-Id': uniqueUploadId,
        'Content-Range': `bytes ${start}-${end - 1}/${file.size}`
      }
    });

    if (onProgress) {
      const percentCompleted = Math.round((end * 100) / file.size);
      onProgress(percentCompleted);
    }
    
    uploadResult = res.data; // Lưu lại kết quả của chunk cuối cùng
  }

  return uploadResult; 
};
