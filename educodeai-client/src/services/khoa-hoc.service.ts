
import axiosClient from '@/configs/axios'
import type { KhoaHocData, BaiHoc, ChuongHoc, GhiChuItem } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO'
export interface LuuGhiChuDTO {
  MaBaiHoc: number;
  MaNguoiDung: number;
  ThoiGianVideo: number;
  NoiDung: string;
}

export interface LuuTienDoDTO {
  MaBaiHoc: number;
  MaNguoiDung: number;
  DaXem: boolean;
  ThoiGianHoc: number;
}

export interface ChiTietCauTraLoiDTO {
    IdCauHoi: number;
    IndexLuaChon: number;
}

export interface LuuKetQuaQuizDTO {
  MaBaiHoc: number;
  MaBaiTap: number;
  MaNguoiDung: number;
  DiemSo: number;
  SoCauDung: number;
  TongSoCau: number;
  DaDat: boolean;
  ChiTietLamBai: ChiTietCauTraLoiDTO[];
}

export const KhoaHocService = {
  async layDuLieuKhoaHoc(khoaHocId: number): Promise<KhoaHocData> {
    try {
      return await axiosClient.get<KhoaHocData>(`/api/NoiDungKhoaHoc/${khoaHocId}`);
    } catch (error) {
      console.error('❌ Lỗi lấy dữ liệu khóa học:', error)
      throw new Error('Không thể tải dữ liệu khóa học')
    }
  },

  async layDanhSachGhiChu(maBaiHoc: number, maNguoiDung: number): Promise<GhiChuItem[]> {
    try {
      // Lưu ý: Type Generic ở đây là GhiChuItem[] chứ không phải KhoaHocData
      return await axiosClient.get<GhiChuItem[]>(`/api/NoiDungKhoaHoc/lay-ds-ghi-chu/${maBaiHoc}/${maNguoiDung}`);
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách ghi chú:', error);
      // Trả về mảng rỗng để UI không bị crash, hoặc throw tùy logic của bạn
      return [];
    }
  },

  async luuGhiChu(payload: LuuGhiChuDTO): Promise<boolean> {
    try {
      await axiosClient.post('/api/NoiDungKhoaHoc/luu-ghi-chu', payload);
      return true; // Trả về true nếu thành công
    } catch (error) {
      console.error('❌ Lỗi lưu ghi chú:', error);
      throw error; // Ném lỗi ra để Component bắt được và hiện SweetAlert
    }
  },

  async luuTienDo(payload: LuuTienDoDTO): Promise<void> {
    try {
      await axiosClient.post('/api/NoiDungKhoaHoc/luu-tien-do', payload);
    } catch (error) {
      // Log lỗi nhưng không cần throw để chặn luồng video (vì lưu tiến độ có thể fail ngầm)
      console.error('❌ Lỗi lưu tiến độ:', error);
    }
  },

  async luuKetQuaQuiz(payload: LuuKetQuaQuizDTO): Promise<boolean> {
    try {
      await axiosClient.post('/api/NoiDungKhoaHoc/BaiTap/luu-ket-qua-quiz', payload);
      return true;
    } catch (error) {
      console.error("❌ Lỗi lưu kết quả Quiz:", error);
      return false;
    }
  },

  lamPhangDanhSachBaiHoc(cacChuong: ChuongHoc[]): BaiHoc[] {
    return cacChuong.flatMap(chuong =>
      chuong.danhSachBaiHoc.map(bai => ({
        ...bai,
        maChuong: chuong.id
      }))
    )
  },



  timBaiHocTheoId(
    dsPhang: BaiHoc[],
    id: number
  ): BaiHoc | undefined {
    return dsPhang.find(b => b.id === id)
  },


  timBaiTiepTheo(
    dsPhang: BaiHoc[],
    idBaiHocHienTai: number
  ): number | null {
    const idx = dsPhang.findIndex(b => b.id === idBaiHocHienTai)
    if (idx === -1 || idx >= dsPhang.length - 1) return null
    return dsPhang[idx + 1].id
  },


  timBaiTruoc(
    dsPhang: BaiHoc[],
    idBaiHocHienTai: number
  ): number | null {
    const idx = dsPhang.findIndex(b => b.id === idBaiHocHienTai)
    if (idx <= 0) return null
    return dsPhang[idx - 1].id
  },

  tinhPhanTramTienDo(
    dsPhang: BaiHoc[],
    idHienTai: number
  ): number {
    if (dsPhang.length === 0) return 0

    const idx = dsPhang.findIndex(b => b.id === idHienTai)
    if (idx === -1) return 0

    return Math.round(((idx + 1) / dsPhang.length) * 100)
  },
  getDanhSachKhoaHocGiangVien: async (maGiangVien: number) => {
    const res = await axiosClient.get(`/danh-sach/${maGiangVien}`);
    return res;
  },
  getChiTietKhoaHoc: async (id: number) => {
    const res = await axiosClient.get(`/chi-tiet/${id}`);
    return res;
  }
}
