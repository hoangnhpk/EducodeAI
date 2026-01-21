import axiosClient from '@/configs/axios'
import type { KhoaHocData, BaiHoc, ChuongHoc } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO'

export const KhoaHocService = {
  async layDuLieuKhoaHoc(khoaHocId: number): Promise<KhoaHocData> {
    try {
      return await axiosClient.get<KhoaHocData>(
        `/api/NoiDungKhoaHoc/${khoaHocId}`
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

/**
 * Tìm ID bài học tiếp theo
 */
timBaiTiepTheo(
  dsPhang: BaiHoc[],
  idBaiHocHienTai: number
): number | null {
  const idx = dsPhang.findIndex(b => b.id === idBaiHocHienTai)
  if (idx === -1 || idx >= dsPhang.length - 1) return null
  return dsPhang[idx + 1].id
},

/**
 * Tìm ID bài học trước đó
 */
timBaiTruoc(
  dsPhang: BaiHoc[],
  idBaiHocHienTai: number
): number | null {
  const idx = dsPhang.findIndex(b => b.id === idBaiHocHienTai)
  if (idx <= 0) return null
  return dsPhang[idx - 1].id
},

/**
 * Tính % tiến độ học tập
 */
tinhPhanTramTienDo(
  dsPhang: BaiHoc[],
  idHienTai: number
): number {
  if (dsPhang.length === 0) return 0

  const idx = dsPhang.findIndex(b => b.id === idHienTai)
  if (idx === -1) return 0

  return Math.round(((idx + 1) / dsPhang.length) * 100)
},

// ==================================
// 3. NGHIỆP VỤ – QUIZ (TRẮC NGHIỆM)
// ==================================

chamDiemTracNghiem(
  questions: {
    question: string
      options: string[]
      answer: number
  }[],
  userAnswers: Record<number, number>
) {
  let soCauDung = 0

  questions.forEach((q, index) => {
    if (userAnswers[index] === q.answer) {
      soCauDung++
    }
  })

  return {
    score: soCauDung,
    total: questions.length,
    passed: soCauDung >= questions.length * 0.5 // ≥ 50% là đạt
  }
},

  // ==================================
  // 4. IDE – GIẢ LẬP CHẠY CODE
  // ==================================

  async chayCodeIDE(
  code: string,
  input: string
): Promise < string > {
  // Giả lập thời gian xử lý
  await new Promise(resolve => setTimeout(resolve, 800))

    // Giả lập kết quả (demo)
    if(input === '3 4') return '7'
if (input === '10 20') return '30'

return 'Error: Code logic wrong'
  }
}
