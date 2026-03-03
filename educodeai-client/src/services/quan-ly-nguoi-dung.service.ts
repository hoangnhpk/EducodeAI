import axiosClient from '@/configs/axios'
import { type NguoiDung } from '@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO'

export const NguoiDungService = {
    async layDanhSach(): Promise<NguoiDung[]> {
        return await axiosClient.get<NguoiDung[]>('/nguoi-dung')
    },

    async themNguoiDung(data: any) {
        return axiosClient.post('/nguoi-dung/them-nguoi-dung', data)
    },

    async capNhatNguoiDung(maNguoiDung: string, data: any) {
        return axiosClient.put(`/nguoi-dung/sua-nguoi-dung/${maNguoiDung}`, data)
    },

    async thayDoiTrangThai(maNguoiDung: string) {
        return axiosClient.put(`/nguoi-dung/khoa-nguoi-dung/${maNguoiDung}`)
    },

    async xoaNguoiDung(maNguoiDung: string) {
        return axiosClient.delete(`/nguoi-dung/xoa-nguoi-dung/${maNguoiDung}`)
    }
}
