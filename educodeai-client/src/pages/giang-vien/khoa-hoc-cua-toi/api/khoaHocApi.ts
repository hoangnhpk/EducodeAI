import axiosClient from '@/configs/axios';
import type {
  KhoaHocListItem,
  KhoaHocDetail,
  KhoaHocCreateUpdate,
  ChuongHocCreateUpdate,
  ChuongHocResponse,
  BaiHocCreateUpdate,
  BaiHocResponse,
  ReorderChuongPayload,
  ReorderBaiHocPayload,
  CertificateConfig,
  KetQuaTaoDeChungChiAI,
  PlaylistAnalyzeRequest,
  PlaylistAnalyzeResult,
  YouTubeVideoItem,
  PlaylistImportRequest,
  PlaylistImportResult,
} from '../types';

const BASE = '/api/giang-vien/khoa-hoc';

// Helper to extract nested 'data' from custom backend response format
const extractData = <T>(res: any): T => {
  if (res && res.success !== undefined) {
    if (!res.success) throw new Error(res.message || 'API request failed');
    return res.data as T;
  }
  return res as T; // Fallback for endpoints that return un-wrapped results
};

// Helper for [FromForm] endpoints
const toFormData = (obj: any): FormData => {
  const fd = new FormData();
  Object.keys(obj).forEach(k => {
    if (obj[k] !== undefined && obj[k] !== null) {
      fd.append(k, obj[k].toString());
    }
  });
  return fd;
};

// ==============================
//  KHÓA HỌC
// ==============================

// [HttpGet("danh-sach")]
export const getDanhSachKhoaHoc = async (_maGiangVien: number) => {
  const res = await axiosClient.get(`${BASE}/danh-sach`);
  return extractData<KhoaHocListItem[]>(res);
};

// [HttpGet("chi-tiet/{maKhoaHoc}")]
export const getChiTietKhoaHoc = async (_maGiangVien: number, maKhoaHoc: number) => {
  const res = await axiosClient.get(`${BASE}/chi-tiet/${maKhoaHoc}`);
  return extractData<KhoaHocDetail>(res);
};

// [HttpPost("tao-moi")] -> [FromForm]
export const taoKhoaHoc = async (_maGiangVien: number, dto: KhoaHocCreateUpdate) => {
  const res: any = await axiosClient.post(`${BASE}/tao-moi`, toFormData(dto));
  // Returns Ok(new { success = true, maKhoaHoc = ..., message = ... })
  if (!res || res.success === false) return 0;
  return Number(res.maKhoaHoc || res.data?.maKhoaHoc || res.data || 0);
};

// [HttpPut("cap-nhat/{maKhoaHoc}")] -> [FromForm]
export const capNhatKhoaHoc = async (_maGiangVien: number, maKhoaHoc: number, dto: KhoaHocCreateUpdate) => {
  const res: any = await axiosClient.put(`${BASE}/cap-nhat/${maKhoaHoc}`, toFormData(dto));
  return res?.success ?? true;
};

// [HttpDelete("xoa/{maKhoaHoc}")]
export const xoaKhoaHoc = async (_maGiangVien: number, maKhoaHoc: number) => {
  const res: any = await axiosClient.delete(`${BASE}/xoa/${maKhoaHoc}`);
  return res?.success ?? true;
};

// ==============================
//  CHỨNG CHỈ
// ==============================

// [HttpGet("courses/{maKhoaHoc}/certificate-config")]
export const getCertificateConfig = async (_maGiangVien: number, maKhoaHoc: number) => {
  const res = await axiosClient.get(`${BASE}/courses/${maKhoaHoc}/certificate-config`);
  return extractData<CertificateConfig>(res);
};

// [HttpPut("courses/{maKhoaHoc}/certificate-config")]
export const saveCertificateConfig = async (_maGiangVien: number, maKhoaHoc: number, dto: CertificateConfig) => {
  await axiosClient.put(`${BASE}/courses/${maKhoaHoc}/certificate-config`, dto);
  return true;
};

// [HttpPost("tao-de-chung-chi-ai/{maKhoaHoc}")]
export const taoDeChungChiBangAI = async (_maGiangVien: number, maKhoaHoc: number) => {
  const res = await axiosClient.post(`${BASE}/tao-de-chung-chi-ai/${maKhoaHoc}`);
  return extractData<KetQuaTaoDeChungChiAI>(res);
};

// [HttpPost("courses/{maKhoaHoc}/certificate/enable")]
export const enableCertificate = async (maKhoaHoc: number) => {
  const res = await axiosClient.post(`${BASE}/courses/${maKhoaHoc}/certificate/enable`);
  return res;
};

