// src/features/TrinhPhatKhoaHoc/services/KhoaHocService.ts
import axiosClient from '@/configs/axios'
// import { KhoaHocData, BaiHoc, ChuongHoc } from '@/pages/hoc-vien/noi-dung-khoa-hoc/DuLieuHocTap'
import type  { KhoaHocData} from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO'
export const KhoaHocService = {
  async layDuLieuKhoaHoc(khoaHocId: number): Promise<KhoaHocData> {
    try {
      return await axiosClient.get(`/api/NoiDungKhoaHoc/${khoaHocId}`)
    } catch (error) {
      console.error('Lỗi lấy dữ liệu khóa học:', error)
      throw new Error('Không thể tải khóa học')
    }
  },

//   async chayCodeOnline(code: string, language: string): Promise<string> {
//     try {
//       const res = await axiosClient.post('/api/compiler/run', {
//         code,
//         language,
//       })
//       return res.output
//     } catch (error) {
//       console.error('Lỗi chạy code:', error)
//       throw new Error('Chạy code thất bại')
//     }
//   },

//   // ================= LOCAL LOGIC =================
//   layDanhSachBaiHocPhang(cacChuong: ChuongHoc[]): BaiHoc[] {
//     return cacChuong.flatMap(chuong => chuong.baiHocs)
//   },

//   timBaiHoc(ds: BaiHoc[], id: number): BaiHoc | undefined {
//     return ds.find(b => b.id === id)
//   },

//   layIdTiepTheo(ds: BaiHoc[], id: number): number | null {
//     const idx = ds.findIndex(b => b.id === id)
//     return idx >= 0 && idx < ds.length - 1 ? ds[idx + 1].id : null
//   },

//   layIdTruoc(ds: BaiHoc[], id: number): number | null {
//     const idx = ds.findIndex(b => b.id === id)
//     return idx > 0 ? ds[idx - 1].id : null
//   },
}
