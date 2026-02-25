
import axiosClient from '@/configs/axios'
import type { KhoaHocData, BaiHoc, ChuongHoc } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO'

export const KhoaHocService = {
  async layDuLieuKhoaHoc(khoaHocId: number): Promise<KhoaHocData> {
    try {
      return await axiosClient.get<KhoaHocData>(
        `/NoiDungKhoaHoc/${khoaHocId}`
      )
    } catch (error) {
  console.error('❌ Lỗi lấy dữ liệu khóa học:', error)
  throw new Error('Không thể tải dữ liệu khóa học')
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
};