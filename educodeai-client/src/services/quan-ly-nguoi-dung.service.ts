import axiosClient from '@/configs/axios'
import { type NguoiDung } from '@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO'

export const NguoiDungService = {
    async layDanhSach(): Promise<NguoiDung[]> {
        return await axiosClient.get<NguoiDung[]>('/api/nguoi-dung')
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