// [HttpPost("courses/{maKhoaHoc}/certificate/disable")]
export const disableCertificate = async (maKhoaHoc: number) => {
  const res = await axiosClient.post(`${BASE}/courses/${maKhoaHoc}/certificate/disable`);
  return res;
};

// ==============================
//  CHƯƠNG HỌC
// ==============================

// [HttpPost("them-chuong/{maKhoaHoc}")] -> [FromBody]
export const themChuong = async (_maGiangVien: number, maKhoaHoc: number, dto: ChuongHocCreateUpdate) => {
  const res = await axiosClient.post(`${BASE}/them-chuong/${maKhoaHoc}`, dto);
  return extractData<ChuongHocResponse>(res);
};

// [HttpPut("cap-nhat-chuong/{maChuong}")] -> [FromBody]
export const capNhatChuong = async (_maGiangVien: number, maChuong: number, dto: ChuongHocCreateUpdate) => {
  const res: any = await axiosClient.put(`${BASE}/cap-nhat-chuong/${maChuong}`, dto);
  return res?.success ?? true;
};

// [HttpDelete("xoa-chuong/{maChuong}")]
export const xoaChuong = async (_maGiangVien: number, maChuong: number) => {
  const res: any = await axiosClient.delete(`${BASE}/xoa-chuong/${maChuong}`);
  return res?.success ?? true;
};

// [HttpPut("courses/{maKhoaHoc}/chapters/reorder")]
export const reorderChuong = async (_maGiangVien: number, maKhoaHoc: number, payload: ReorderChuongPayload) => {
  await axiosClient.put(`${BASE}/courses/${maKhoaHoc}/chapters/reorder`, payload.chapterOrders);
  return true;
};

// ==============================
//  BÀI HỌC
// ==============================

// [HttpPost("them-video/{maChuong}")] -> [FromForm] BaiHocVideoCreateUpdateDTO
export const themBaiHoc = async (_maGiangVien: number, maChuong: number, dto: BaiHocCreateUpdate) => {
  const res = await axiosClient.post(`${BASE}/them-video/${maChuong}`, toFormData(dto));
  return extractData<BaiHocResponse>(res);
};

// [HttpPut("cap-nhat-video/{maBaiHoc}")] -> [FromForm]
export const capNhatBaiHoc = async (_maGiangVien: number, maBaiHoc: number, dto: BaiHocCreateUpdate) => {
  const res: any = await axiosClient.put(`${BASE}/cap-nhat-video/${maBaiHoc}`, toFormData(dto));
  return res?.success ?? true;
};

// [HttpDelete("xoa-video/{maBaiHoc}")]
export const xoaBaiHoc = async (_maGiangVien: number, maBaiHoc: number) => {
  const res: any = await axiosClient.delete(`${BASE}/xoa-video/${maBaiHoc}`);
  return res?.success ?? true;
};

// [HttpPut("chapters/{maChuong}/lessons/reorder")]
export const reorderBaiHoc = async (_maGiangVien: number, maChuong: number, payload: ReorderBaiHocPayload) => {
  await axiosClient.put(`${BASE}/chapters/${maChuong}/lessons/reorder`, payload.lessonOrders);
  return true;
};

// ==============================
//  YOUTUBE IMPORT
// ==============================

// [HttpPost("youtube/playlist/analyze")]
export const analyzePlaylist = async (dto: PlaylistAnalyzeRequest) => {
  const res: any = await axiosClient.post(`${BASE}/youtube/playlist/analyze`, dto);
  if (res && res.success !== undefined && !res.success) throw new Error(res.message || 'API request failed');
  return (res?.playlistInfo ?? res?.data ?? res) as PlaylistAnalyzeResult;
};

// [HttpGet("youtube/playlist/{playlistId}/videos")]
export const getPlaylistVideos = async (playlistId: string) => {
  const res: any = await axiosClient.get(`${BASE}/youtube/playlist/${playlistId}/videos`);
  if (res && res.success !== undefined && !res.success) throw new Error(res.message || 'API request failed');
  return (res?.videos ?? res?.data ?? res) as YouTubeVideoItem[];
};

// [HttpPost("courses/{maKhoaHoc}/youtube/playlist/import")]
export const importPlaylist = async (dto: PlaylistImportRequest) => {
  const res: any = await axiosClient.post(`${BASE}/courses/${dto.maKhoaHoc}/youtube/playlist/import`, dto);
  if (res && res.success !== undefined && !res.success) throw new Error(res.message || 'API request failed');
  return (res ?? res?.data) as PlaylistImportResult;
};

