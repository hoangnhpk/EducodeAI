import axiosClient from '@/configs/axios'
import { type NguoiDung } from '@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO'

export interface NguoiDungFilter {
    page?: number
    pageSize?: number
    keyword?: string
    vaiTro?: number   // 1=Giảng viên, 2=Học viên; bỏ trống = cả hai
    trangThai?: string
}

export interface PagedNguoiDung {
    total: number
    data: NguoiDung[]
}

export const NguoiDungService = {
    // H.7: filter + pagination server-side. Backend trả { total, data }.
    async layDanhSach(filter: NguoiDungFilter = {}): Promise<PagedNguoiDung> {
        const params: Record<string, any> = {
            Page: filter.page ?? 1,
            PageSize: filter.pageSize ?? 10,
        }
        if (filter.keyword) params.Keyword = filter.keyword
        if (filter.vaiTro) params.VaiTro = filter.vaiTro
        if (filter.trangThai) params.TrangThai = filter.trangThai
        return await axiosClient.get<PagedNguoiDung>('/api/nguoi-dung', { params }) as unknown as PagedNguoiDung
    },

    async themNguoiDung(data: any) {
        return axiosClient.post('/api/nguoi-dung/them-nguoi-dung', data)
    },

    async capNhatNguoiDung(maNguoiDung: string, data: any) {
        return axiosClient.put(`/api/nguoi-dung/sua-nguoi-dung/${maNguoiDung}`, data)
    },

    async thayDoiTrangThai(maNguoiDung: string, lyDo: string = "", thoiHan: string = "") {
        return axiosClient.put(`/api/nguoi-dung/khoa-nguoi-dung/${maNguoiDung}?lyDo=${encodeURIComponent(lyDo)}&thoiHan=${encodeURIComponent(thoiHan)}`)
    },

    async xoaNguoiDung(maNguoiDung: string) {
        return axiosClient.delete(`/api/nguoi-dung/xoa-nguoi-dung/${maNguoiDung}`)
    }
}
