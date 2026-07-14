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
  CauHoiChungChi,
} from '@/pages/giang-vien/khoa-hoc-cua-toi/types';

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
  if (!res || res.success === false) return 0;
  return Number(res.maKhoaHoc || res.data?.maKhoaHoc || res.data || 0);
};

// [HttpPost("upload-hinh-anh")]
export const uploadHinhAnhKhoaHoc = async (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  const res: any = await axiosClient.post(`${BASE}/upload-hinh-anh`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res?.url as string;
};

// [HttpPost("upload-video-gioi-thieu")]
export const uploadVideoGioiThieuKhoaHoc = async (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  const res: any = await axiosClient.post(`${BASE}/upload-video-gioi-thieu`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res?.url as string;
};

// [HttpPut("cap-nhat/{maKhoaHoc}")] -> [FromForm]
export const capNhatKhoaHoc = async (_maGiangVien: number, maKhoaHoc: number, dto: KhoaHocCreateUpdate) => {
  const res: any = await axiosClient.put(`${BASE}/cap-nhat/${maKhoaHoc}`, toFormData(dto));
  return res?.success ?? true;
};

export const xoaKhoaHoc = async (_maGiangVien: number, maKhoaHoc: number): Promise<any> => {
  const url = `${BASE}/xoa-mem/${maKhoaHoc}`;
  return axiosClient.delete(url);
};

export const restoreKhoaHoc = async (_maGiangVien: number, maKhoaHoc: number): Promise<any> => {
  const url = `${BASE}/${maKhoaHoc}/restore`;
  return axiosClient.put(url, {});
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
  const res = await axiosClient.post(`${BASE}/tao-de-chung-chi-ai/${maKhoaHoc}`, undefined, { timeout: 120000 });
  return extractData<KetQuaTaoDeChungChiAI>(res);
};

// [HttpGet("de-chung-chi/{maKhoaHoc}")]
export const getDeChungChi = async (_maGiangVien: number, maKhoaHoc: number) => {
  const res = await axiosClient.get(`${BASE}/de-chung-chi/${maKhoaHoc}`);
  return extractData<CauHoiChungChi[]>(res);
};

// [HttpPut("de-chung-chi/{maKhoaHoc}")]
export const updateDeChungChi = async (_maGiangVien: number, maKhoaHoc: number, data: CauHoiChungChi[]) => {
  const res: any = await axiosClient.put(`${BASE}/de-chung-chi/${maKhoaHoc}`, data);
  return res.data;
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

// [HttpPost("them-file/{maChuong}")]
export const themBaiHocFile = async (maChuong: number, dto: any) => {
  const fd = new FormData();
  if(dto.tieuDe) fd.append('TieuDe', dto.tieuDe);
  if(dto.moTa) fd.append('MoTa', dto.moTa);
  if(dto.file) fd.append('File', dto.file);
  fd.append('ThuTu', dto.thuTu.toString());
  
  const res = await axiosClient.post(`${BASE}/them-file/${maChuong}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return extractData<BaiHocResponse>(res);
};

// [HttpPut("cap-nhat-file/{maBaiHoc}")]
export const capNhatBaiHocFile = async (maBaiHoc: number, dto: any) => {
  const fd = new FormData();
  if(dto.tieuDe) fd.append('TieuDe', dto.tieuDe);
  if(dto.moTa) fd.append('MoTa', dto.moTa);
  if(dto.file) fd.append('File', dto.file);
  fd.append('ThuTu', dto.thuTu.toString());

  const res: any = await axiosClient.put(`${BASE}/cap-nhat-file/${maBaiHoc}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res?.success ?? true;
};

// [HttpDelete("xoa-video/{maBaiHoc}")]
// Trả về message từ backend để hiển thị rõ kết quả xóa tài nguyên Cloudinary
// (video + phụ đề). Khi có tài nguyên sót lại trên Cloud, message sẽ cảnh báo cần dọn tay.
export const xoaBaiHoc = async (_maGiangVien: number, maBaiHoc: number): Promise<{ success: boolean; message: string }> => {
  const res: any = await axiosClient.delete(`${BASE}/xoa-video/${maBaiHoc}`);
  return { success: res?.success ?? true, message: res?.message ?? '' };
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


