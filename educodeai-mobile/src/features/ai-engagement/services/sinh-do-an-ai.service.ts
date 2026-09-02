import api from '../../../shared/configs/api';

export interface SinhDoAnRequest { mucTieuNgheNghiep: string; ngonNguCongNghe: string; capDo: string }
export interface YeuCauChucNangDoAn { ngay: number; tenChucNang: string; trangThai: string; diem: number; nhanXet: string; chiTietYeuCau: string; goiYFileNop: string }
export interface SinhDoAnResponse { maDoAn: number; tenDoAn: string; moTa: string; yeuCauChucNang: YeuCauChucNangDoAn[]; cauTrucDatabase: string }
export interface NopDoAnRequest { maDoAn?: number; tenDoAn: string; moTa: string; yeuCauChucNang: string[]; cauTrucDatabase: string; mucTieuNgheNghiep: string; ngonNguCongNghe: string; ghiChuThayDoi: string; khoKhan: string; tienDoHoanThanh: string }
export interface NopDoAnResponse { maDoAn: number; sessionId: string; cauHoiDauTien: string; message: string }
const AI_TIMEOUT=120000;
export const SinhDoAnAIService={
 async generate(request:SinhDoAnRequest){const response=await api.post<SinhDoAnResponse>('/SinhDoAnAI/generate',request,{timeout:AI_TIMEOUT});const data=response.data;if(!data?.tenDoAn?.trim()||!data.moTa?.trim()||!Array.isArray(data.yeuCauChucNang)||!data.cauTrucDatabase?.trim())throw new Error('INVALID_PROJECT_RESPONSE');return data;},
 async submit(request:NopDoAnRequest){const response=await api.post<NopDoAnResponse>('/SinhDoAnAI/nop-do-an',request,{timeout:AI_TIMEOUT});const data=response.data;if(!data?.sessionId?.trim()||!data.cauHoiDauTien?.trim())throw new Error('INVALID_INTERVIEW_SESSION');return data;},
};
